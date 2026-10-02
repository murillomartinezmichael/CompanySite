import { esc, type Lead } from './validate';
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
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><title>M3MM inquiry confirmation</title></head>
    <body><a href="#main">Skip to main content</a><main id="main"><h1>M3MM inquiry confirmation</h1>
    <p role="status">${message}</p>${form}<p>Keep this page open until you receive confirmation.
    This page contains your inquiry details. Closing it or returning to a fresh form loses this retry reference.</p>
    <p><a href="mailto:murillomartinezmichael@gmail.com">Email M3MM for help</a> · <a href="/accessibility">Accessibility</a></p>
    </main></body></html>`, {
    status: state === 'confirm' ? 200 : state === 'uncertain' ? 503 : 409,
    headers: withSecurityHeaders({ ...cors,
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      // no-referrer makes Chrome send Origin:null on a native POST. Keep the
      // existing origin gate intact and disclose no referrer cross-origin.
      'Referrer-Policy': 'same-origin', 'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      ...(state === 'uncertain' ? { 'Retry-After': '5' } : {}),
    }),
  });
}
