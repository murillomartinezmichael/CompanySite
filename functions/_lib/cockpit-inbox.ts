import { UTM_FIELDS, type Lead } from './validate';

type ValidatedLead = Required<Omit<Lead, 'company_website'>>;
type InboxEnv = {
  COCKPIT_LEAD_INBOX_URL?: string;
  COCKPIT_INGEST_TOKEN?: string;
  COCKPIT_NOTIFICATION_CHANNELS?: string;
};
const NOTIFICATION_CHANNELS = ['acknowledgment_email', 'operator_email', 'workflow'] as const;
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[number];
const DELIVERY_STATES = new Set(['pending', 'processing', 'retry', 'accepted', 'failed', 'uncertain']);
const DELIVERY_ERRORS = new Set([
  '', 'configuration', 'route_changed', 'provider_rejected', 'rate_limited', 'provider_unavailable',
  'transport_uncertain', 'invalid_receipt', 'lease_expired', 'retry_window_elapsed', 'attempts_exhausted', 'unexpected_error',
  'restore_reconciliation', 'reconciled_closed',
]);
export type InboxResult =
  | { ok: true; replayed: boolean; receiptId: string }
  | { ok: false; error: 'configuration' | 'unavailable' | 'invalid_receipt' | 'conflict' };

export const SUBMISSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// CockpitCloud.models.new_id uses uuid.uuid4().hex, unlike browser submission IDs.
const RECEIPT_ID = /^[0-9a-f]{32}$/i;
const MAX_RECEIPT_BYTES = 65_536;
const TIMEOUT_MS = 6_000;

/** Preserve all validated inquiry fields; display truncation never discards context. */
export function inboxPayload(lead: ValidatedLead, channels: readonly NotificationChannel[] = []) {
  return {
    name: lead.name, email: lead.email, message: lead.frustration,
    phone: '', lane: '', status: 'new', followupSent: false,
    company: 'm3mm', projectType: Array.from(lead.businessType).slice(0, 64).join(''),
    budget: '', location: '', source: 'companysite',
    notifications: [...new Set(channels)].sort(),
    context: {
      businessType: lead.businessType, currentUrl: lead.currentUrl,
      preferredStart: lead.preferredStart, referredBy: lead.referredBy,
      intent: lead.intent, originalSource: lead.source,
      ...Object.fromEntries(UTM_FIELDS.map(key => [key, lead[key]])),
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function notificationChannels(configuration: string | undefined): NotificationChannel[] | null {
  if (configuration === undefined) return ['acknowledgment_email', 'operator_email'];
  if (configuration === '') return [];
  const channels = configuration.split(',').map(channel => channel.trim());
  if (channels.length > 3 || new Set(channels).size !== channels.length
    || channels.some(channel => !NOTIFICATION_CHANNELS.includes(channel as NotificationChannel))) return null;
  return (channels as NotificationChannel[]).sort();
}

function matchesNotifications(value: Record<string, unknown>, channels: readonly NotificationChannel[]): boolean {
  // Old storage-only receipts omitted both fields. Never use that exception for requested jobs.
  if (!channels.length && !Object.hasOwn(value, 'notifications') && !Object.hasOwn(value, 'deliveries')) return true;
  const notifications = value.notifications;
  if (!Array.isArray(notifications) || notifications.length !== channels.length
    || !channels.every((channel, index) => notifications[index] === channel)
    || !Array.isArray(value.deliveries) || value.deliveries.length !== channels.length) return false;
  const ids = new Set<string>();
  const roles = new Set<string>();
  return value.deliveries.every(delivery => {
    if (!isObject(delivery) || typeof delivery.id !== 'string' || !RECEIPT_ID.test(delivery.id)
      || typeof delivery.channel !== 'string' || !channels.includes(delivery.channel as NotificationChannel)
      || typeof delivery.state !== 'string' || !DELIVERY_STATES.has(delivery.state)
      || !Number.isSafeInteger(delivery.attempts) || (delivery.attempts as number) < 0
      || typeof delivery.provider_receipt !== 'string' || typeof delivery.error !== 'string'
      || !DELIVERY_ERRORS.has(delivery.error)) return false;
    const id = delivery.id.toLowerCase();
    if (ids.has(id) || roles.has(delivery.channel)) return false;
    ids.add(id);
    roles.add(delivery.channel);
    return true;
  });
}

function matchesReceipt(value: unknown, payload: ReturnType<typeof inboxPayload>): value is { id: string } {
  if (!isObject(value) || typeof value.id !== 'string' || !RECEIPT_ID.test(value.id)
    || typeof value.created_at !== 'string' || !Number.isFinite(Date.parse(value.created_at))) return false;
  const context = value.context;
  if (!isObject(context) || Object.keys(context).length !== Object.keys(payload.context).length) return false;
  const { notifications, ...fields } = payload;
  return matchesNotifications(value, notifications) && Object.entries(fields).every(([key, expected]) => key === 'context'
    ? Object.entries(expected as Record<string, string>).every(([k, v]) => Object.hasOwn(context, k) && context[k] === v)
    : value[key] === expected);
}

/** A 2xx alone is not storage evidence. Timeout covers fetch AND response consumption. */
export async function storeInCockpit(env: InboxEnv, submissionId: string, lead: ValidatedLead): Promise<InboxResult> {
  const channels = notificationChannels(env.COCKPIT_NOTIFICATION_CHANNELS);
  if (channels === null) return { ok: false, error: 'configuration' };
  let url: URL;
  try {
    url = new URL(env.COCKPIT_LEAD_INBOX_URL ?? '');
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search
      || url.pathname !== '/v1/leads/ingest' || !env.COCKPIT_INGEST_TOKEN?.trim()
      || !SUBMISSION_ID.test(submissionId)) return { ok: false, error: 'configuration' };
  } catch { return { ok: false, error: 'configuration' }; }

  const payload = inboxPayload(lead, channels);
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<InboxResult>(resolve => {
    timer = setTimeout(() => {
      controller.abort();
      void reader?.cancel().catch(() => {});
      resolve({ ok: false, error: 'unavailable' });
    }, TIMEOUT_MS);
  });
  const receive = async (): Promise<InboxResult> => {
    try {
      const response = await fetch(url.href, {
        method: 'POST', redirect: 'manual', signal: controller.signal,
        headers: {
          Authorization: `Bearer ${env.COCKPIT_INGEST_TOKEN}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `companysite:${submissionId.toLowerCase()}`,
        },
        body: JSON.stringify(payload),
      });
      if (controller.signal.aborted) {
        void response.body?.cancel().catch(() => {});
        return { ok: false, error: 'unavailable' };
      }
      if (response.status !== 200 && response.status !== 201) {
        void response.body?.cancel().catch(() => {});
        return { ok: false, error: response.status === 409 ? 'conflict' : 'unavailable' };
      }
      if (response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
        || !response.body) {
        void response.body?.cancel().catch(() => {});
        return { ok: false, error: 'invalid_receipt' };
      }
      reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8', { fatal: true });
      let bytes = 0;
      let text = '';
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > MAX_RECEIPT_BYTES) return { ok: false, error: 'invalid_receipt' };
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
      const receipt: unknown = JSON.parse(text);
      if (!matchesReceipt(receipt, payload)) return { ok: false, error: 'invalid_receipt' };
      return { ok: true, replayed: response.status === 200, receiptId: receipt.id };
    } catch { return { ok: false, error: 'unavailable' }; }
    finally { void reader?.cancel().catch(() => {}); }
  };
  try { return await Promise.race([receive(), timeout]); }
  finally { clearTimeout(timer); }
}
