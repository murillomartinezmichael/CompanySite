# Cockpit Work Log — queued entries

Drain by opening `../COCKPIT.html` in a browser, pressing `l`, and
transcribing each entry into the Work Log dialog. Delete drained
entries from this file. Present because Cockpit is LocalStorage-only
so Claude sessions can't inject entries directly — LAW #6, never fake it.

---

## 2026-07-07 · CompanySite · Rung IV audit — ceiling confirmed + JSON-LD hygiene

**Card:** CompanySite Rung IV SPEED
**Move to:** In Progress (audit only — no rung close)

**What shipped:** Fresh Lighthouse mobile baselines saved under `perf/`
(`lh-mobile-baseline-tick7-…json` = LIVE m3mm.net Perf 96 · LCP 2555 ms;
`lh-local-{before,after}-tick7-…json` = local `serve dist` on port 4200,
Perf 98 · LCP 2262-2268 ms). Confirmed all 20 diagnostics score 1.0 with
zero flagged opportunities. Investigated font-weight subsetting — Google
Fonts serves identical latin-subset WOFF2 URLs regardless of `wght@` combo
for Space Grotesk, Inter, and JetBrains Mono (variable font behavior), so
trimming unused weights is a no-op. Only code change this tick: JSON-LD
`email` → `schema.org/ContactPoint` in `Layout.astro` for schema hygiene
(Cloudflare's Email-Address-Obfuscation still fires because of Footer's
`mailto:` — no perf claim). Guard `≥3 score OR ≥100 ms LCP` NOT cleared;
Rung IV headroom exhausted until fonts self-host or the LCP element moves.

**Files touched:** `src/layouts/Layout.astro` (+11/-1) · `TODO.md` · `STATUS.md` ·
`perf/lh-mobile-baseline-tick7-2026-07-07_085505.json` (new) ·
`perf/lh-local-before-tick7-2026-07-07_090114.json` (new) ·
`perf/lh-local-after-tick7-2026-07-07_090315.json` (new).

**Commits:** (this tick — local only, per unattended tick constraint).

**Next up:** Rung VI EXPAND candidate #2 — ClipForge-driven case-study MP4
landings (2 files + `<video>` flip).

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

---

## 2026-07-07 · CompanySite · Rung IV MOBILE re-strike (session 9)

**Card:** CompanySite Rung IV SPEED
**Move to:** Done

**What shipped:** Fresh mobile PSI baseline exposed headroom the prior desktop
strike missed (mobile Perf 87 vs desktop 98 — mobile CPU throttle surfaces
what desktop hides). Two-strike fix, no new deps, no functional changes:

1. **`d620884` — inline all CSS + preload Space Grotesk woff2.**
   `astro.config.mjs` `inlineStylesheets: 'auto' → 'always'` eliminates the
   last render-blocking external CSS request (`/_astro/audit.*.css`, 202 ms
   of waste). `Layout.astro` preloads the H1 hero (LCP element) woff2 so it
   downloads in parallel with the stylesheet instead of after CSS parse.
2. **`90c95b4` — widened preload to Inter + JetBrains Mono woff2 subsets.**
   PSI post-`d620884` showed the direction was right but delta lived inside
   lab jitter (+1 score, −80 ms LCP). Widening preload made body + kicker
   fonts arrive in parallel too, compounding across a single preconnect.

**Measured delta (PSI mobile, live m3mm.net):**
- Perf **87 → 97 (+10)** ✓
- LCP **3051 → 2448 ms (−603 ms)** ✓✓
- FCP **3051 → 1741 ms (−1310 ms)**
- Speed Index **3731 → 1741 ms (−1990 ms)**
- TTI **3051 → 1741 ms (−1310 ms)**
- TBT / CLS remained 0 / 0

Session-guard finish line (score delta ≥ 3 OR LCP delta ≥ 100 ms) cleared
with room on BOTH criteria. Same-instrument LH mobile pair corroborates at
−1242 ms LCP (94 → 98). Tests 68/68 green after both commits; build 2 pages
in 1.21 s; zero new deps.

**Files touched:** `astro.config.mjs`, `src/layouts/Layout.astro`, `TODO.md`,
`STATUS.md`, `docs/lighthouse-baseline.md`, `perf/psi-mobile-*.json`,
`perf/lh-mobile-after-*.json`.

**Commits (5, all local, pushed once GUARDS_ACTIVE lifts):** `d620884`
(inline CSS + font preload) · `90c95b4` (widen preload) · `7748a3d` (PSI
final capture) · `7d8a18d` (docs finalize + LH final JSON) · `5c19929`
(docs enrich with PSI-3fonts row) · `97347b4` (STATUS ladder update).

**Next up:** Ladder Rung IV SPEED closed for this cycle. Rung V INSCRIBE
already close (README polished session 8). Next money rung = Rung VI EXPAND —
CockpitCloud lead sink (parallel-agent shipped scaffolding in `a286781`).

---

## 2026-07-07 · CompanySite · Rung IV strike #5 — bypass CF Email Obfuscation (tick-10)

**Card:** CompanySite Rung IV SPEED
**Move to:** In Progress (deploy-verified delta pending push)

**What shipped:** Fix landed in sibling-agent commit `9167f81`
(`perf(footer): kill CF email-decode.min.js render-block …`). Two agents
converged on the same bottleneck in parallel this tick — this session
independently walked the tick-10 mobile baseline against live m3mm.net
(`perf/lh-mobile-baseline-tick10-2026-07-07_121224.json`, Perf 94 / LCP
2531 ms), pinned the render-blocker to
`/cdn-cgi/scripts/…/email-decode.min.js` (206 ms wasted, in the LCP
critical chain via `network-dependency-tree-insight`), designed the same
data-attr split + inline hydrator; sibling committed Footer.astro first.

This session's companion contributions:
- **`perf/lh-local-after-tick10-2026-07-07_121758.json`** (new) — local
  astro preview post-fix, Perf 96 / LCP 2255 ms. Statistical parity with
  tick-7 local-after (98 / 2262 ms), as expected: fix targets a CF-edge
  behavior invisible to local preview.
- **`docs/lighthouse-baseline.md` § "Strike #5"** — full ledger entry
  with baseline JSON refs, bottleneck evidence, verification path, and
  the reason local delta is null by design.
- **`TODO.md` SHIPPED (tick 10)** — tick-10 record attributing sibling's
  commit and framing the deploy-verified delta as pending.

**Files touched:** `docs/lighthouse-baseline.md` · `TODO.md` ·
`COCKPIT_QUEUE.md` · `perf/lh-local-after-tick10-2026-07-07_121758.json`
(new).

**Commits (this tick — local only, per unattended tick constraint):** 1
companion commit — `docs(perf): tick-10 companion — CF Email Obfuscation
strike #5 ledger + local-after JSON`.

**Next up:** Deploy-verified delta requires a push. Once pushed, PSI
mobile against m3mm.net should recover the ~200 ms of email-decode
wasted-ms from the render-blocking path (score depends on lab jitter;
Perf floor should return to tick-9's 97).

---

## 2026-07-07 · CompanySite · CTA conversion audit — tick-8 (3 § gaps closed)

**Card:** CompanySite conversion pass — round 2
**Move to:** Done

**What shipped:** Second sweep of every CTA on m3mm.net against
`docs/CONVERSION_STANDARDS.md` §§ 1–4 (round 1 in `657e650` closed the
Services tier CTAs). This round targets the non-tier CTAs and the missing
attribution wiring on the intake form.

1. **§ 2 intent metadata:** Hero primary CTA, Header "Free review" button,
   and Footer "Free site review →" all lacked `data-intent`. Now all three
   carry `data-intent="book:free-review"` so intake_submit records real
   attribution instead of firing with `intent: undefined`.
2. **§ 4 attribution loop closure:** `prefill.ts` was writing intent into
   `form#intake-form input[name="intent"]` — a field that didn't exist on
   `Intake.astro`. Silent no-op. Added the hidden field; switched submit
   handler from textarea-prefix inference to reading the hidden field
   directly. This is what makes `book:*` attribution work (no CATALOG
   entry, so textarea inference could never fire).
3. **§ 1 destination handles promise:** Footer `mailto:` had no subject
   line, violating the "mailto with subject line" rule. Now opens with
   both a subject and a short body scaffold (Business / Current site /
   What's frustrating me) so footer-originated emails land legible.

Verified: `npm run build` clean, `dist/index.html` shows all 5
`data-intent` values (4 tiers + `book:free-review`), hidden intent field
renders, mailto carries subject+body.

**Files touched:** `src/components/Hero.astro`, `src/components/Header.astro`,
`src/components/Footer.astro`, `src/components/Intake.astro`,
`src/lib/prefill.ts`.

**Commit (1, local only per brief):** `64dc3c3` — `fix(cta): close
conversion gaps against CONVERSION_STANDARDS §§ 1–4`.

**Next up:** Attribution loop is now truly end-to-end for both tier and
book intents. Rung VI EXPAND (CockpitCloud lead sink) still the next money
rung.

