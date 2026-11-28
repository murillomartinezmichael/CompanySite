import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Intake fields are labelled by wrapping <label>s whose text includes a
// decorative step number (<span class="text-clay mono">01</span>). Without
// aria-hidden, that number becomes part of the accessible name, so screen
// readers announce "Your name zero one" / "Email zero two" and voice-control
// users must say the digits. The visual number is decoration only.
const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const pages = ['audit', 'start', 'websites', 'for/hvac', 'for/roofing'];

function accessibleLabelTexts(html: string): string[] {
  const form = html.match(/<form id="intake-form"[\s\S]*?<\/form>/)?.[0] ?? '';
  return [...form.matchAll(/<label\b(?![^>]*aria-hidden="true")[^>]*>([\s\S]*?)<\/label>/g)].map((m) =>
    m[1]
      .replace(/<(input|textarea|select)\b[\s\S]*?(<\/\1>|>)/g, ' ')
      .replace(/<span\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

describe('intake label accessible names', () => {
  for (const page of pages) {
    it(`/${page}/ labels carry no decorative step numbers`, () => {
      const labels = accessibleLabelTexts(readFileSync(`${dist}${page}/index.html`, 'utf8'));
      expect(labels.length).toBeGreaterThanOrEqual(6);
      expect(labels).toContain('Your name');
      expect(labels).toContain('Email');
      for (const text of labels) expect(text, text).not.toMatch(/\b\d{2}\b/);
    });
  }
});
