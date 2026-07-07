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

---

## 2026-07-07 · SiteGuide · /demos/paid success page shipped

**Card:** SiteGuide Stripe money loop (visual close)
**Move to:** Done

**What shipped:** New `demo/paid.html` bone-on-ink success page + `GET /demos/paid` route + explicit `X-Frame-Options=DENY` for the payment-confirmation surface. Stripe checkout `success_url` flipped from `/demos?paid=...` to `/demos/paid?paid=...` so buyers land on a polished page instead of the store front. Client-side script reads the tenant id from `?paid=...` and surfaces which template was bought (id sanitized to `[a-z0-9_-]`, session id truncated to last 6 chars).

**Files touched:** `SiteGuide/demo/paid.html` (new), `SiteGuide/Backend/main.py` (route), `SiteGuide/Backend/checkout.py` (success_url), `SiteGuide/tests/test_smoke.py` (+2 tests), `SiteGuide/tests/test_checkout.py` (assertions), `SiteGuide/TODO.md` (SHIPPED entry).

**Commits:** `8e69a0e` (feature) · `27ef0b7` (TODO update). Live on Railway; verified 200 + XFO=DENY + all security headers on prod.

**Next up:** SiteGuide Rung 2 spec + ship next widget variant OR CockpitCloud sink for `checkout.session.completed` (fleet-connect Rung VII EVOLVE).

Test suite: 322 → 324 green (2 new smoke tests).

---

## 2026-07-07 · CompanySite · CTA conversion audit (3 gaps closed)

**Card:** CompanySite conversion pass (CONVERSION_STANDARDS.md audit)
**Move to:** Done

**What shipped:** Walked every CTA on m3mm.net against `docs/CONVERSION_STANDARDS.md`
§§ 1–4. Fixed the three highest-ROI gaps in one commit (`657e650`):

1. **§ 3 prefill:** Services CTA #04 "Custom builds" (`tier:custom:scoped-project`,
   the $6,000+ top tier) had `data-intent` set but no matching `CATALOG` entry
   in `src/lib/prefill.ts` — clicking it scrolled to a blank intake form.
   Added the CATALOG entry so the intake now prefills with a real brief.
2. **§ 4 attribution (client):** `wireCTAs()` in `src/lib/track.ts` was dropping
   `el.dataset.intent` before it reached the beacon — the tracker silently
   ignored the intent field. Now reads and forwards it.
3. **§ 4 attribution (server):** `functions/api/track.ts` didn't accept or log
   the `intent` field on the receiving end. Extended `CTAEvent` + urlencoded
   fallback + `INTENT_MAX=64` bounds check + log line. Attribution loop now
   closes end-to-end for all three tier CTAs already carrying `data-intent`.

Verified in built bundle: `dataset.intent` and `tier:custom` both present in
`dist/_astro/hoisted.*.js`. Astro build clean, no TS errors.

**Files touched:** `src/lib/prefill.ts`, `src/lib/track.ts`, `functions/api/track.ts`.

**Commits:** `657e650` (CTA audit fix) + `7d8a18d` (docs sweep: finalize
prior-tick's staged rung-iv strike ledger + raw LH JSON — closes session-guard
finish line piece cut off by prior tick's `no_log` exit).

**Parked (next audit sweep):** Hero / Header / Footer generic "Free review"
CTAs still lack `data-intent`. Recommended: `book:site-review` — § 2 reserved
namespace covers this cleanly. Deferred because these are generic booking
actions (not tier picks), so no CATALOG entry required — only metadata for
analytics distinction. 3 files, mechanical.

**Next up:** either the parked `book:site-review` intent metadata sweep, or
Rung VI EXPAND — real testimonials wall.

