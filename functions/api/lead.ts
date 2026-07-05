// Cloudflare Pages Function: POST /api/lead
// Handles the intake form. Emails Michael via Resend if RESEND_API_KEY is
// present; otherwise logs to console and returns 200 so the MVP works pre-key.

type Env = {
  RESEND_API_KEY?: string;
  LEAD_TO?: string;         // where the notification goes; defaults to Michael's address
  LEAD_FROM?: string;       // verified sender in Resend; defaults to a Resend sandbox
};

type Lead = {
  name?: string;
  email?: string;
  businessType?: string;
  currentUrl?: string;
  frustration?: string;
  source?: string;
  company_website?: string; // honeypot
};

const RATE_WINDOW_S = 60;
const RATE_MAX = 5;
const bucket = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now() / 1000;
  const hits = (bucket.get(ip) || []).filter((t) => now - t < RATE_WINDOW_S);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  bucket.set(ip, hits);
  return false;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

async function sendEmail(env: Env, to: string, subject: string, html: string, replyTo?: string) {
  if (!env.RESEND_API_KEY) return { skipped: true as const };
  const from = env.LEAD_FROM || 'M³ Leads <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  return { ok: res.ok, status: res.status };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Lead;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (body.company_website) {
    return new Response(JSON.stringify({ ok: true, honeypot: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  const errors: string[] = [];
  if (!body.name?.trim()) errors.push('name');
  if (!body.email?.trim() || !isValidEmail(body.email)) errors.push('email');
  if (!body.businessType?.trim()) errors.push('businessType');
  if (!body.frustration?.trim() || body.frustration.length < 10) errors.push('frustration');
  if (errors.length) {
    return new Response(JSON.stringify({ ok: false, error: 'validation', fields: errors }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const to = env.LEAD_TO || 'murillomartinezmichael@gmail.com';
  const source = body.source || 'unknown';

  const adminHtml = `
    <h2 style="font-family:Georgia,serif;">New M³ intake — ${esc(source)}</h2>
    <p><b>Name:</b> ${esc(body.name!)}</p>
    <p><b>Email:</b> <a href="mailto:${esc(body.email!)}">${esc(body.email!)}</a></p>
    <p><b>Business:</b> ${esc(body.businessType!)}</p>
    <p><b>Current URL:</b> ${body.currentUrl ? `<a href="${esc(body.currentUrl)}">${esc(body.currentUrl)}</a>` : '—'}</p>
    <p><b>Frustration:</b></p>
    <blockquote style="border-left:3px solid #FF3B5C;margin:0;padding:8px 14px;color:#333;">${esc(body.frustration!)}</blockquote>
    <p style="color:#888;font-size:12px;">IP: ${esc(ip)} · Source: ${esc(source)}</p>
  `;

  const replyHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;">
      <h2 style="margin:0 0 12px;">Got it, ${esc(body.name!)}.</h2>
      <p>I'll actually look at your site and reply within 24 hours with a plain-English review — what's working, what's costing you customers, and whether it needs a rebuild or just a fix.</p>
      <p>If it turns out you don't need me, I'll tell you that too.</p>
      <p>— Michael<br/><span style="color:#888;font-size:13px;">M³ · Atlanta, GA</span></p>
    </div>
  `;

  const adminResult = await sendEmail(env, to, `M³ intake · ${body.name} (${body.businessType})`, adminHtml, body.email);
  const replyResult = await sendEmail(env, body.email!, 'Got your review request — M³', replyHtml);

  console.log(JSON.stringify({
    event: 'lead_received',
    source,
    business: body.businessType,
    hasUrl: Boolean(body.currentUrl),
    resend: { admin: adminResult, reply: replyResult },
    ip,
    ts: Date.now(),
  }));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': new URL(request.url).origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
};
