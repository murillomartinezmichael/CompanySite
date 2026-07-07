export type CTAEvent = {
  name: string;
  section?: string;
  source?: string;
  intent?: string;
  meta?: Record<string, string | number | boolean>;
};

export function track(event: CTAEvent) {
  try {
    const payload = {
      ...event,
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

export function wireCTAs() {
  document.querySelectorAll<HTMLElement>('[data-cta]').forEach((el) => {
    el.addEventListener('click', () => {
      track({
        name: el.dataset.cta || 'unknown',
        section: el.dataset.section,
        source: new URLSearchParams(location.search).get('src') || undefined,
        intent: el.dataset.intent,
      });
    }, { passive: true });
  });
}
