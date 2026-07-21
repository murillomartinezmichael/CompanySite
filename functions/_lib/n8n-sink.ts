// Optional n8n lead sink — fire-and-forget from /api/lead.
//
// When `N8N_LEAD_WEBHOOK_URL` is set (Cloudflare Pages env), every accepted
// intake POSTs a compact JSON payload to that webhook. Unset = no-op (same
// feature-flag pattern as CockpitCloud). Never blocks the visitor 200.
//
// Optional `N8N_LEAD_WEBHOOK_SECRET` is sent as `X-M3-Webhook-Secret` so the
// n8n side can reject random internet noise (Header Auth / IF node).

import type { Lead } from './validate';

export type N8nSinkEnv = {
  N8N_LEAD_WEBHOOK_URL?: string;
  N8N_LEAD_WEBHOOK_SECRET?: string;
};

export type N8nSinkResult =
  | { ok: true; status: number }
  | { ok: false; skipped: true }
  | { ok: false; status?: number; error?: string };

export const N8N_SINK_TIMEOUT_MS = 6_000;

/** Score 0–100 for triage. Higher = reply sooner. Pure + unit-tested. */
export function scoreLead(lead: Lead): number {
  let score = 20;
  const frustration = lead.frustration.trim();
  if (frustration.length >= 40) score += 15;
  if (frustration.length >= 120) score += 10;
  if (lead.currentUrl) score += 20;
  const intent = (lead.intent || '').toLowerCase();
  if (intent.startsWith('checkout:')) score += 40;
  if (intent.includes('website') || intent.includes('business') || intent.includes('custom')) {
    score += 20;
  }
  if (intent.includes('siteguide') || intent.includes('template')) {
    score += 10;
  }
  if (intent.includes('audit') || intent.includes('review') || intent.includes('free')) {
    score += 15;
  }
  const src = (lead.utm_source || lead.source || '').toLowerCase();
  if (src.includes('tiktok') || src.includes('instagram') || src.includes('ig')) {
    score += 10;
  }
  return Math.min(100, score);
}

export function buildN8nLeadPayload(
  id: string,
  lead: Lead,
  ip: string,
): Record<string, unknown> {
  const score = scoreLead(lead);
  const hot = score >= 60;
  return {
    event: 'm3.lead.received',
    id,
    score,
    hot,
    triage: hot
      ? 'HOT — reply within a few hours if you can.'
      : 'Normal — reply within 24h.',
    lead: {
      name: lead.name,
      email: lead.email,
      businessType: lead.businessType,
      currentUrl: lead.currentUrl || null,
      frustration: lead.frustration,
      preferredStart: lead.preferredStart || null,
      source: lead.source,
      intent: lead.intent || null,
      utm_source: lead.utm_source || null,
      utm_medium: lead.utm_medium || null,
      utm_campaign: lead.utm_campaign || null,
      utm_content: lead.utm_content || null,
      utm_term: lead.utm_term || null,
    },
    ip,
    receivedAt: new Date().toISOString(),
    replyHint: lead.intent?.startsWith('checkout:')
      ? `Verify the Stripe payment, then reply: Hey ${lead.name.split(/\s+/)[0] || lead.name} — I have your project intake and preferred start window (${lead.preferredStart || 'not specified'}). I’ll confirm the scope and actual build week before work begins.`
      : [
        `Hey ${lead.name.split(/\s+/)[0] || lead.name} — got your note about ${lead.businessType}.`,
        lead.currentUrl
          ? `I peeked at ${lead.currentUrl} and have 2–3 concrete fixes that would help.`
          : `Send me the site URL (or a screenshot) and I’ll give you a blunt 3-bullet take.`,
        `Want a 5-min review this week, or should I just email the notes?`,
      ].join(' '),
  };
}

export async function sendToN8n(
  env: N8nSinkEnv,
  id: string,
  lead: Lead,
  ip: string,
  fetchImpl: typeof fetch = fetch,
): Promise<N8nSinkResult> {
  const url = env.N8N_LEAD_WEBHOOK_URL?.trim();
  if (!url) return { ok: false, skipped: true };

  try {
    new URL(url);
  } catch {
    return { ok: false, skipped: true };
  }

  const body = buildN8nLeadPayload(id, lead, ip);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), N8N_SINK_TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(env.N8N_LEAD_WEBHOOK_SECRET?.trim()
          ? { 'X-M3-Webhook-Secret': env.N8N_LEAD_WEBHOOK_SECRET.trim() }
          : {}),
      },
      body: JSON.stringify(body),
    });
    return res.ok
      ? { ok: true, status: res.status }
      : { ok: false, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.name : 'unknown_error' };
  } finally {
    clearTimeout(timer);
  }
}
