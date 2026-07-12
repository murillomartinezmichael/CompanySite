import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateLead, LIMITS, UTM_FIELDS } from '../../functions/_lib/validate';
import { UTM_FORM_KEYS } from '../../src/lib/prefill';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// CONVERSION_STANDARDS.md § 4 — the CTA loop closes only if the traffic
// source travels with EVERY stage, including the /api/lead POST that ends
// up in Mike's inbox. Prior state: intent + UTMs were captured on analytics
// beacons (track.ts) but silently dropped at the lead endpoint. Admin email
// arrived without any way to tell which TikTok video sourced the lead.
//
// This test pins the four wires needed for the loop to close:
//   1. Intake.astro renders 5 hidden UTM inputs + the intent input.
//   2. prefill.ts's UTM_FORM_KEYS covers exactly the 5 UTM names.
//   3. validateLead accepts + preserves intent + UTMs (never rejects).
//   4. lead.ts renders an Attribution block only when attribution is set.

describe('§ 4 attribution loop — Intake renders the 5 UTM hidden inputs + intent', () => {
  const intake = read('src/components/Intake.astro');

  it('renders a hidden input for intent (default seeded)', () => {
    expect(intake).toMatch(/<input\s+type="hidden"\s+name="intent"\s+value=\{defaultIntent\}/);
  });

  for (const key of UTM_FORM_KEYS) {
    it(`renders a hidden input for ${key} (empty until applyUrlPrefill fills it)`, () => {
      const re = new RegExp(`<input\\s+type="hidden"\\s+name="${key}"\\s+value=""`);
      expect(intake, `Intake.astro must render <input hidden name="${key}">`).toMatch(re);
    });
  }
});

describe('§ 4 attribution loop — UTM_FORM_KEYS is the exact 5-key set', () => {
  it('matches the standard UTM names (source · medium · campaign · content · term)', () => {
    expect([...UTM_FORM_KEYS].sort()).toEqual(
      ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'].sort(),
    );
  });

  it('mirrors UTM_FIELDS on the validator side (client + server agree on the wire)', () => {
    // A rename on either side without the other is a silent attribution drop.
    // If this fails, the two sides drifted — both must move together.
    expect([...UTM_FORM_KEYS].sort()).toEqual([...UTM_FIELDS].sort());
  });
});

describe('§ 4 attribution loop — validateLead preserves intent + UTMs', () => {
  const base = {
    name: 'David',
    email: 'd@a.co',
    businessType: 'deck builder',
    frustration: 'longer than ten chars',
  };

  it('threads intent through cleanly', () => {
    const r = validateLead({ ...base, intent: 'tier:website:business' });
    if (!r.ok) throw new Error('expected ok');
    expect(r.lead.intent).toBe('tier:website:business');
  });

  it('threads all 5 UTM fields through cleanly', () => {
    const r = validateLead({
      ...base,
      utm_source: 'tiktok',
      utm_medium: 'bio',
      utm_campaign: 'aries-video',
      utm_content: 'deck-tips',
      utm_term: 'atlanta-deck',
    });
    if (!r.ok) throw new Error('expected ok');
    expect(r.lead.utm_source).toBe('tiktok');
    expect(r.lead.utm_medium).toBe('bio');
    expect(r.lead.utm_campaign).toBe('aries-video');
    expect(r.lead.utm_content).toBe('deck-tips');
    expect(r.lead.utm_term).toBe('atlanta-deck');
  });

  it('caps oversized attribution values at LIMITS.utm / LIMITS.intent', () => {
    // A hostile bio link can't push a megabyte string through the pipe.
    const huge = 'x'.repeat(LIMITS.utm + 5000);
    const hugeIntent = 'y'.repeat(LIMITS.intent + 500);
    const r = validateLead({ ...base, intent: hugeIntent, utm_source: huge });
    if (!r.ok) throw new Error('expected ok — over-cap attribution should trim, not fail');
    expect(r.lead.intent.length).toBeLessThanOrEqual(LIMITS.intent);
    expect(r.lead.utm_source.length).toBeLessThanOrEqual(LIMITS.utm);
  });

  it('leaves intent + UTMs as empty strings when the visitor came direct', () => {
    // Direct visits (no bio-link params, no CTA click) still validate cleanly.
    // The lead endpoint's attribution block is rendered only when at least
    // one of these is set — direct visitors don't grow a hollow Attribution
    // block in the admin email.
    const r = validateLead(base);
    if (!r.ok) throw new Error('expected ok');
    expect(r.lead.intent).toBe('');
    for (const key of UTM_FIELDS) {
      expect(r.lead[key]).toBe('');
    }
  });

  it('does not reject a lead just because attribution fields are missing', () => {
    // Belt-and-suspenders: the LAW is that attribution is optional. If a
    // visitor with JS disabled and no bio link submits, validation must
    // still return ok so the lead reaches Mike.
    const r = validateLead(base);
    expect(r.ok).toBe(true);
  });
});

describe('§ 4 attribution loop — lead.ts renders an Attribution block only when set', () => {
  const lead = read('functions/api/lead.ts');

  it('imports UTM_FIELDS from the validator so the two stay in sync', () => {
    expect(lead).toMatch(/import\s*\{[^}]*\bUTM_FIELDS\b[^}]*\}\s*from\s*['"]\.\.\/_lib\/validate['"]/);
  });

  it('conditionally emits the Attribution block based on intent OR utm rows', () => {
    // The block must not render for direct visitors (no attribution). If it
    // rendered unconditionally, every admin email would carry a hollow
    // "Attribution" heading — noise Mike would learn to skip past.
    expect(lead).toMatch(/lead\.intent\s*\|\|\s*utmRows/);
    expect(lead).toContain('Attribution');
  });

  it('includes intent + every UTM key in the console.log line', () => {
    // Cloudflare Tail lands here for post-hoc funnel analysis. If any key
    // is missing from the log, a lead is silently unmeasurable.
    for (const key of UTM_FIELDS) {
      const re = new RegExp(`${key}:\\s*lead\\.${key}`);
      expect(lead, `lead.ts console.log must include ${key}`).toMatch(re);
    }
    expect(lead).toMatch(/intent:\s*lead\.intent/);
  });

  it('accepts intent + UTMs on the no-JS URL-encoded fallback path', () => {
    // Visitors with JS off submit via URL-encoded form POST. If the fallback
    // parser drops attribution fields, the no-JS lane silently loses UTMs
    // while the JS lane keeps them — an invisible bias in the funnel.
    for (const key of UTM_FIELDS) {
      const re = new RegExp(`${key}:\\s*params\\.get\\(['"]${key}['"]\\)`);
      expect(lead, `lead.ts URL-encoded fallback must parse ${key}`).toMatch(re);
    }
    expect(lead).toMatch(/intent:\s*params\.get\(['"]intent['"]\)/);
  });
});
