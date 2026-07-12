import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// CONVERSION_STANDARDS.md § 4 — every outbound link fires cta_click with
// attribution; § outbound also requires UTM triplets on third-party
// destinations so referral traffic is legible in the target site's
// analytics. Companion to outbound-utm.test.ts (SiteGuide downshift):
// this one pins the CaseStudy "Visit the live site" link, which is
// constructed at build time from the frontmatter `liveUrl` via
// URL.searchParams.set(). A rename/drop of any setter call would ship
// unattributed outbound clicks to Aries / Big7 / future case-study clients.
//
// Cannot regex the shipped URL (built dynamically per case study), so pin
// the four setter calls on the source itself — same style as the outbound
// SiteGuide test's `urls.match` pattern applied at the source layer.

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

const CASE_STUDY = 'src/components/CaseStudy.astro';

describe('CaseStudy outbound "Visit the live site" carries UTM attribution', () => {
  const src = read(CASE_STUDY);

  it('constructs the outbound URL via new URL(d.liveUrl)', () => {
    // If the source drops the URL wrapper and inlines d.liveUrl directly,
    // the four searchParams.set() calls below are unreachable and every
    // outbound click ships without attribution.
    expect(src).toMatch(/new URL\(d\.liveUrl\)/);
  });

  it('sets utm_source=m3mm.net so the client site can identify us as the referrer', () => {
    expect(src).toMatch(/searchParams\.set\(\s*['"]utm_source['"],\s*['"]m3mm\.net['"]\s*\)/);
  });

  it('sets utm_medium=case-study so the medium is distinct from footer/services/audit', () => {
    // Distinguishes /proof case-study visits from downshift SiteGuide clicks
    // (utm_medium=footer|services|audit|thanks). Analytics on the client
    // side can filter for us specifically.
    expect(src).toMatch(/searchParams\.set\(\s*['"]utm_medium['"],\s*['"]case-study['"]\s*\)/);
  });

  it('sets utm_campaign=proof (the section that hosts the CTA)', () => {
    expect(src).toMatch(/searchParams\.set\(\s*['"]utm_campaign['"],\s*['"]proof['"]\s*\)/);
  });

  it('sets utm_content to the case-study slug so per-client attribution is legible', () => {
    // Without utm_content, a client with multiple case studies (future
    // state) can't tell which one drove the visit. Slug-per-content
    // scopes it correctly today and future-proofs the loop.
    expect(src).toMatch(/searchParams\.set\(\s*['"]utm_content['"],\s*entry\.slug\s*\)/);
  });

  it('renders the anchor with data-cta / data-section / data-intent so the click side of the loop closes too', () => {
    // Outbound UTMs close the loop on the DESTINATION side. The visit
    // event on the SOURCE side (m3mm.net analytics) closes on data-cta
    // + data-intent — track.ts's wireCTAs pulls both. Missing either
    // makes proof-section funnel analysis a guess.
    expect(src).toMatch(/data-cta=\{`casestudy-\$\{entry\.slug\}-visit`\}/);
    expect(src).toMatch(/data-section="proof"/);
    expect(src).toMatch(/data-intent=\{`product:\$\{entry\.slug\}`\}/);
  });

  it('opens in a new tab with rel="noopener noreferrer"', () => {
    // noreferrer is deliberate on outbound case-study links: the client's
    // own analytics get UTMs (attribution intact) without leaking the
    // browsing history via document.referrer.
    expect(src).toMatch(/target="_blank"/);
    expect(src).toMatch(/rel="noopener noreferrer"/);
  });
});
