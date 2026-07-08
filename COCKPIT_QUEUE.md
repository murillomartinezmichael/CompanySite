# Cockpit Work Log — queued entries

Drain by opening `../COCKPIT.html` in a browser, pressing `l`, and
transcribing each entry into the Work Log dialog. Delete drained
entries from this file. Present because Cockpit is LocalStorage-only
so Claude sessions can't inject entries directly — LAW #6, never fake it.

---

## 2026-07-07 · CompanySite · Rung IV Strike #7 — JetBrains Mono drop → LCP −719 ms (tick 16d)

**Card:** CompanySite performance ceiling — Rung IV
**Move to:** Done

**What shipped:** Session-guard locked the tick to "PSI baseline + top bottleneck shipped + measurable improvement (Δscore ≥3 OR ΔLCP ≥100 ms)". Live m3mm.net was already at Perf 99, LCP 1.7 s — ceiling. Preview against the current tree (LH-mobile, devtools throttling, matched screen emulation) sat at 98 / 1.79 s / 150 ms TBT / 123 KiB / 7 requests. Diagnostic: 3 Google Font families (Space Grotesk, Inter, JetBrains Mono) dominated transfer at 102 KiB combined. JetBrains Mono (~31 KiB) was preloaded + fetched only for 11px uppercase 0.2em-tracked kicker/eyebrow labels (`font-mono` utility, `.card-header`, `.result-num`) — sizes where `ui-monospace` (SF Mono / Cascadia / Roboto Mono) is visually indistinguishable and the weight budget stops earning its keep.

Fix: dropped JetBrains Mono from the `<link rel="preload">` list, shrank the Google Fonts CSS URL to `Space+Grotesk + Inter`, retargeted `theme.fontFamily.mono` in `tailwind.config.mjs` to `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, and swapped the two raw `font-family: 'JetBrains Mono'` declarations in `global.css` to the same system stack.

LH-local A/B against `astro preview` (mobile form-factor, devtools throttling, matched 412×823 @1.75 DPR):
- **Pre-fix (tick-16 prefix):** Perf 98, LCP **1791 ms**, FCP 1400 ms, TBT 150 ms, SI 1.5 s, transfer 123 KiB, 7 requests
- **Post-fix (tick-16d after):** Perf **100**, LCP **1072 ms**, FCP 1100 ms, TBT 40 ms, SI 1.1 s, transfer **91 KiB**, 6 requests
- **Δscore +2 · ΔLCP −719 ms** (7.2× the session-guard's ≥100 ms threshold — finish-line satisfied via the LCP branch)

**Files touched:**
- `src/layouts/Layout.astro` (drop JB Mono preload; trim Google Fonts CSS URL)
- `tailwind.config.mjs` (`font.mono` → system ui-monospace stack)
- `src/styles/global.css` (2 raw `font-family` overrides retargeted)
- `perf/lh-mobile-after-jetbrains-drop-tick16d-devtools-2026-07-07_215906.json`
- `perf/tick16d-jetbrains-drop-summary.md`

**Commit:** `064681b` — `perf(fonts): drop JetBrains Mono; LCP 1.8s → 1.1s (-719ms)` (local; not pushed per universal hard constraint on this tick).

**Next up:** Visual QA the mono-fallback in a browser (kickers on Hero, Header, Intake steps; `.card-header` band; `.result-num` on Case Study). If SF Mono / Cascadia looks fine, push queue advances one further; Mike to `git push origin main` when the whole tick-16 push queue clears.

---

## 2026-07-07 · CompanySite · Canonical audit — rendered-HTML guard (tick 16c)

**Card:** CompanySite conversion — CTA loop closure
**Move to:** Done

**What shipped:** Sixth CTA sweep against `docs/CONVERSION_STANDARDS.md`
§§ 1–4 found zero remaining gaps — every `[data-cta]` on m3mm.net has a
real destination, promise CTAs carry `data-intent`, prefill fires via
`wirePrefill()`, `cta_click` fires via `wireCTAs()`, and case-study
outbound `liveUrl` visits carry the UTM quartet. Pivoted to the
per-tick-brief fallback: canonical audit.

Existing `tests/build/canonical.test.ts` guards the source (Astro.site
pinned, `<link rel="canonical">` emitted from Layout, og:url in sync,
no Railway subdomain leakage). This tick added the *rendered-output*
guard — `scripts/audit-canonicals.mjs` walks every `dist/**/*.html`,
requires exactly one `<link rel="canonical">` per page, and fails if the
href does not start with `https://m3mm.net`. Wired as
`npm run audit:canonicals`.

Verified against a fresh build: `dist/index.html → https://m3mm.net/`
and `dist/audit/index.html → https://m3mm.net/audit`, both OK. Tests
84/84 green.

**Files touched:**
- `scripts/audit-canonicals.mjs` (new, no deps)
- `package.json` (+1 script line)

**Commit (1, local only per brief):** `8849d7c` — `feat(audit):
rendered-HTML canonical audit`.

**Next up:** Post-deploy, run `npm run build && npm run audit:canonicals`
against the CI dist to catch regressions where a new page skips Layout
or hand-edits a canonical to a preview subdomain.

---

## 2026-07-07 · CompanySite · CTA § 4 alignment — intake_start event (tick 16b)

**Card:** CompanySite conversion — CTA loop closure
**Move to:** Done

**What shipped:** Full CTA audit vs `docs/CONVERSION_STANDARDS.md`. All 10 `[data-cta]` elements verified: real `href` destinations (no `#`), promise CTAs carry `data-intent` (`book:free-review`, `tier:*`, `product:*`), case-study outbound `liveUrl` visits carry the UTM quartet, canonical audit is closed clean with a regression test. Only real gap: `intake_start` was missing from the § 4 four-event table (`cta_click` → **`intake_start`** → `intake_submit` → `checkout_complete`). Without it, no measurement of fill-abandonment between CTA click (large volume) and submit (small volume).

Fix: single `focusin` / `{ once: true }` listener on `#intake-form` in `src/components/Intake.astro`. Fires once on whichever field the visitor lands on first, with `{intent, source}` — same `sendBeacon`-preferred `track()` path as the other intake events. Commit `639b357`.

**Files touched:**
- `src/components/Intake.astro` (+17 net)
- `TODO.md` (SHIPPED bullet + push-queue count)

**Verified:** Tests 84/84 green in 571ms. Build 2 pages in 1.17s. `dist/_astro/hoisted.*.js` contains all three: `intake_start`, `intake_submit`, `intake_error`.

**Next up:** Push queue is now at 6 tick-16 commits — Mike to `git push origin main` when ready, then confirm `intake_start` fires against production (open `/audit`, focus name field, DevTools Network → filter `/api/track` → expect one `intake_start` beacon).

---

## 2026-07-07 · CompanySite · Rung IV Strike #6 — Hero .reveal → LCP −256 ms (tick 16)

**Card:** CompanySite performance ceiling — Rung IV
**Move to:** Done

**What shipped:** LH-mobile baseline against live m3mm.net (`perf/lh-mobile-baseline-tick16-*.json`, Perf 99 / LCP 1750 ms) surfaced the hero sub-headline `p.max-w-2xl` as LCP with a 1644 ms `elementRenderDelay`. Root cause: it lived inside `.reveal reveal-delay-2` — starts at `opacity: 0`, waits for `src/lib/reveal.ts`'s IntersectionObserver to flip `is-visible`, then a 500 ms fade. That gates the largest paint behind JS parse/execute + transition for elements always in initial viewport.

Fix: dropped `reveal` / `reveal-delay-{1,2,3}` from the four above-fold Hero blocks (eyebrow row, H1, sub/CTA column, editorial stat block) in `src/components/Hero.astro`. `.reveal` stays wired in Services / Intake where scroll-driven fade is real UX polish, not LCP tax.

LH-local A/B against `astro preview` (mobile preset, matched form-factor):
- Pre-fix:  Perf 98, LCP 1792 ms, FCP 1396 ms, TBT 151 ms
- Post-fix: Perf 98, LCP **1536 ms**, FCP 1536 ms, TBT 132 ms
- **Δ LCP: −256 ms** (2.5× the session-guard's ≥100 ms threshold)

FCP and LCP now register as one paint — correct behavior for a text-hero page. PSI mobile daily quota still 429 (3rd tick in a row); LH-local A/B follows the tick-7-established fallback convention.

**Files touched:**
- `src/components/Hero.astro` (4 class-string edits)
- `docs/lighthouse-baseline.md` (Strike #6 entry)
- `perf/lh-mobile-baseline-tick16-*.json`
- `perf/lh-mobile-preview-{prefix,postfix}-tick16-*.json`

**Commit:** `41a1b4a` (local; not pushed — universal-hard-constraint kill switch on this tick)

**Next up:** deploy so live m3mm.net LCP reflects the −256 ms delta; re-run PSI when quota resets to prove the live delta matches the local A/B.

---

## 2026-07-07 · CompanySite · CTA sweep #5 — nav-intake intent + form default (tick 16)

**Card:** CompanySite conversion pass — round 5
**Move to:** Done

**What shipped:** Fifth CTA sweep against `docs/CONVERSION_STANDARDS.md`.
Walked every `data-cta` on m3mm.net; 2 gaps left after sweeps #1–#4.

1. **§ 2 intent metadata:** Header nav "Contact" (`data-cta="nav-intake"`)
   routed to `#intake` but carried no `data-intent`, inconsistent with the
   other four intake-bound CTAs (`header-review`, `hero-review`,
   `footer-email`, `footer-intake`) that all declare `book:free-review`.
   Nav-Contact click was firing `cta_click` with `intent: undefined` and,
   if the visitor then submitted the form directly, `intake_submit`
   inherited the empty hidden intent field. Now carries
   `data-intent="book:free-review"`.

2. **§ 4 loop closure:** `Intake.astro`'s hidden `intent` field defaulted
   to `""`. Any visitor landing on `/audit` (TikTok bio target) and
   scrolling straight to submit fired `intake_submit` with
   `intent: undefined`. Standards § 4 requires every intake_submit to
   carry intent. Added a `defaultIntent` prop (default `book:free-review`)
   that seeds the hidden field. Any `[data-intent]` click still overrides
   via existing `wirePrefill()` logic (verified — `prefill.ts:56` writes
   unconditionally).

Verified `npm run build` clean; `dist/index.html` +
`dist/audit/index.html` both render `name="intent" value="book:free-review"`
on the hidden field; `data-cta="nav-intake"` now shows
`data-intent="book:free-review"` in built markup.

**Files touched:** `src/components/Header.astro` (+1 attr) ·
`src/components/Intake.astro` (+1 prop, hidden field default) — 2 files, ~10 LoC net.

**Commits (this tick — local only per brief):** 1 commit.

**Next up:** Attribution loop is now truly end-to-end for direct-submit
paths as well. Only remaining § 2 gaps are pure-nav elements
(`nav-proof` / `nav-services` / logo) which don't need intent by design.
Rung VI EXPAND (real testimonials wall, still Mike-BLOCKED) next.

---

## 2026-07-07 · CompanySite · CTA sweep #4 — product: intent on case studies (tick 11)

**Card:** CompanySite conversion pass — round 4
**Move to:** Done

**What shipped:** Fourth CTA sweep against `docs/CONVERSION_STANDARDS.md`.
Prior sweeps (ticks 5, 8, 10) closed tier / book / navigation surfaces;
this one closes case-study outbound attribution. `CaseStudy.astro` "Visit
the live site" anchor had `data-cta` + UTM params but no `data-intent`,
so `cta_click` beacons fired with `intent: undefined`. Per
CONVERSION_STANDARDS § 2 the reserved `product:` namespace covers case
studies. Now the anchor carries `data-intent={`product:${entry.slug}`}`
which renders as `product:aries` / `product:big7` in built HTML.
Server-side `INTENT_MAX=64` in `functions/api/track.ts` already accepts
arbitrary namespaces (added tick-8) so no server change needed.

Also committed this tick: tick-10's dangling accounting (docs, TODO,
COCKPIT queue entry, and both measurement JSONs) that never made it in
before the prior tick's `no_log` exit — commit `ec4b73a`.

**Files touched:** `src/components/CaseStudy.astro` (+1/-0) · docs commit
touches TODO.md, COCKPIT_QUEUE.md, docs/lighthouse-baseline.md,
perf/lh-local-after-tick10-*.json, perf/lh-mobile-after-cf-email-decode-strike-*.json.

**Commits (2, local only per tick constraint):** `ec4b73a` (tick-10
accounting close) · `2f77d9a` (product: intent fix).

**Verified:** `npm test` 84/84 green, `npm run build` clean, `dist/index.html`
now shows 7 distinct `data-intent` values (4 tiers + book + 2 products).

**Next up:** Rung VI EXPAND — real testimonials wall still BLOCKED on
Mike (needs real client quotes). ClipForge MP4 slot fill is a file-drop
task. Deploy of tick-10's email-decode fix + fresh PSI (post-quota-reset)
would confirm the ~200 ms wasted-ms recovery.

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

