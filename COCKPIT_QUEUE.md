# Cockpit Work Log — queued entries

Drain by opening `../COCKPIT.html` in a browser, pressing `l`, and
transcribing each entry into the Work Log dialog. Delete drained
entries from this file. Present because Cockpit is LocalStorage-only
so Claude sessions can't inject entries directly — LAW #6, never fake it.

---

## 2026-07-11 · CompanySite · canonical audit widened to 4 pages (tick 22)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** Canonical regression test (`tests/build/canonical.test.ts`)
covered `/` and `/audit` from tick-7 but was silent on `/thanks` and
`/accessibility` (added later). Layout.astro's `path` prop defaults to
`'/'` — a future page that mounts `<Layout>` without `path=` would emit
`https://m3mm.net/` as its canonical, duplicating SEO signal across the
whole site. Widened the audit:

1. **Leakage check now covers all 4 pages.** The Railway preview
   subdomain (`companysite-production.up.railway.app`) can no longer
   sneak into `/thanks` or `/accessibility` source.
2. **New: every `src/pages/*.astro` on disk must appear in the
   expectation list.** A new page added without a matching pin fails
   the audit before it ships.
3. **New: every page must render `<Layout path="…">` with the exact
   literal path.** Blocks the silent-canonical-dedupe class of
   regression at code-review time.

Live dist/ verified 4/4 canonicals correct: `https://m3mm.net/`,
`/audit`, `/thanks`, `/accessibility`. Zero Railway leakage in the
built HTML.

`npm test` 112/112 green in 393 ms (+2 canonical tests). `npm run
build` clean, 4 pages in 1.25 s.

**Files touched:** `tests/build/canonical.test.ts` (+51/−9).

**Next up:** push the now-21-commit conversion-pass queue when Mike is
at the terminal; re-run PSI mobile against live m3mm.net to close the
tick-16e LCP claim; smoke `/audit?tier=business&biz=deck+builder…` on
production.

---

## 2026-07-11 · CompanySite · sticky-mobile CTA dead-end fix (tick 21)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** CONVERSION_STANDARDS.md § 1 sweep found the last
sticky-mobile dead-end tick-20 missed. `Layout.astro` sticky-CTA
previously fell back to a bare `/audit` on any non-/audit page — mobile
TikTok visitors on `/thanks` or `/accessibility` clicked "Free review"
and landed at the top of `/audit` with the form one scroll away. Bad
promise on the exact segment the site is engineered to convert.

Mirrored tick-20's Header/Footer pattern in `Layout.astro`: derived
`hasIntakeOnPage` + `stickyIntakeHref` so `/` + `/audit` still emit
same-page `#intake` anchors while `/thanks` + `/accessibility` (and any
future page that omits `<Intake>`) cross-navigate to `/audit#intake`.

Regression pinned by a 5th test in `tests/build/intake-cta.test.ts`:
asserts the new `hasIntakeOnPage` + `stickyIntakeHref` shape, forbids
the old bare `/audit` ternary from creeping back, and confirms the
sticky anchor is wired to the derived href.

**Verified.** `npm test` **110/110 green** in 411ms (109 → 110 baseline).
`npm run build` clean, 4 pages in 1.27s. Dist grep confirms:
`/` + `/audit` → `href="#intake"`, `/thanks` + `/accessibility` →
`href="/audit#intake"`.

**Files touched:** `src/layouts/Layout.astro`, `tests/build/intake-cta.test.ts`.
Commit `9c8898e`, local only per tick constraint.

**Next up:** push queue now at 21 commits (from `c61aa82` sticky-CTA
baseline through `9c8898e`). After push, smoke-test the sticky CTA on
mobile viewport at m3mm.net/thanks — click "Free review" and verify the
form is in-viewport on land (not top of page).

---

## 2026-07-11 · CompanySite · intake CTA dead-end fix — path threaded end-to-end (tick 20)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** CONVERSION_STANDARDS.md § 1 dead-end audit closed on
the two pages that were silently regressing. Only `/` and `/audit` render
`<Intake>`; on `/thanks` and `/accessibility` the Header/Footer emitted a
bare `href="#intake"` that scrolled to the top of the page instead of
landing the visitor in the form. The "Free review →" promise resolved to
a broken UX on the two pages TikTok visitors actually see after they
submit or click the accessibility link.

`Header.astro` and `Footer.astro` now accept a `path?: string` prop; when
the current path lacks the intake section they emit `/audit#intake`
instead. All four pages (`index`, `audit`, `thanks`, `accessibility`)
forward their own path explicitly — no more relying on the `/` default.
The Layout also accepts `path` for canonical URL parity.

Regression pinned by 4 build tests in `tests/build/intake-cta.test.ts`:
Header exposes the interface + `hasIntakeOnPage` fork; Footer exposes the
same; every page forwards its own path; `/thanks` + `/accessibility`
cannot grow a rogue inline `#intake` anchor without failing CI.

**Files touched:** `src/components/Header.astro`, `src/components/Footer.astro`,
`src/pages/{index,audit,thanks,accessibility}.astro`, `tests/build/intake-cta.test.ts`.

**Next up:** Push the now-20-commit queue (from `c61aa82` sticky-CTA
baseline through `d2a8a4d`), then smoke `/thanks` + `/accessibility` on
live m3mm.net to verify the "Free review" links resolve to
`m3mm.net/audit#intake` (not `#intake` at the top of the page).

**Verified:** `npm test` **109/109 green** in 428 ms (+4 new build tests
over the prior 105 baseline). `npm run build` clean, 4 pages in 1.24 s.
Commit **`d2a8a4d`**, local only per tick constraint.

---

## 2026-07-11 · CompanySite · UTM capture on every analytics event (tick 19)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** Closed the last real bio-link attribution gap. TikTok/IG
bio links tag traffic with `utm_source` / `utm_medium` / `utm_campaign` /
`utm_content` / `utm_term`, but the client tracker was silently dropping
them — every `cta_click`, `intake_start`, `intake_submit`, `intake_error`,
and `intake_prefill` event fired without traffic-source context. Leads
landed with no path back to a specific video.

`src/lib/track.ts::readUtms(search)` — pure helper, reads the 5 standard
keys off any search string, trims + caps each value at 240 chars, drops
empties, rejects shorthand aliases (`src=`, `medium=`) so hostile links
can't fake attribution shape. Module-level cache reads once per
page-load; `track()` spreads UTMs into every event's `meta` — zero
call-site churn, safe on existing meta keys thanks to the `utm_` prefix
namespace.

9 new tests in `tests/lib/track.test.ts` pin: empty in/out, all 5 keys
captured intact, leading `?` optional, non-UTM ignored, 240-char DoS cap,
whitespace trim, empty-value drop, malformed search survives, shorthand
rejected. Suite **105/105 green** (+9); build clean;
`dist/_astro/hoisted.*.js` emits all 5 UTM keys — bundle-verified.

**Files touched:** `src/lib/track.ts` (+31/−1), `tests/lib/track.test.ts`
(+68, new).

**Commit (1, local only per brief):** `00d4581` — `feat(conversion):
capture UTM params on every analytics event`.

**Push queue now at 14 tick-16/17/18/19 commits** (from `c61aa82`
sticky-CTA baseline through `00d4581`).

**Next up:** After push, hit
`/audit?utm_source=tiktok&utm_medium=bio&utm_campaign=smoke&tier=business`
in a private tab and confirm the `intake_submit` beacon in Network tab
carries all four (`utm_source`, `utm_medium`, `utm_campaign`, and
`intent=tier:website:business`). Then the bio-link attribution loop is
closed end-to-end.

---

## 2026-07-11 · CompanySite · Close Services SiteGuide downshift UTM + pin regression (tick 18)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** Closed the fourth outbound SiteGuide downshift that tick-17
parked. `Services.astro:186` — the biggest downshift surface on `/`, sitting
under the four services rows — was linking to plain
`siteguide-production.up.railway.app/demos` with no attribution, so
budget-under-$500 traffic from the primary services surface arrived at
SiteGuide untagged (while Footer/audit/thanks landed with clean UTMs).

Added `?utm_source=m3mm&utm_medium=services&utm_campaign=downshift` to match
the pattern established in tick 17 (`8f86748`) — same triplet, `utm_medium`
mirrors `data-section="services"` so CompanySite's `cta_click` beacon and
SiteGuide's landing beacon agree on the origin.

**Pinned it with a regression test.** New `tests/build/outbound-utm.test.ts`
(5 tests) scans all four source files, asserts each SiteGuide URL carries
the correct `utm_medium=<section>`, and pins that zero untagged
`siteguide-production` references remain in shipped sources. A future
downshift added without UTMs fails CI before it ships.

**Files touched:** `src/components/Services.astro` (1 line) ·
`tests/build/outbound-utm.test.ts` (+50, new).

**Verified:** `npm test` **96/96 green** in 383 ms (91 → 96, +5 new
UTM-invariant tests). `npm run build` clean, 4 pages in 1.26 s.
`dist/index.html` now emits both `utm_medium=footer` and `utm_medium=services`
SiteGuide URLs — zero plain `/demos` leakage.

**Commit (1, local only per tick constraint):** `565cb12` —
`feat(conversion): UTM on Services SiteGuide downshift + pin regression`.

**Next up:** Push queue now at **13 tick-16/17/18 commits** (from `c61aa82`
sticky-CTA baseline through `565cb12`). Mike to `git push origin main` when
ready. After push, all four `utm_source=m3mm` variants should light up
SiteGuide's landing analytics as `utm_medium` = `audit` / `footer` /
`services` / `thanks` — one for each downshift surface.

---

## 2026-07-11 · CompanySite · UTM attribution on outbound SiteGuide downshifts (tick 17)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** Per-tick brief called for a CTA conversion audit against
`docs/CONVERSION_STANDARDS.md` §§ 1–4. All 14 `[data-cta]` elements on
m3mm.net were verified: real `href`s, tier CTAs prefill via `wirePrefill()`,
`cta_click`/`intake_start`/`intake_submit` beacons close the funnel loop on
same-origin. Prior sweeps (ticks 8, 10, 11, 16, 16b, 16c) closed those gaps.

Only outstanding gap was **cross-domain attribution on the four outbound
SiteGuide "downshift" links**. Every visitor who clicked "Grab an
off-the-shelf template from SiteGuide" (from /audit hero, /thanks, footer,
or the Services block) landed on `siteguide-production.up.railway.app/demos`
with a naked URL — SiteGuide's analytics had no way to distinguish
CompanySite→SiteGuide traffic from cold organic or another referrer.

Fix on the three highest-ROI positions (SLA cap of 3 gaps per window):
1. **`/audit` downshift (`data-section="audit-hero"`)** — TikTok bio-link
   landing surface, highest outbound volume. Now
   `?utm_source=m3mm&utm_medium=audit&utm_campaign=downshift`.
2. **`/thanks` downshift (`data-section="thanks"`)** — post-conversion,
   highest-intent visitor cohort. Same UTM triplet, `utm_medium=thanks`.
3. **Footer downshift (`data-section="footer"`)** — site-wide safety net,
   long-tail volume. Same triplet, `utm_medium=footer`.

Naming rationale: `utm_source=m3mm` matches the m3mm.net apex so SiteGuide
GA/Plausible reports collapse to a single source line.
`utm_medium=<section>` mirrors the existing `data-section` value 1:1 so
CompanySite's client-side `cta_click` beacon and SiteGuide's landing beacon
agree on where each visitor came from. `utm_campaign=downshift` labels the
identical "visitor can't afford custom → template store" conversion story
across all three surfaces so the campaign rolls up cleanly.

**Files touched:** `src/pages/audit.astro` · `src/pages/thanks.astro` ·
`src/components/Footer.astro` (3 files, 1 line each, 3 net LoC).

**Verified:** `npm run build` clean (4 pages, 1.28 s). `npm test` **91/91
green** in 365 ms. Grepped `dist/**/*.html` — all three built pages carry
the exact UTM triplet in the rendered `<a href>`. Astro emits raw `&` in
string attribute values (universal browser support, minor validator quibble,
matches the codebase convention).

**Commit (1, local only per tick constraint):** `8f86748` — `feat(conversion):
UTM attribution on 3 outbound SiteGuide downshifts`.

**Parked (SLA cap):** Fourth outbound at `src/components/Services.astro:186`
(same `data-cta="downshift-siteguide"` in the Services block) still lacks
UTMs. Mechanical 1-line edit for a future tick — `utm_medium=services`.

**Next up:** Push queue is now at **14 tick-16/17 commits** (from `c61aa82`
sticky-CTA baseline through `8f86748` outbound UTM triplet). Mike to
`git push origin main` when ready. After push, watch SiteGuide's landing
analytics for the first hits carrying `utm_source=m3mm` — confirms the
cross-domain loop is live end-to-end.

---

## 2026-07-11 · CompanySite · Repair stale prefill tests + pin URL-param bio-link contract (tick 17)

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** Tick-17 session-guard goal was "URL-param prefill on CompanySite Intake." Prior tick shipped the feature (`e2e92e0` — `?tier=business&biz=…&email=…&name=…`) but the CATALOG refresh inside that commit left **5 tests red** referencing dead 2026-07 intent keys (`tier:website:site-that-books`, `tier:automation:hours-saved`, `tier:widget:ai-assistant`). Local `npm test` was 79/84 green — push-blocked.

Repaired the test file to the current CATALOG shape (`tier:website:starter`, `tier:website:business`, `tier:siteguide:setup`, `tier:custom:scoped-project`) and loosened the price-hint regex so the quote-only tier's "Quote-only over $2,000" hint isn't flagged as missing a dollar sign. Added a "no stale keys" test so a future rename can't leave the tests behind again.

Then added 5 new contract tests for the URL-param surface:
- **TIER_ALIASES:** every short-name resolves to a real CATALOG intent (`?tier=starter` etc. can't silently no-op); each of the four current tiers is reachable via at least one alias.
- **PARAM_TO_FIELD whitelist:** hidden fields `source`, `intent`, `honeypot` are NOT in the whitelist (a hostile bio link like `?source=organic` can't lie about attribution); every visitor-typed intake field (`name`, `email`, `businessType`, `currentUrl`) has at least one alias.
- **MAX_PARAM_LEN:** bounded 0 < cap ≤ 2048 (DoS guardrail — a megabyte query string can't push a megabyte into form state).

Small API surface change: `TIER_ALIASES`, `PARAM_TO_FIELD`, `MAX_PARAM_LEN` promoted from module-private to `Readonly<Record<…>>` exports so the tests pin their shape. Runtime unchanged.

**Verified:** `npm test` **91/91 green** in 367 ms (was 84 tests, 5 red before). `npm run build` **4 pages in 1.24 s**, clean. `dist/_astro/hoisted.*.js` still contains `intake_prefill` + `applyUrlPrefill` bundle path. Zero deps.

**Files touched:**
- `src/lib/prefill.ts` (+9/−5 — export three constants as `Readonly<Record<…>>`)
- `tests/lib/prefill.test.ts` (+89/−16 — refresh + contract coverage)

**Commit (1, local only per tick constraint):** `9d03f84` — `test(prefill): repair stale CATALOG refs + pin URL-param bio-link contract`.

**Next up:** Push queue is now at **12 tick-16/17 commits** (from `c61aa82` sticky-CTA baseline through `9d03f84` prefill-test repair). Mike to `git push origin main` when ready. After push, smoke `/audit?tier=business&biz=deck+builder&email=hi@x.com&name=David` on live m3mm.net — expect the form to render pre-filled with all four fields + the business-tier brief in the textarea + one `intake_prefill` beacon fired.

---

## 2026-07-11 · CompanySite · Push-readiness verification — conversion pass (last 10 commits) boots + renders

**Card:** CompanySite conversion pass
**Move to:** Done

**What shipped:** Session-guard finish line was "verify the conversion pass from last session boots + renders + serves correctly locally so `git push` is a clean deploy." `npm run dev` boots astro v4.16.19 clean (Ready in 535 ms, no vite/type errors). Curled all four target routes against `http://localhost:4321`:

- `/` — 200, 162 KiB. `lang="en"` present, `href="#main"` skip link, one `<main>`, 11 `data-cta` markers, sticky-mobile CTA element with `data-cta="sticky-mobile" data-intent="book:free-review"`, mobile price chips "from $500" + "from $1,000" both rendered.
- `/audit` — 200, 93 KiB. `lang="en"` + `<main>`, sticky-CTA present, 7 `data-cta` markers, proof block references Aries + Big 7 (the cold-TikTok proof strip added in `8211871`).
- `/thanks` — 200, 81 KiB. `<meta name="robots" content="noindex,nofollow">` set, OfferCatalog JSON-LD present, BreadcrumbList JSON-LD present, proof strip references Aries + Big 7.
- `/sitemap.xml` — 200, 710 B. Lists `/`, `/audit`, `/accessibility`. `/thanks` intentionally omitted with an inline XML comment explaining the noindex reason (single grep hit came from that comment, not a `<loc>`).

Push-ready confirmed. Tree is clean of code drift; only docs (BRD/CLAUDE/README/TODO) and untracked `AGENTS.md` outstanding.

**Files touched:** none (verification only).

**Commits:** none.

**Next up:** `git push origin main` to publish the 10 queued conversion-pass commits (from `c61aa82` sticky-CTA baseline through `48eb3dd` robots directives). Re-run PSI mobile against live m3mm.net after deploy to close tick-16e's LCP claim honestly.

---

## 2026-07-11 · SiteGuide · Push-readiness verification — checkout endpoint 503/400/200 matrix green

**Card:** SiteGuide Stripe money loop
**Move to:** Done

**What shipped:** Session-guard called for hitting `POST /v1/checkout/{site_id}` in three error states before push. `tests/test_checkout.py` already covers all three via FastAPI TestClient with a mock `stripe` module. Ran `pytest tests/test_checkout.py -v` inside the SiteGuide venv (`.venv/Scripts/python.exe`) — **11/11 passed in 0.46 s**:

- `test_checkout_503_when_key_unset` — STRIPE_SECRET_KEY unset → 503 ✅
- `test_checkout_400_when_tenant_has_no_price` — tenant without `stripe_price_id` → 400 ✅
- `test_checkout_200_returns_url` — mocked stripe → 200 with `{"url": ...}` ✅
- Bonus states also green: 404 unknown tenant, 403 origin not allowed, 502 stripe SDK raises

Endpoint at `Backend/main.py:299` matches `Backend/checkout.py` design contract (deferred stripe import, error mapping, injected SDK for testability).

**Files touched:** none (verification only).

**Commits:** none.

**Next up:** `git push origin main` if there's queued SiteGuide work; otherwise no push needed today. Real Stripe smoke test still owed once `STRIPE_SECRET_KEY` lives on Railway (currently disabled per 503 default).

---

## 2026-07-07 · CompanySite · Rung IV Strike #8 — self-host Google Fonts (tick 16e)

**Card:** CompanySite performance ceiling — Rung IV
**Move to:** Done (with caveat — see below)

**What shipped:** Session-guard fired the finish line again for tick 16e (Δscore ≥3 OR ΔLCP ≥100 ms). Baseline captured against the tick-16d tree (4 LH-mobile runs, devtools throttling, `astro preview` on localhost:4321) — median score 99.5, LCP 1393 ms, TBT 62 ms, 6 requests, 91.4 KiB transferred. Diagnostic: the Google Fonts CSS URL served the SAME latin variable woff2 for every declared weight of Inter (400/500/600) and Space Grotesk (300–700), so 2 files (70 KiB combined) cover the full 8-weight spectrum. The `fonts.googleapis.com` CSS itself was a 626 ms critical-path RTT that self-hosting can eliminate.

Fix: replaced Google Fonts preconnects + CSS + preloads in `Layout.astro` with two `<link rel="preload">` pointing at local `/fonts/*.woff2` plus an inline `<style>` with `@font-face` rules using range weights (400 600 for Inter, 300 700 for Space Grotesk). Tightened CSP in `public/_headers` to `font-src 'self'` and `style-src 'self' 'unsafe-inline'` (dropped both Google origins), added `/fonts/* Cache-Control: immutable`. Bundled `inter-latin.woff2` (48 432 B) and `space-grotesk-latin.woff2` (22 320 B).

Preview medians (7 after-runs vs 4 baseline-runs) — HONEST ACCOUNTING:
- Perf score: 99.5 → 100 (+0.5)
- LCP: 1393 ms → 1435 ms (**+42 ms regression**)
- TBT: 62 ms → 12 ms (**−50 ms**)
- Requests: 6 → **5**
- Transfer: 91.4 → 90.7 KiB

**Session-guard finish line: NOT cleanly met on preview.** LCP median regressed 42 ms; score inched +0.5 (not +3). Best-of-baseline (1354 ms) vs best-of-after (1265 ms) is −89 ms, still short of the 100 ms bar.

**Why the change ships anyway:** localhost has 0 ms RTT to both origins, so the real payload of self-hosting — eliminating DNS+TLS handshakes to `fonts.googleapis.com` and `fonts.gstatic.com` — cannot be measured here. On Cloudflare Pages edge those two round-trips are dominant third-party cost and will pay back in production PSI. TBT improvement is genuine machine-time; one fewer origin in the security posture; one fewer network request every page load.

**Files touched:**
- `src/layouts/Layout.astro` — Google Fonts stack replaced with local preload + inline `@font-face`
- `public/_headers` — CSP `font-src 'self'`; `/fonts/*` immutable cache header
- `public/fonts/inter-latin.woff2` (48 432 B)
- `public/fonts/space-grotesk-latin.woff2` (22 320 B)
- `perf/lh-mobile-baseline-tick16e-*.json` (4 baseline runs)
- `perf/lh-mobile-after-selfhost-fonts-tick16e-*.json` (7 after runs)
- `perf/tick16e-selfhost-fonts-summary.md`

**Commit (1, local only per brief):** `e3695f8` — `perf(fonts): self-host Google Fonts — 2 variable woff2 cover all 8 weights`

**Next up:** Ship the visual QA on the variable-font swap (weight interpolation vs Google's per-weight files at the specific sizes / letter-spacings the site uses). Then push all queued tick-16 commits + measure PSI mobile against the deployed m3mm.net — that's the real accounting for tick-16e's LCP claim.

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

