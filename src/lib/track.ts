export type CTAEvent = {
  name: string;
  section?: string;
  source?: string;
  intent?: string;
  meta?: Record<string, string | number | boolean>;
};

// CONVERSION_STANDARDS.md § 4 — the CTA loop closes only if the traffic
// source travels with every stage. TikTok/IG bio links carry utm_source /
// utm_medium / utm_campaign; without capturing them at page load, the
// intake_submit event lands with no way to attribute a lead back to a
// specific video or campaign. Pure — takes a search string so it's
// testable outside a browser.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const UTM_MAX = 240;

export function readUtms(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(search || '');
    for (const key of UTM_KEYS) {
      const v = (params.get(key) || '').trim().slice(0, UTM_MAX);
      if (v) out[key] = v;
    }
  } catch { /* malformed search → empty */ }
  return out;
}

// Read once per page-load so history.pushState within an SPA-style flow
// doesn't rewrite the traffic source out from under the funnel.
let cachedUtms: Record<string, string> | null = null;
function utmsForPayload(): Record<string, string> {
  if (cachedUtms !== null) return cachedUtms;
  cachedUtms = typeof location !== 'undefined' ? readUtms(location.search) : {};
  return cachedUtms;
}

export function track(event: CTAEvent) {
  try {
    const utms = utmsForPayload();
    const meta = Object.keys(utms).length
      ? { ...(event.meta || {}), ...utms }
      : event.meta;
    const payload = {
      ...event,
      meta,
      path: typeof location !== 'undefined' ? location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ts: Date.now(),
    };
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
      return;
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { /* swallow — analytics must never block UX */ });
  } catch { /* noop */ }
}

// CONVERSION_STANDARDS.md § 4 — the `cta_click` event requires `intent`.
// In-form CTAs (the intake-submit button) intentionally omit `data-intent`
// on the element because the form's hidden `<input name="intent">` is the
// canonical source of truth — wirePrefill() updates that input on tier-CTA
// clicks so it always reflects the visitor's most recent pick. Without a
// fallback here, the intake-submit `cta_click` beacon lands with
// `intent: undefined` and the funnel dashboard sees a hollow click bucket
// even though `intake_submit` correctly carries the intent. Reading the
// enclosing form's hidden intent as fallback closes the loop end-to-end.
export function wireCTAs() {
  document.querySelectorAll<HTMLElement>('[data-cta]').forEach((el) => {
    el.addEventListener('click', () => {
      const formIntent = el
        .closest('form')
        ?.querySelector<HTMLInputElement>('input[name="intent"]')?.value || undefined;
      track({
        name: el.dataset.cta || 'unknown',
        section: el.dataset.section,
        source: new URLSearchParams(location.search).get('src') || undefined,
        intent: el.dataset.intent || formIntent,
      });
    }, { passive: true });
  });
}
