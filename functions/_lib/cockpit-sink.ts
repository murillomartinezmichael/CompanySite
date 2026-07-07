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

/** Build the JSON body posted to CockpitCloud's `POST /v1/events` endpoint.
 *  Matches `Backend/schemas.py::EventIn` shape verbatim so the receiver
 *  consumes it without transformation — the bond only works when the two
 *  sides agree on the wire.
 *
 *  Field limits per EventIn (2026-07-07 CockpitCloud commit 5527302):
 *    source     1-64 chars    (required)
 *    kind       lead|sale|deploy|incident|milestone (required)
 *    name       1-255 chars   (required)
 *    next_step  ≤ 4000 chars  (default empty)
 *    link       ≤ 2000 chars  (default empty)
 *    link_label ≤ 64 chars    (default empty)
 *
 *  We compose `next_step` as the triage-at-a-glance payload since that's the
 *  card field surfaced in the kanban preview. The idempotency key travels in
 *  the log line, not the body (CockpitCloud comment: "caller is idempotent").
 */
export function buildCockpitLeadCard(_id: string, lead: Lead, ip: string): Record<string, unknown> {
  // source — combine the CompanySite section + the hero source so triage
  // knows both where the visitor came from and which surface produced them.
  const source = `companysite:${lead.source}`.slice(0, 64);

  // name — client name + business type, capped at 255. Shown as the card title.
  const name = `${lead.name} — ${lead.businessType}`.slice(0, 255);

  // next_step — the human-actionable summary. Mike glances this and knows
  // whether to reply now or later. Truncated at 4000 to satisfy the schema.
  const parts = [
    `Reply within 24h.`,
    `Email: ${lead.email}`,
    lead.currentUrl ? `Their site: ${lead.currentUrl}` : null,
    ``,
    `Frustration:`,
    lead.frustration,
    ``,
    `Source IP: ${ip}`,
  ].filter((s) => s !== null);
  const next_step = parts.join('\n').slice(0, 4000);

  // link — click-through target for triage; their site if they gave one.
  const link = (lead.currentUrl ?? '').slice(0, 2000);
  const link_label = lead.currentUrl ? 'Their site' : '';

  return {
    source,
    kind: 'lead',
    name,
    next_step,
    link,
    link_label,
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
