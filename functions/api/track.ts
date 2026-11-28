// POST /api/track — CTA analytics beacon.
//
// Hardening (Rung 1, 2026-07-05):
// - 4 KB body cap (a CTA event should never exceed 2 KB in practice)
// - Accepts application/json OR text/plain (sendBeacon default) OR
//   application/x-www-form-urlencoded (some browsers coerce).
// - Silent 204 on any bad input — never signal "you sent junk"; bots
//   love that signal.
// - Per-IP soft rate limit at 60/min to blunt log-flood attacks.
//   (Real traffic won't approach this from a single IP.)
// - Fields trim + cap; no downstream ingestion so this is defense in
//   depth against absurd log-line lengths.

import { checkRate, rateKey } from '../_lib/rate';
import { parseTrackBody, cleanTrackEvent, TRACK_LIMITS } from '../_lib/track-parse';
import { withSecurityHeaders } from '../_lib/security-headers';
import { readBodyText } from '../_lib/read-body';
import { originAllowed, type CorsEnv } from '../_lib/cors';

type Env = CorsEnv;

const MAX_BODY_BYTES = TRACK_LIMITS.bodyBytes;
const RATE_MAX = 60;
const RATE_WINDOW_S = 60;
// Field caps, the URLSearchParams fallback and the client-ts bound live in
// ../_lib/track-parse.ts so the unit tests exercise the code that runs here.

// `public/_headers` does NOT reach Pages Functions responses — see
// ../_lib/security-headers.ts. Every reply off this beacon sets them itself.
const noContent = () =>
  new Response(null, { status: 204, headers: withSecurityHeaders({ 'Cache-Control': 'no-store' }) });

// Same last-resort funnel as lead.ts: an unhandled throw would be answered by
// Cloudflare's own error page, which carries none of these headers. A beacon
// has nothing to report back, so the safe answer is the hardened 204 it would
// have returned anyway.
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    return await trackPost(ctx);
  } catch {
    return noContent();
  }
};

const trackPost: PagesFunction<Env> = async ({ request, env }) => {
  // The beacon is sent same-origin only (src/lib/track.ts). A foreign page can
  // otherwise make each of its visitors post forged events, one IP apiece, so
  // the per-IP limit below never engages. Same allowlist as /api/lead.
  if (!originAllowed(env, request.headers.get('Origin'))) return noContent();

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Soft rate — even a hostile client can't drown the tail.
  if (!checkRate(rateKey('track', ip), RATE_MAX, RATE_WINDOW_S).ok) return noContent();

  const contentLengthRaw = request.headers.get('Content-Length');
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : NaN;
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return noContent();

  const bodyRead = await readBodyText(request, MAX_BODY_BYTES);
  if (!bodyRead.ok) return noContent();
  const text = bodyRead.text;

  // Never throws: non-object JSON (including `null`) carries no fields, and
  // malformed JSON falls back to URLSearchParams (sendBeacon text bodies).
  const event = cleanTrackEvent(parseTrackBody(text), Date.now());

  const ua = request.headers.get('User-Agent') || 'unknown';
  // Key order is the log contract (tests/functions/track-handler-golden.test.ts).
  console.log(JSON.stringify({
    event: 'cta',
    cta: event.cta,
    section: event.section,
    source: event.source,
    intent: event.intent,
    path: event.path,
    referrer: event.referrer,
    ip,
    ua: ua.slice(0, 200),
    ts: event.ts,
  }));

  return noContent();
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: withSecurityHeaders({ Allow: 'POST, OPTIONS' }) });
  }
  return new Response('Method Not Allowed', {
    status: 405,
    headers: withSecurityHeaders({ Allow: 'POST', 'Cache-Control': 'no-store' }),
  });
};
