export type CatalogEntry = {
  title: string;
  from: string;
  detail: string;
};

export const CATALOG: Record<string, CatalogEntry> = {
  'tier:website:site-that-books': {
    title: 'A site that books jobs',
    from: '$2,400',
    detail: 'Mobile-first site + intake form + gallery + reviews wired in.',
  },
  'tier:automation:hours-saved': {
    title: 'Automations that save you hours',
    from: '$1,200',
    detail: 'Quoting, invoicing, follow-ups — the repetitive stuff, done for you.',
  },
  'tier:widget:ai-assistant': {
    title: 'A guide that answers your customers',
    from: '$800',
    detail: 'Drop-in AI chat trained on your services + pricing.',
  },
};

const SEPARATOR = '\n---\nAdd anything else below:\n';

export function buildBrief(entry: CatalogEntry): string {
  return `${entry.title} — from ${entry.from}\n${entry.detail}${SEPARATOR}`;
}

export function isPriorPrefill(text: string): boolean {
  return text.includes(SEPARATOR);
}

export function wirePrefill(): void {
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>('[data-intent]');
      if (!el) return;
      const intent = el.dataset.intent;
      if (!intent) return;
      const entry = CATALOG[intent];
      if (!entry) return;
      const ta = document.querySelector<HTMLTextAreaElement>(
        'form#intake-form textarea[name="frustration"]'
      );
      if (!ta) return;
      if (ta.value.trim() && !isPriorPrefill(ta.value)) return;
      ta.value = buildBrief(entry);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    },
    { passive: true }
  );
}
