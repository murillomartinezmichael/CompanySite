// Pure validation helpers, extracted so a future Rung 2 (TEST) pass can
// unit-test them without booting a Cloudflare Functions runtime.

export const LIMITS = {
  bodyBytes: 16 * 1024,        // 16 KB — a comfortable form headroom, blocks 10 MB bombs
  name: 120,
  email: 254,                  // RFC 5321 practical maximum
  businessType: 120,
  currentUrl: 2048,
  frustration: 4000,
  frustrationMin: 10,
  source: 64,
} as const;

// Real-world-tolerant email pattern. Not RFC-strict; RFC-strict rejects
// addresses your grandmother uses. This is the same pattern the browser
// uses for <input type="email"> without allow-list.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:']);

export type Lead = {
  name?: string;
  email?: string;
  businessType?: string;
  currentUrl?: string;
  frustration?: string;
  source?: string;
  company_website?: string; // honeypot
};

export type FieldError = { field: string; code: string; message: string };

export function isValidEmail(s: string): boolean {
  return EMAIL_RE.test(s);
}

export function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return ALLOWED_URL_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

/**
 * Trim + cap. Every string that reaches the mail body / log line goes
 * through this so nothing pushes past a documented ceiling.
 */
export function clean(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

export function validateLead(input: Lead): { ok: true; lead: Required<Omit<Lead, 'company_website'>> } | { ok: false; errors: FieldError[] } {
  const name = clean(input.name, LIMITS.name);
  const email = clean(input.email, LIMITS.email);
  const businessType = clean(input.businessType, LIMITS.businessType);
  const currentUrl = clean(input.currentUrl, LIMITS.currentUrl);
  const frustration = clean(input.frustration, LIMITS.frustration);
  const source = clean(input.source, LIMITS.source) || 'unknown';

  const errors: FieldError[] = [];
  if (!name) errors.push({ field: 'name', code: 'required', message: 'Name is required.' });
  if (!email) errors.push({ field: 'email', code: 'required', message: 'Email is required.' });
  else if (!isValidEmail(email)) errors.push({ field: 'email', code: 'format', message: 'Email format looks off.' });
  if (!businessType) errors.push({ field: 'businessType', code: 'required', message: 'Business type is required.' });
  if (!frustration) errors.push({ field: 'frustration', code: 'required', message: 'Frustration is required.' });
  else if (frustration.length < LIMITS.frustrationMin) errors.push({ field: 'frustration', code: 'too_short', message: `Please write at least ${LIMITS.frustrationMin} characters — helps me give a useful review.` });
  if (currentUrl && !isValidUrl(currentUrl)) errors.push({ field: 'currentUrl', code: 'format', message: 'URL must start with http:// or https://' });

  if (errors.length) return { ok: false, errors };

  return { ok: true, lead: { name, email, businessType, currentUrl, frustration, source } };
}

/**
 * HTML-escape a string for embedding in an email body. Belt-and-suspenders —
 * we already validated shape, but never trust internal-facing outputs either.
 */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
