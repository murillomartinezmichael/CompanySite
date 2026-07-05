// Cloudflare Pages Function: POST /api/track
// Lightweight analytics beacon. Logs events to console (Cloudflare Pages tail).
// Future: wire to Plausible/Umami/GA or D1 for persistence. Kept dead simple
// so it never blocks UX — client uses sendBeacon.

type Env = {};

type CTAEvent = {
  name?: string;
  section?: string;
  source?: string;
  path?: string;
  referrer?: string;
  meta?: Record<string, unknown>;
  ts?: number;
};

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  let body: CTAEvent = {};
  try {
    body = await request.json();
  } catch {
    // sendBeacon can send blob with Content-Type application/json but
    // some environments deliver as text — try that as fallback.
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch { /* noop */ }
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ua = request.headers.get('User-Agent') || 'unknown';

  console.log(JSON.stringify({
    event: 'cta',
    cta: body.name || 'unknown',
    section: body.section,
    source: body.source,
    path: body.path,
    referrer: body.referrer,
    meta: body.meta,
    ip,
    ua,
    ts: body.ts || Date.now(),
  }));

  return new Response(null, { status: 204 });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
