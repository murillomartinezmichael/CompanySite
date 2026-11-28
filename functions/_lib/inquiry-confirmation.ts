import { esc, cleanLine, cleanText, LIMITS, UTM_FIELDS, type FieldError, type Lead } from './validate';
import { SUBMISSION_ID } from './cockpit-inbox';
import { withSecurityHeaders } from './security-headers';

/** UUID is a non-authentication retry identity. Public intake remains public;
 * origin/rate/body/field validation and receiver authentication still apply.
 * No token, PII or query parameters are put into a redirect URL. */
export function inquiryConfirmation(
  lead: Required<Omit<Lead, 'company_website'>>, submissionId: string,
  state: 'confirm' | 'uncertain' | 'conflict', cors: Record<string, string>,
): Response {
  const message = state === 'confirm'
    ? 'Your inquiry has not been sent by this confirmation step. Confirm below to send it. If the result is uncertain, retry this same confirmation instead of starting over.'
    : state === 'uncertain'
      ? 'Delivery was not confirmed. Your inquiry may already be saved. Retry this same inquiry without changing its contents.'
      : 'This retry reference was used with different contents. The original inquiry may already be saved. Do not start over just to retry; contact us for help.';
  const fields = Object.entries(lead).map(([name, value]) =>
    `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`).join('');
  const form = state === 'conflict' ? '' : `<form action="/api/lead" method="post" enctype="application/x-www-form-urlencoded">
    ${fields}<input type="hidden" name="submissionId" value="${esc(submissionId)}">
    <button type="submit" data-cta="confirm-inquiry">${state === 'confirm' ? 'Confirm and send inquiry' : 'Retry this same inquiry'}</button></form>`;
  return inquiryPage(state === 'confirm' ? 200 : state === 'uncertain' ? 503 : 409,
    `<p role="status">${message}</p>${form}<p>Keep this page open until you receive confirmation.
    This page contains your inquiry details. Closing it or returning to a fresh form loses this retry reference.</p>`,
    cors, state === 'uncertain' ? { 'Retry-After': '5' } : {});
}

/** A native form POST refused before its fields could be read (413, an
 * unparsable or unreadable body). Nothing to re-render, so plain guidance. */
export function inquiryRequestProblem(status: 400 | 413, cors: Record<string, string>): Response {
  const message = status === 413
    ? 'Your inquiry was not sent because it is too long. Go back, shorten the longest field, and send again.'
    : 'Your inquiry was not sent because it could not be read. Go back and send it again.';
  return inquiryPage(status, `<p role="alert">${message}</p>`, cors, {});
}

function inquiryPage(status: number, body: string, cors: Record<string, string>, extra: Record<string, string>): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><title>M3MM inquiry confirmation</title></head>
    <body><a href="#main">Skip to main content</a><main id="main"><h1>M3MM inquiry confirmation</h1>
    ${body}
    <p><a href="mailto:murillomartinezmichael@gmail.com">Email M3MM for help</a> · <a href="/accessibility">Accessibility</a></p>
    </main></body></html>`, {
    status,
    headers: withSecurityHeaders({ ...cors,
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      // no-referrer makes Chrome send Origin:null on a native POST. Keep the
      // existing origin gate intact and disclose no referrer cross-origin.
      'Referrer-Policy': 'same-origin', 'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      ...extra,
    }),
  });
}

const EDITABLE: Record<string, string> = { name: 'Name', email: 'Email', businessType: 'Business type',
  currentUrl: 'Current site URL', frustration: 'What is not working', preferredStart: 'Preferred start' };
const CARRIED = ['source', 'referredBy', 'intent', ...UTM_FIELDS] as const;

/** A native form POST that the server refused before anything was sent:
 * a validation failure the browser could not catch (400) or the rate limit
 * (429). Re-renders what the visitor typed as an editable form, trimmed and
 * capped by the same cleaners validation uses, every value escaped. The
 * honeypot is never echoed; a valid retry reference is kept only on 429,
 * where the contents did not need to change. */
export function inquiryFormProblem(
  status: 400 | 429, input: Lead, cors: Record<string, string>,
  detail: { errors?: FieldError[]; retryAfter?: number; submissionId?: string | null },
): Response {
  const raw = input as Record<string, unknown>;
  const message = status === 429
    ? `Too many submissions from this connection. Wait ${detail.retryAfter ?? 60} seconds, then send again. Nothing was sent.`
    : 'Your inquiry was not sent. Please fix the following and send again:';
  const errors = (detail.errors ?? []).map(e => `<li>${esc(e.message)}</li>`).join('');
  const visible = Object.entries(EDITABLE).map(([name, label]) => {
    const limit = LIMITS[name as keyof typeof LIMITS] as number;
    const value = esc(name === 'frustration' ? cleanText(raw[name], limit) : cleanLine(raw[name], limit));
    return name === 'frustration'
      ? `<p><label for="f-${name}">${label}</label><br><textarea id="f-${name}" name="${name}" rows="6">${value}</textarea></p>`
      : `<p><label for="f-${name}">${label}</label><br><input id="f-${name}" name="${name}" value="${value}"></p>`;
  }).join('');
  const hidden = CARRIED.map(name => {
    const value = cleanLine(raw[name], name.startsWith('utm_') ? LIMITS.utm : LIMITS[name as keyof typeof LIMITS] as number);
    return value ? `<input type="hidden" name="${name}" value="${esc(value)}">` : '';
  }).join('');
  const retryId = status === 429 && detail.submissionId && SUBMISSION_ID.test(detail.submissionId)
    ? `<input type="hidden" name="submissionId" value="${esc(detail.submissionId)}">` : '';
  return inquiryPage(status, `<p role="alert">${message}</p>${errors ? `<ul>${errors}</ul>` : ''}
    <form action="/api/lead" method="post" enctype="application/x-www-form-urlencoded">${visible}${hidden}${retryId}
    <button type="submit" data-cta="resend-inquiry">Send inquiry</button></form>`,
    cors, status === 429 ? { 'Retry-After': String(detail.retryAfter ?? 60) } : {});
}
