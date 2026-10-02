type InquiryPayload = Readonly<Record<string, string | number | boolean | null>>;

type RetryState = { key: string; fingerprint: string; status: 'uncertain' | 'accepted' };
type RetryStorage = Pick<Storage, 'getItem' | 'setItem'>;
type RetryOptions = { scope: string; storage?: () => RetryStorage };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH = /^[0-9a-f]{64}$/;
const MAX_ATTEMPTS = 16;
const canonical = (data: InquiryPayload) => JSON.stringify(Object.keys(data).sort().map(key => [key, data[key]]));

export class InquiryRetryError extends Error {
  constructor(readonly code: 'changed' | 'confirmed' | 'storage' | 'invalid' | 'limit' | 'secure') { super(code); }
}

async function fingerprint(data: InquiryPayload): Promise<string> {
  try {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(data)));
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  } catch { throw new InquiryRetryError('secure'); }
}

export function inquiryErrorMessage(error: unknown): string {
  if (error instanceof InquiryRetryError) {
    if (error.code === 'changed') return 'The earlier inquiry may already be saved. Restore its original details to retry, or deliberately start a separate inquiry below.';
    if (error.code === 'confirmed') return 'This inquiry was already confirmed in this tab. No new request was made. Start a separate inquiry below only if you intend another request.';
    if (error.code === 'limit') return 'This tab has reached its retry-reference limit. Earlier inquiries may already be saved. Keep this tab open and use the email contact option.';
    return 'No request was made this time because the browser could not safely retain the retry reference. Earlier attempts may already be saved. Keep this tab open and email murillomartinezmichael@gmail.com for help.';
  }
  return 'Something broke on send. Delivery was not confirmed; the inquiry may already be saved. Retry the same details in this tab. Closing it or clearing browser data loses the retry reference. Email murillomartinezmichael@gmail.com for help.';
}

/** Only the lead endpoint's explicit application receipt confirms submission. */
export async function isInquiryAccepted(response: Response): Promise<boolean> {
  if (response.status !== 200 || response.redirected
    || response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return false;
  try {
    const receipt: unknown = await response.json();
    return receipt !== null && typeof receipt === 'object' && !Array.isArray(receipt)
      && (receipt as Record<string, unknown>).ok === true;
  } catch { return false; }
}

/** Storage contains only random keys, one-way fingerprints and status. Closing the
 * tab or clearing its storage loses recovery; no inquiry payload is persisted. */
export function createInquirySubmission(createUUID: () => string = () => crypto.randomUUID(), options?: RetryOptions) {
  // An earlier attempt may have been stored even when its response was lost.
  // Remember every attempted payload until success, including edited/reverted ones.
  const attempts = new Map<string, string>();
  let records: RetryState[] = [];
  let separateFingerprint: string | undefined;
  const storageKey = `m3.inquiry.retry.v1:${options?.scope}`;

  function read(): RetryState[] {
    let raw: string | null;
    try { raw = (options?.storage?.() ?? window.sessionStorage).getItem(storageKey); }
    catch { throw new InquiryRetryError('storage'); }
    if (raw === null) {
      // Clearing storage mid-session must not silently allocate replacement IDs.
      if (records.length) throw new InquiryRetryError('storage');
      return [];
    }
    try {
      if (raw.length > 4096) throw new Error();
      const value: unknown = JSON.parse(raw);
      if (!Array.isArray(value) || !value.length || value.length > MAX_ATTEMPTS) throw new Error();
      const keys = new Set<string>(); const hashes = new Set<string>();
      for (const record of value) {
        if (!record || typeof record !== 'object' || Array.isArray(record)
          || Object.keys(record).sort().join(',') !== 'fingerprint,key,status'
          || typeof record.key !== 'string' || !UUID.test(record.key)
          || typeof record.fingerprint !== 'string' || !HASH.test(record.fingerprint)
          || !['uncertain', 'accepted'].includes(record.status)
          || keys.has(record.key.toLowerCase()) || hashes.has(record.fingerprint)) throw new Error();
        keys.add(record.key.toLowerCase()); hashes.add(record.fingerprint);
      }
      // Detect replacement/removal, including another form instance on this page.
      if (records.some(old => !value.some(next => old.key === next.key && old.fingerprint === next.fingerprint))) throw new Error();
      return value as RetryState[];
    } catch { throw new InquiryRetryError('invalid'); }
  }
  function write(next: RetryState[]): void {
    try {
      const storage = options?.storage?.() ?? window.sessionStorage;
      const raw = JSON.stringify(next);
      storage.setItem(storageKey, raw);
      if (storage.getItem(storageKey) !== raw) throw new Error();
    } catch { throw new InquiryRetryError('storage'); }
  }

  return {
    keyFor(data: InquiryPayload): string {
      const payload = canonical(data);
      let key = attempts.get(payload);
      if (key === undefined) {
        key = createUUID();
        attempts.set(payload, key);
      }
      return key;
    },
    async prepare(data: InquiryPayload): Promise<{ key: string; accepted: boolean }> {
      if (!options) return { key: this.keyFor(data), accepted: false };
      const hash = await fingerprint(data);
      records = read();
      let record = records.find(item => item.fingerprint === hash);
      if (record?.status === 'accepted' && separateFingerprint === hash) {
        // Explicit separate inquiry supersedes only this confirmed identity.
        record = { key: createUUID(), fingerprint: hash, status: 'uncertain' };
        if (!UUID.test(record.key)) throw new InquiryRetryError('secure');
        records = records.map(item => item.fingerprint === hash ? record! : item);
      }
      if (!record) {
        if (records.length && separateFingerprint !== hash) throw new InquiryRetryError('changed');
        if (records.length >= MAX_ATTEMPTS) throw new InquiryRetryError('limit');
        record = { key: createUUID(), fingerprint: hash, status: 'uncertain' };
        if (!UUID.test(record.key)) throw new InquiryRetryError('secure');
        records = [...records, record];
      }
      write(records); // Read-back proof BEFORE network; failure sends nothing this time.
      separateFingerprint = undefined;
      return { key: record.key, accepted: record.status === 'accepted' };
    },
    async allowSeparate(data: InquiryPayload): Promise<void> {
      // Called only after the visitor confirms; never erases older A→B→A IDs.
      separateFingerprint = await fingerprint(data);
    },
    markAccepted(key: string): boolean {
      if (!options) return true;
      records = records.map(record => record.key === key ? { ...record, status: 'accepted' } : record);
      // The server has accepted. Storage failure must NEVER turn that into a
      // false "nothing sent" error or unlock the current page for a new send.
      try { const saved = read(); write(saved.map(record => record.key === key ? { ...record, status: 'accepted' } : record)); return true; }
      catch { return false; }
    },
    reset(): void {
      attempts.clear();
    },
  };
}

/** Explicitly authorizes a separate payload; the button itself sends nothing. */
export function showInquiryRecovery(form: HTMLFormElement, status: HTMLElement, error: unknown, allow: () => Promise<void>): void {
  form.ownerDocument.getElementById(`${form.id}-new-inquiry`)?.remove();
  if (!(error instanceof InquiryRetryError) || !['changed', 'confirmed'].includes(error.code)) return;
  const button = form.ownerDocument.createElement('button');
  button.type = 'button'; button.id = `${form.id}-new-inquiry`;
  button.dataset.cta = 'separate-inquiry'; button.className = 'btn-primary';
  button.textContent = 'Start a separate inquiry';
  button.addEventListener('click', async () => {
    if (form.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled) return;
    if (!window.confirm('The earlier inquiry may already be saved. Start a genuinely separate inquiry? This can create a duplicate.')) return;
    try { await allow(); status.textContent = 'Review these details, then press Send. This button has not sent a request.'; button.remove(); }
    catch (cause) { status.textContent = inquiryErrorMessage(cause); }
  });
  status.insertAdjacentElement('afterend', button);
}
