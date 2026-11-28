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
  preferredStart: 80,
  source: 64,
  intent: 64,                  // matches TRACK_LIMITS.intent in functions/_lib/track-parse.ts
  utm: 240,                    // matches MAX_PARAM_LEN in src/lib/prefill.ts
  referredBy: 120,             // a person or business name — same ceiling as `name`
} as const;

// Real-world-tolerant email pattern. Not RFC-strict; RFC-strict rejects
// addresses your grandmother uses. Modelled on the browser's
// <input type="email"> rule (dot-atom local part, LDH domain labels), with
// Unicode letters/digits allowed for internationalised addresses.
//
// It must be ONE bare address: the value becomes the auto-reply `to`, the
// operator email `reply_to` and a `mailto:` href. The old `[^\s@]+` shape let
// name-addr / list syntax through (`Prize<victim@x.y>`, `a,b@x.y`,
// `a@x.y?bcc=z`), which mail APIs and clients parse as something else.
const EMAIL_LOCAL = "[\\p{L}\\p{N}.!#$%&'*+/=?^_`{|}~-]+";
const EMAIL_LABEL = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]*[\\p{L}\\p{N}])?';
const EMAIL_RE = new RegExp(`^${EMAIL_LOCAL}@${EMAIL_LABEL}(?:\\.${EMAIL_LABEL})+$`, 'u');

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:']);

export type Lead = {
  name?: string;
  email?: string;
  businessType?: string;
  currentUrl?: string;
  frustration?: string;
  preferredStart?: string;
  source?: string;
  // Referral program (2026-08-03) — free text, always optional. Who sent
  // this visitor. Self-declared, so it is never trusted for anything but
  // human triage: it lands in the admin email + lead OS so Michael can pay
  // the referrer, and nowhere else.
  referredBy?: string;
  company_website?: string; // honeypot
  // Attribution — CONVERSION_STANDARDS.md § 4. All optional; blank is fine.
  intent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

// Attribution field names kept in one place so the endpoint layer and the
// clean/rehydrate step stay in sync.
export const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmField = typeof UTM_FIELDS[number];

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

// C0/C1 controls (incl. CR, LF, TAB), DEL, U+2028/2029 line separators and
// bidi embedding/override/isolate marks. None belongs in a name, subject or
// attribution value; CR/LF there reads as a header or line break downstream
// (operator email Subject, Cockpit card title, n8n replyHint).
const LINE_UNSAFE = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]+/g;
// Free text keeps \n and \t; CR is normalised away, every other control dropped.
const TEXT_UNSAFE = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g;

/** `clean` for single-line fields: each unsafe run collapses to one space. */
export function cleanLine(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return clean(v.replace(LINE_UNSAFE, ' '), max);
}

/** `clean` for multi-line free text: CRLF -> LF, other controls removed. */
export function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return clean(v.replace(/\r\n?/g, '\n').replace(TEXT_UNSAFE, ''), max);
}

export function validateLead(input: Lead): { ok: true; lead: Required<Omit<Lead, 'company_website'>> } | { ok: false; errors: FieldError[] } {
  const name = cleanLine(input.name, LIMITS.name);
  const email = cleanLine(input.email, LIMITS.email);
  const businessType = cleanLine(input.businessType, LIMITS.businessType);
  const currentUrl = cleanLine(input.currentUrl, LIMITS.currentUrl);
  const frustration = cleanText(input.frustration, LIMITS.frustration);
  const preferredStart = cleanLine(input.preferredStart, LIMITS.preferredStart);
  const source = cleanLine(input.source, LIMITS.source) || 'unknown';
  const referredBy = cleanLine(input.referredBy, LIMITS.referredBy);
  const intent = cleanLine(input.intent, LIMITS.intent);
  const utm_source = cleanLine(input.utm_source, LIMITS.utm);
  const utm_medium = cleanLine(input.utm_medium, LIMITS.utm);
  const utm_campaign = cleanLine(input.utm_campaign, LIMITS.utm);
  const utm_content = cleanLine(input.utm_content, LIMITS.utm);
  const utm_term = cleanLine(input.utm_term, LIMITS.utm);

  const errors: FieldError[] = [];
  if (!name) errors.push({ field: 'name', code: 'required', message: 'Name is required.' });
  if (!email) errors.push({ field: 'email', code: 'required', message: 'Email is required.' });
  else if (!isValidEmail(email)) errors.push({ field: 'email', code: 'format', message: 'Email format looks off.' });
  if (!businessType) errors.push({ field: 'businessType', code: 'required', message: 'Business type is required.' });
  if (!frustration) errors.push({ field: 'frustration', code: 'required', message: 'Frustration is required.' });
  else if (frustration.length < LIMITS.frustrationMin) errors.push({ field: 'frustration', code: 'too_short', message: `Please write at least ${LIMITS.frustrationMin} characters — helps me give a useful review.` });
  if (currentUrl && !isValidUrl(currentUrl)) errors.push({ field: 'currentUrl', code: 'format', message: 'URL must start with http:// or https://' });

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    lead: {
      name, email, businessType, currentUrl, frustration, preferredStart, source,
      referredBy,
      intent, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    },
  };
}

/**
 * HTML-escape a string for embedding in an email body. Belt-and-suspenders —
 * we already validated shape, but never trust internal-facing outputs either.
 */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
