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

import { checkRate } from '../_lib/rate';
import { clean } from '../_lib/validate';

type Env = {};

const MAX_BODY_BYTES = 4 * 1024;
const RATE_MAX = 60;
const RATE_WINDOW_S = 60;
const CTA_NAME_MAX = 80;
const SECTION_MAX = 40;
const SOURCE_MAX = 64;
const INTENT_MAX = 64;
const PATH_MAX = 256;
const REFERRER_MAX = 512;

type CTAEvent = {
  name?: string;
  section?: string;
  source?: string;
  intent?: string;
  path?: string;
  referrer?: string;
  ts?: number;
};

const noContent = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Soft rate — even a hostile client can't drown the tail.
  if (!checkRate(ip, RATE_MAX, RATE_WINDOW_S).ok) return noContent();

  const contentLengthRaw = request.headers.get('Content-Length');
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : NaN;
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return noContent();

  let text: string;
  try {
    text = await request.text();
  } catch {
    return noContent();
  }
  if (text.length > MAX_BODY_BYTES) return noContent();

  let body: CTAEvent = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    // sendBeacon sometimes delivers as text; try URLSearchParams as fallback.
    try {
      const p = new URLSearchParams(text);
      body = { name: p.get('name') || undefined, section: p.get('section') || undefined, source: p.get('source') || undefined, intent: p.get('intent') || undefined };
    } catch { /* noop */ }
  }

  const ua = request.headers.get('User-Agent') || 'unknown';
  console.log(JSON.stringify({
    event: 'cta',
    cta: clean(body.name, CTA_NAME_MAX) || 'unknown',
    section: clean(body.section, SECTION_MAX) || undefined,
    source: clean(body.source, SOURCE_MAX) || undefined,
    intent: clean(body.intent, INTENT_MAX) || undefined,
    path: clean(body.path, PATH_MAX) || undefined,
    referrer: clean(body.referrer, REFERRER_MAX) || undefined,
    ip,
    ua: ua.slice(0, 200),
    ts: typeof body.ts === 'number' ? body.ts : Date.now(),
  }));

  return noContent();
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
};
