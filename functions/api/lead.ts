// POST /api/lead — the money path. Every TikTok click terminates here.
//
// Hardening (Rung 1, 2026-07-05):
// - 16 KB body cap (reject bombs before parse)
// - Content-Type must be application/json
// - Origin allowlist (m3mm.net + localhost dev variants)
// - Per-IP rate limit 5 req / 60s with Retry-After
// - Field trim + cap + validation with structured error codes
// - Honeypot (silent 200 for bots)
// - 6s AbortSignal timeout on each Resend fetch (avoid hung workers)
// - Structured single-line log per lead (Cloudflare tail friendly)
//
// Graceful degradation: with no RESEND_API_KEY the endpoint still 200s
// and logs the lead. Documented, not faked (LAW 6).

import { LIMITS, validateLead, esc, type Lead } from '../_lib/validate';
import { checkRate } from '../_lib/rate';
import { sendToCockpit, leadIdempotencyKey } from '../_lib/cockpit-sink';

type Env = {
  RESEND_API_KEY?: string;
  LEAD_TO?: string;
  LEAD_FROM?: string;
  ALLOWED_ORIGINS?: string; // comma-separated; defaults below
  // Rung VI EXPAND / Rung VII EVOLVE (2026-07-07): strategic fleet bond with
  // CockpitCloud. When both are unset the sink no-ops silently — feature-flag
  // pattern so the code can ship dark and light up when Mike deploys
  // CockpitCloud + sets these env vars.
  COCKPIT_INGEST_URL?: string;
  COCKPIT_INGEST_TOKEN?: string;
};

const DEFAULT_ORIGINS = [
  'https://m3mm.net',
  'https://www.m3mm.net',
  // dev
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
  'http://localhost:8789',
  'http://127.0.0.1:8789',
];

const RATE_MAX = 5;
const RATE_WINDOW_S = 60;
const RESEND_TIMEOUT_MS = 6_000;

function jsonResponse(status: number, body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function originAllowed(env: Env, origin: string | null): boolean {
  if (!origin) return true; // same-origin fetch or curl — allow
  const list = (env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean)) || DEFAULT_ORIGINS;
  return list.includes(origin);
}

async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<{ ok: boolean; skipped?: true; status?: number; error?: string }> {
  if (!env.RESEND_API_KEY) return { ok: false, skipped: true };
  const from = env.LEAD_FROM || 'M³ Leads <onboarding@resend.dev>';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.name : 'unknown_error' };
  } finally {
    clearTimeout(timer);
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const origin = request.headers.get('Origin');
  const contentType = request.headers.get('Content-Type') || '';

  if (!originAllowed(env, origin)) {
    return jsonResponse(403, { ok: false, error: 'origin_not_allowed' });
  }

  const ct = contentType.toLowerCase();
  const isJson = ct.includes('application/json');
  const isForm = ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data');
  if (!isJson && !isForm) {
    return jsonResponse(415, { ok: false, error: 'unsupported_media_type' });
  }

  const contentLengthRaw = request.headers.get('Content-Length');
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : NaN;
  if (Number.isFinite(contentLength) && contentLength > LIMITS.bodyBytes) {
    return jsonResponse(413, { ok: false, error: 'payload_too_large', limit: LIMITS.bodyBytes });
  }

  const rate = checkRate(ip, RATE_MAX, RATE_WINDOW_S);
  if (!rate.ok) {
    return jsonResponse(
      429,
      { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter },
      { 'Retry-After': String(rate.retryAfter) },
    );
  }

  // Read the body with a hard byte cap even if Content-Length was absent/lying.
  let raw: string;
  try {
    const text = await request.text();
    if (text.length > LIMITS.bodyBytes) {
      return jsonResponse(413, { ok: false, error: 'payload_too_large', limit: LIMITS.bodyBytes });
    }
    raw = text;
  } catch {
    return jsonResponse(400, { ok: false, error: 'body_unreadable' });
  }

  let body: Lead;
  if (isJson) {
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return jsonResponse(400, { ok: false, error: 'invalid_json' });
    }
  } else {
    // No-JS fallback: the <form> POSTs as URL-encoded when the client
    // has JS disabled. Parse into the same shape validateLead accepts.
    const params = new URLSearchParams(raw);
    body = {
      name: params.get('name') || undefined,
      email: params.get('email') || undefined,
      businessType: params.get('businessType') || undefined,
      currentUrl: params.get('currentUrl') || undefined,
      frustration: params.get('frustration') || undefined,
      source: params.get('source') || undefined,
      company_website: params.get('company_website') || undefined,
    };
  }

  // Honeypot: bots gleefully fill the hidden field. Silent 200 so they
  // don't know they were caught.
  if (body.company_website) {
    return jsonResponse(200, { ok: true });
  }

  const result = validateLead(body);
  if (!result.ok) {
    return jsonResponse(400, { ok: false, error: 'validation', errors: result.errors });
  }
  const lead = result.lead;

  const to = env.LEAD_TO || 'murillomartinezmichael@gmail.com';

  const adminHtml = `
    <h2 style="font-family:Georgia,serif;">New M³ intake — ${esc(lead.source)}</h2>
    <p><b>Name:</b> ${esc(lead.name)}</p>
    <p><b>Email:</b> <a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></p>
    <p><b>Business:</b> ${esc(lead.businessType)}</p>
    <p><b>Current URL:</b> ${lead.currentUrl ? `<a href="${esc(lead.currentUrl)}">${esc(lead.currentUrl)}</a>` : '&mdash;'}</p>
    <p><b>Frustration:</b></p>
    <blockquote style="border-left:3px solid #FF3B5C;margin:0;padding:8px 14px;color:#333;">${esc(lead.frustration)}</blockquote>
    <p style="color:#888;font-size:12px;">IP: ${esc(ip)} &middot; Source: ${esc(lead.source)}</p>
  `;

  const replyHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;">
      <h2 style="margin:0 0 12px;">Got it, ${esc(lead.name)}.</h2>
      <p>I'll actually look at your site and reply within 24 hours with a plain-English review &mdash; what's working, what's costing you customers, and whether it needs a rebuild or just a fix.</p>
      <p>If it turns out you don't need me, I'll tell you that too.</p>
      <p>&mdash; Michael<br/><span style="color:#888;font-size:13px;">M³ &middot; Atlanta, GA</span></p>
    </div>
  `;

  const adminResult = await sendEmail(env, to, `M³ intake · ${lead.name} (${lead.businessType})`, adminHtml, lead.email);
  const replyResult = await sendEmail(env, lead.email, 'Got your review request — M³', replyHtml);

  // Fleet bond — forward to CockpitCloud kanban if configured. Env-gated,
  // never blocks the visitor's 200. Idempotency key is deterministic on
  // stable lead fields so any Cloudflare double-invocation dedupes at the
  // CockpitCloud side.
  const cockpitId = leadIdempotencyKey(lead);
  const cockpitResult = await sendToCockpit(env, cockpitId, lead, ip);

  console.log(JSON.stringify({
    event: 'lead_received',
    source: lead.source,
    business: lead.businessType,
    hasUrl: Boolean(lead.currentUrl),
    frustrationLength: lead.frustration.length,
    resend: { admin: adminResult, reply: replyResult },
    cockpit: cockpitResult,
    cockpitId,
    ip,
    ts: Date.now(),
  }));

  return jsonResponse(200, { ok: true });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin') || '';
    return new Response(null, {
      status: 204,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
  });
};
