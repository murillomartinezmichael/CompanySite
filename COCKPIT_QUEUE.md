# Cockpit Work Log — queued entries

Drain by opening `../COCKPIT.html` in a browser, pressing `l`, and
transcribing each entry into the Work Log dialog. Delete drained
entries from this file. Present because Cockpit is LocalStorage-only
so Claude sessions can't inject entries directly — LAW #6, never fake it.

---

## 2026-07-07 · CompanySite · Rung IV SPEED strike #2 (video lazy-load)

**Card:** CompanySite Rung IV SPEED
**Move to:** Done

**What shipped:** Case-study video lazy-load via IntersectionObserver.
`videos/aries-scroll.mp4` was 98.2 % of page weight and fetched on every
page load (autoplay + preload=metadata). Now: `preload="none"` +
`data-lazy` on the `<video>`, `data-src` on the `<source>`, hydrated by
`src/lib/lazyVideo.ts` only when the section enters view. Measured
delta on live m3mm.net (desktop preset, Lighthouse 11.7.1):
total-byte-weight 6.81 MB → 0.12 MB (−98.2 %), FCP/SI/TTI −271 ms.
Tests 68/68 green.

**Files touched:** `src/lib/lazyVideo.ts` (new), `src/components/CaseStudy.astro`,
`src/layouts/Layout.astro`, `docs/lighthouse-baseline.md`,
`docs/lighthouse-2026-07-07-strike2.json`, `STATUS.md`.

**Commits:** `8481eb2` (fix) · `4eaabd5` (delta record) · `44418c2` (STATUS).

**Next up:** CompanySite Rung VI EXPAND — real testimonials wall (David
Serrano quote already approved per feedback memory).
