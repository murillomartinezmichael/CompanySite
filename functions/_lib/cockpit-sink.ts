// CockpitCloud lead-sink helper — Rung VI EXPAND (Book V Rung VII fleet bond).
//
// Env-gated pattern (mirrors SiteGuide's Stripe webhook sink and CompanySite's
// Resend sender): when `COCKPIT_INGEST_URL` is unset the forward is skipped
// silently. When set, /api/lead POSTs a compact Lead card JSON to that URL.
// Optional `COCKPIT_INGEST_TOKEN` becomes a `Authorization: Bearer <token>`
// header so the CockpitCloud side can authenticate the incoming leads.
//
// Failure modes are non-blocking on the primary /api/lead response — the
// helper returns a result object the caller structures into its log line,
// but never throws or delays a 200 to the browser. If CockpitCloud is down
// the visitor still gets their Resend admin/reply pair (or, without Resend,
// still gets the honest 200 with graceful degrade).
//
// Idempotency: the caller supplies an id. Recommended shape (kept out of this
// helper so it stays pure and testable): a hash of stable Lead fields so a
// double-invocation of the CF Worker doesn't create two cards.

import type { Lead } from './validate';

export type CockpitSinkEnv = {
  COCKPIT_INGEST_URL?: string;
  COCKPIT_INGEST_TOKEN?: string;
};

export type CockpitSinkResult =
  | { ok: true; status: number }
  | { ok: false; skipped: true }
  | { ok: false; status?: number; error?: string };

export const COCKPIT_SINK_TIMEOUT_MS = 6_000;

/** Build the JSON body posted to CockpitCloud. Kept as a separate export so
 *  tests can assert the exact wire shape without spinning up a fetch mock. */
export function buildCockpitLeadCard(id: string, lead: Lead, ip: string): Record<string, unknown> {
  return {
    kind: 'lead',
    id,
    at: new Date().toISOString(),
    source: lead.source,
    name: lead.name,
    email: lead.email,
    businessType: lead.businessType,
    currentUrl: lead.currentUrl ?? null,
    frustration: lead.frustration,
    // Meta — helps triage at a glance in the kanban without opening the card
    meta: {
      frustrationLength: lead.frustration.length,
      hasCurrentUrl: Boolean(lead.currentUrl),
      ip,
    },
  };
}

/** POST a lead card to COCKPIT_INGEST_URL. Silently skips when the env var
 *  is unset (feature-flag off). Never throws — caller reads the result. */
export async function sendToCockpit(
  env: CockpitSinkEnv,
  id: string,
  lead: Lead,
  ip: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CockpitSinkResult> {
  const url = env.COCKPIT_INGEST_URL?.trim();
  if (!url) return { ok: false, skipped: true };

  // Guard: any URL that doesn't parse cleanly counts as misconfigured →
  // treat as skipped (never a 500 for a typo in Cloudflare vars).
  try { new URL(url); } catch { return { ok: false, skipped: true }; }

  const body = buildCockpitLeadCard(id, lead, ip);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COCKPIT_SINK_TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Cockpit-Kind': 'lead',
        ...(env.COCKPIT_INGEST_TOKEN
          ? { Authorization: `Bearer ${env.COCKPIT_INGEST_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(body),
    });
    return res.ok ? { ok: true, status: res.status } : { ok: false, status: res.status };
  } catch (e) {
    // AbortError (timeout), network error, DNS — all collapse to a single
    // caller-friendly result. Never surface raw errors to the browser.
    return { ok: false, error: e instanceof Error ? e.name : 'unknown_error' };
  } finally {
    clearTimeout(timer);
  }
}

/** Stable idempotency key from Lead fields — same lead → same id, so
 *  CockpitCloud can dedupe if the CF Worker double-invokes. Not a security
 *  primitive; use a proper hash if you need one (this is a low-collision
 *  poor-man's hash safe for a workers-runtime with no crypto.subtle sync). */
export function leadIdempotencyKey(lead: Lead): string {
  // Stringify a canonicalized subset (order-stable) then apply a lightweight
  // 32-bit rolling hash. Two identical leads land the same id.
  const stable = `${lead.email}|${lead.businessType}|${lead.frustration.slice(0, 120)}`;
  let h = 2166136261;
  for (let i = 0; i < stable.length; i++) {
    h ^= stable.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Convert to unsigned 32-bit hex, pad-left to 8 chars
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return `lead_${hex}`;
}
