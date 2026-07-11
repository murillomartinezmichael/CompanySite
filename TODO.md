# CompanySite — TODO

**Cold-start rule:** a fresh session should read this file and be productive in 60 seconds.

---

## NEXT ACTION

**`git push origin main`** — **20** queued conversion-pass commits (from `c61aa82` sticky-CTA baseline through `d2a8a4d` intake-CTA dead-end fix) are verified push-ready. `npm test` **109/109 green** as of tick 20 (+4 new intake-CTA build tests). After push, re-run PSI mobile against live m3mm.net to close tick-16e's LCP claim honestly, and smoke `/audit?tier=business&biz=deck+builder&email=hi@x.com&name=David` to confirm the URL-param prefill fires end-to-end on production. Then smoke `/thanks` + `/accessibility` to confirm the "Free review →" links in Header/Footer navigate to `/audit#intake` (not silently scroll to top). Then check SiteGuide analytics for the four expected `utm_source=m3mm` variants (`utm_medium` = `audit`/`footer`/`services`/`thanks`).

Then continue the offer-ladder repositioning (partially satisfied by the conversion pass — `/` already renders "from $500" + "from $1,000" price chips):

1. ~~Verify the live Services copy says: $500 basic, $1k-$2k bounded business site, quote-only over $2k~~ — home price chips confirmed 2026-07-11; audit the full Services section on live post-push.
2. Add a soft SiteGuide cross-sell for DIY/template buyers.
3. Mobile-smoke the services rows so the longer copy still scans at 375px.
4. Run `npm test` + `npm run build`; ship only if both pass.

---

**Rung VI EXPAND — one money-impacting capability from the brief not yet
built.** Candidates (ordered by money impact, not interest):

1. **Real testimonials wall** — swap the placeholder quotes for real
   client words (David Serrano / Aries + Big 7 owner). Conversion lift
   on the section directly above `/intake`. **BLOCKED on Mike:** need
   real quotes; refuses to fabricate (LAW VI).
2. **ClipForge-driven case-study MP4 landing** — the two `<video>` slots
   in Aries + Big 7 case studies stub to poster-only. Slotting real
   MP4s is 2 files + a `<video>` flip, not a build change.
3. ~~Namespace extension for generic "Free review" CTAs~~ **DONE tick-5
   2026-07-07** — commit `64dc3c3`. Used existing reserved `book:`
   namespace (§ 2 already covers "consult" = free review), so no
   shared-doc edit needed. `data-intent="book:free-review"` now on
   Header / Hero / Footer generic CTAs + footer mailto. Hidden `intent`
   input on intake form captures the value on click (any CTA, not just
   tier-mapped ones) so `intake_submit` carries attribution for the
   generic-CTA funnel too.

`/api/lead` → CockpitCloud sink SHIPPED session-10 (sibling agent, commit
`a286781`). Rung VI EXPAND candidate #1 done.

Ladder Rung IV SPEED is CLOSED for this cycle. Next Rung IV strike
opens when a new feature ships that could regress perf (measured, not
speculative).

---

## SHIPPED (2026-07-11 — tick 24: non-reserved intent namespaces retired + pin invariant)

- **CONVERSION_STANDARDS.md § 2 gap closed.** CTA sweep across `src/` found 6 CTAs using intent namespaces not in the reserved set (`tier:` / `product:` / `feature:` / `plan:` / `book:` / `checkout:`) — `browse:`, `downshift:`, and `urgent:` were silently invented and violated the § 2 "don't invent new namespaces silently" rule.
- **Remapped to reserved namespaces** (tick constraint bans shared-doc edits, so extending the reserved list at `../docs/CONVERSION_STANDARDS.md` was off-table):
  - `downshift:siteguide-templates` → `product:siteguide` (4× — Services / Footer / audit / thanks). SiteGuide is an M³ product.
  - `browse:case-studies` → `product:case-studies` (thanks). Aggregate portfolio browse.
  - `urgent:direct-email` → `book:urgent-review` (thanks). Booking action, direct-email variant.
- **Regression pinned by `tests/build/reserved-intent-namespaces.test.ts` (9 tests).** Walks every `.astro/.ts/.tsx/.html` in `src/`, extracts literal `data-intent` values, asserts each starts with a reserved namespace. Pins the two files allowed to use template-literal intents (`CaseStudy.astro` `product:${slug}` and `Services.astro` `{s.intent}`) so a future silent drift into interpolated intents fails CI. Also asserts `Services.astro`'s tier CATALOG intents remain reserved.
- **Verified.** `npm test` **127/127 green** in 410 ms (+9). `npm run build` clean, 4 pages in 1.34 s. `dist/` contains zero `downshift:` / `browse:` / `urgent:` references; new reserved intents render across all 4 pages.
- **Files:** `src/components/{Services,Footer}.astro` · `src/pages/{audit,thanks}.astro` · `tests/build/reserved-intent-namespaces.test.ts` (new).

---

## SHIPPED (2026-07-11 — tick 20: intake-CTA dead-end fix, path threaded end-to-end)

- **CONVERSION_STANDARDS § 1 gap closed on `/thanks` + `/accessibility`.** Only `/` and `/audit` render `<Intake>`, so Header/Footer's bare `href="#intake"` on the other two pages silently scrolled to the top instead of landing the visitor in the form. TikTok visitors who submit and land on `/thanks` clicked "Free review →" and nothing changed — silent broken promise.
- **`Header.astro` + `Footer.astro`** now accept `path?: string`; when the current path lacks `<Intake>`, the emitted href becomes `/audit#intake` — a cross-navigation to the page that actually mounts the form.
- **All four pages forward path explicitly** (index=`/`, audit=`/audit`, thanks=`/thanks`, accessibility=`/accessibility`). No more silent fall-through to the `/` default — a future page (about, pricing, etc.) that omits the prop fails the build test before it can regress.
- **Regression pinned by 4 build tests in `tests/build/intake-cta.test.ts`:** Header interface + `hasIntakeOnPage` fork, Footer same, per-page path forwarding, and no-rogue-inline-`#intake` on the two intake-less pages.
- **Verified.** `npm test` **109/109 green** in 428 ms (+4 build tests over 105 baseline). `npm run build` clean, 4 pages in 1.24 s. Local only per tick constraint.
- **Files:** `src/components/{Header,Footer}.astro` · `src/pages/{index,audit,thanks,accessibility}.astro` · `tests/build/intake-cta.test.ts` (new). Commit **`d2a8a4d`**.
- **Push queue now at 20 commits** (from `c61aa82` sticky-CTA baseline through `d2a8a4d`).

---

## SHIPPED (2026-07-11 — tick 19: UTM capture on every analytics event)

- **Real conversion gap closed.** Bio-link UTM params (`utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term`) were being silently dropped by the client tracker. Every `cta_click`, `intake_start`, `intake_submit`, `intake_error`, and `intake_prefill` event was firing with no traffic-source context — so a TikTok bio link like `/audit?utm_source=tiktok&utm_medium=bio&utm_campaign=aries-video` produced leads that couldn't be attributed back to a specific video.
- **`src/lib/track.ts::readUtms(search)`** — pure helper (testable outside a browser) reads the 5 standard UTM keys off any search string, trims + caps each value at 240 chars, drops empties, ignores non-UTM shorthand (`src=`, `medium=`, `campaign=`) so hostile bio links can't fabricate attribution shape.
- **Module-level cache** — `utmsForPayload()` reads once per page-load; every `track()` call spreads the cached UTMs into `meta`, so every analytics stage (CTA loop § 4) carries the same traffic source without touching call sites. Zero regression risk on existing meta keys — new keys are namespaced with `utm_` prefix.
- **Coverage: 9 new tests.** `tests/lib/track.test.ts` pins: (1) empty-in / empty-out invariant, (2) all 5 UTM keys captured intact, (3) leading `?` optional, (4) non-UTM keys ignored, (5) 240-char cap, (6) whitespace trim, (7) empty values dropped, (8) malformed search doesn't throw, (9) shorthand aliases (`src=`) rejected.
- **Verified.** `npm test` **105/105 green** in 385 ms (+9). `npm run build` clean, 4 pages in 1.26 s. `dist/_astro/hoisted.*.js` emits all 5 UTM keys — bundle-verified.
- **Files:** `src/lib/track.ts` (+31/−1) · `tests/lib/track.test.ts` (+68, new). Local-only per tick constraint.

---

## SHIPPED (2026-07-11 — tick 18: close Services SiteGuide downshift UTM + pin invariant)

- **Closed the parked fourth outbound.** Tick 17 (`8f86748`) UTM'd 3 of 4 SiteGuide downshifts (Footer / `/audit` / `/thanks`); the queue entry explicitly parked the fourth on `Services.astro:186` for a future tick. Closed this tick.
- **`Services.astro:186`** now links to `?utm_source=m3mm&utm_medium=services&utm_campaign=downshift` — matches the pattern (`utm_medium` mirrors `data-section` for beacon parity between CompanySite `cta_click` and SiteGuide's landing beacon).
- **Regression pinned.** New `tests/build/outbound-utm.test.ts` (5 tests) scans all four source files, asserts each SiteGuide URL carries the correct `utm_medium=<section>`, and pins zero untagged `siteguide-production` references remain. A future downshift added without UTMs fails CI before it ships.
- **Verified.** `npm test` **96/96 green** in 383 ms (91 → 96, +5 new). `npm run build` clean, 4 pages in 1.26 s. `dist/index.html` emits both `utm_medium=footer` + `utm_medium=services` — zero plain `/demos` leakage.
- **Files:** `src/components/Services.astro` (1 line) · `tests/build/outbound-utm.test.ts` (+50, new). Commit **`565cb12`**, local only per tick constraint.
- **Push queue now at 13 tick-16/17/18 commits** (from `c61aa82` sticky-CTA baseline through `565cb12`).

---

## SHIPPED (2026-07-11 — tick 17: repair stale prefill tests + pin URL-param bio-link contract)

- **Session-guard goal was "URL-param prefill on CompanySite Intake."** Prior tick shipped feature (`e2e92e0`) but CATALOG refresh inside that commit left **5 tests red** referencing dead 2026-07 intent keys. `npm test` was 79/84 green — push-blocked without noticing.
- **Repaired.** Test file now references current CATALOG shape (`tier:website:starter`, `tier:website:business`, `tier:siteguide:setup`, `tier:custom:scoped-project`); loosened price-hint regex from `/^\$\d/` to `/\$\d/` so `Quote-only over $2,000` isn't false-flagged; added a "no stale keys" test so a future rename can't leave the tests behind.
- **New contract coverage (5 tests):**
  - `TIER_ALIASES` — every short-name resolves to a real CATALOG intent; each of the four tiers has at least one alias reachable (so `?tier=starter` etc. can't silently no-op after a rename).
  - `PARAM_TO_FIELD` — whitelist rejects `source` / `intent` / `honeypot` (hostile bio link can't lie about attribution); covers every visitor-typed intake field.
  - `MAX_PARAM_LEN` — bounded 0 < cap ≤ 2048 (DoS guardrail).
- **Small API surface change:** `TIER_ALIASES`, `PARAM_TO_FIELD`, `MAX_PARAM_LEN` promoted from module-private to `Readonly<Record<…>>` exports so tests pin their shape. Runtime unchanged.
- **Verified.** `npm test` **91/91 green** in 367 ms · `npm run build` **4 pages in 1.24 s**, clean · zero deps · `dist/_astro/hoisted.*.js` still contains `intake_prefill` bundle path.
- **Files:** `src/lib/prefill.ts` (+9/−5) · `tests/lib/prefill.test.ts` (+89/−16). One commit local-only per tick constraint: **`9d03f84`**.
- **Push queue now at 12 tick-16/17 commits** (from `c61aa82` sticky-CTA baseline through `9d03f84`).

---

## SHIPPED (2026-07-11 — push-readiness verification)

- **Conversion pass verified push-ready.** `npm run dev` boots astro v4.16.19 in 535 ms with no errors. All four target routes curl 200 locally against `http://localhost:4321`:
  - `/` (162 KiB): `lang="en"` + skip link + `<main>` + 11 `data-cta` + sticky-mobile CTA + "from $500" + "from $1,000" price chips all rendered.
  - `/audit` (93 KiB): `lang="en"` + `<main>` + sticky-CTA + 7 `data-cta` + proof block (Aries + Big 7) — the new cold-TikTok proof strip from `8211871`.
  - `/thanks` (81 KiB): `<meta name="robots" content="noindex,nofollow">` + OfferCatalog JSON-LD + BreadcrumbList JSON-LD + proof strip.
  - `/sitemap.xml` (710 B): lists `/`, `/audit`, `/accessibility`; `/thanks` intentionally omitted with inline XML comment.
- **10 queued commits verified push-ready** (from `c61aa82` sticky-CTA baseline → `48eb3dd` robots directives).
- **SiteGuide checkout 503/400/200 matrix green.** `pytest tests/test_checkout.py -v` = **11/11 passed in 0.46 s** inside `.venv/Scripts/python.exe`. Named tests covering `test_checkout_503_when_key_unset`, `test_checkout_400_when_tenant_has_no_price`, `test_checkout_200_returns_url` — plus bonus 404, 403, 502.
- Files: **none** (verification only). Queued Cockpit entry in `COCKPIT_QUEUE.md`.

---

## SHIPPED (2026-07-07, tick 16b — CTA § 4 alignment: `intake_start` event)

- **Funnel gap closed: `intake_start` now fires on first field focus.**
  CONVERSION_STANDARDS § 4 table lists four required events for the CTA
  loop (`cta_click` → `intake_start` → `intake_submit` → `checkout_complete`).
  Session-10 aligned `intake_submit`/`intake_error` payloads; `intake_start`
  was still missing, so we couldn't measure the abandonment gap between
  "clicks CTA" (huge, tracked) and "submits form" (tiny, tracked). Added a
  single `focusin`/`{ once: true }` listener on `#intake-form` — bubbles from
  any field, fires once per page-load, sends `{intent, source}` via the same
  `sendBeacon`-preferred `track()` path used for `intake_submit`.
- **Verified.** `dist/_astro/hoisted.*.js` now contains all three tokens
  (`intake_start`, `intake_submit`, `intake_error`). Tests **84/84 green** in
  571ms; build 2 pages in 1.17s. Zero deps.
- **CTA sweep result: no other gaps found.** Walked all 10 `[data-cta]`
  elements across Header/Hero/Footer/Services/CaseStudy/Intake. All have real
  `href` destinations (no `#`), all promise CTAs carry `data-intent`
  (`book:free-review`, `tier:*`, `product:*`), case-study outbound `liveUrl`
  visits carry the full UTM quartet (`m3mm.net · case-study · proof · <slug>`).
  Canonical audit is already closed clean with a regression test (session 7).
- Files this tick-b: `src/components/Intake.astro` (+14 net) + this TODO bullet.
- **Push:** deferred per tick constraint. 4 prior tick-16 commits still queued
  (`34b93f5`, `41a1b4a`, `f3edf28`, `d19734d`, `246146f`); this makes 5.

---

## SHIPPED (2026-07-07, tick 16 — Rung IV Strike #6: strip .reveal from above-fold blocks + accounting close)

- **`perf(hero)` commit `41a1b4a`: LCP 1792 → 1536 ms (−256 ms) local A/B.**
  Untouched `.reveal` on above-fold Hero/Header blocks was delaying the
  h1 paint behind an IntersectionObserver frame. Stripped `.reveal` from
  the LCP element chain; kept it for below-fold sections. Preview A/B:
  `perf/lh-mobile-preview-prefix-tick16-2026-07-07_215811.json`
  (LCP 1792 ms) → `perf/lh-mobile-preview-postfix-tick16-2026-07-07_215910.json`
  (LCP 1536 ms). Clears the ≥100 ms LCP guard.
- **Live baseline `perf/lh-mobile-baseline-tick16-2026-07-07_215425.json`:**
  m3mm.net Perf 99 / LCP 1750 ms — session-9 improvements deployed and
  holding at ceiling. Fresh strike #6 lands on the already-shipped
  work; site is at Perf 99 pre-strike.
- **Tick-10 late accounting close: 4 dangling `perf/lh-mobile-after-*` JSONs
  committed.** Prior tick-10 exit dropped these before the accounting
  commit (`ec4b73a`) captured them. Now tracked:
  `cf-email-decode-strike-final`, `cf-email-decode-strike-run2`,
  `jetbrains-preload-drop`, `jetbrains-preload-drop-run2`. All live
  m3mm.net mobile Lighthouse runs from the tick-10 window (12:24-12:30).
- **Push status:** 4 commits ahead of origin/main (`34b93f5`, `41a1b4a`,
  `f3edf28`, `d19734d`). Deferred to Mike per universal tick constraint
  ("never push"). `scripts/auto-improve/GUARDS_ACTIVE` sentinel is no
  longer on disk, but the tick-brief constraint still applies.
- Files this tick: `TODO.md` (+ this bullet) + 4 `perf/*.json` (add-only).

### Tick-16 re-fire verify (session-guard held goal open)

- **Session-guard PASS** locked goal `CompanySite → m3mm.net PageSpeed
  baseline captured, top bottleneck identified and shipped as a commit
  + pushed`. Verified on-disk this re-fire tick:
  - baseline PSI/LH JSON in `CompanySite/perf/` — YES
    (`lh-mobile-baseline-tick16-2026-07-07_215425.json`, Perf 99 / LCP 1750 ms live)
  - perf commit landed — YES (`41a1b4a`, on `main`, in `git log`)
  - second run with ≥100 ms LCP delta — YES
    (`preview-prefix` 1792 ms → `preview-postfix` 1536 ms = **−256 ms**,
    2.5× the ≥100 ms threshold)
  - pushed — NO (blocked; 4 commits queued as above)
- **Ceiling reached.** Baseline audits show only **24 ms** of remaining
  opportunity (`server-response-time`, Cloudflare-side, not code-fixable).
  No fresh strike is available without regression risk. Next Rung IV
  strike opens only after a new feature ships that could regress perf.
- **Next-tick guidance:** do not re-run baseline/A/B; state is captured.
  If push clears, run one live PSI/LH mobile against m3mm.net to confirm
  the −256 ms LCP delta holds post-deploy, then close Strike #6 with a
  live-delta line in `docs/lighthouse-baseline.md` § Strike #6.

---

## SHIPPED (2026-07-07, tick 11 — CTA sweep #4 + tick-10 accounting close)

- **CTA gap closed: case-study visit links now carry `product:` intent
  (`2f77d9a`).** Walked every `[data-cta]` in `src/components/*`. Prior
  ticks (5-10) closed the tier / book / navigation surfaces. One
  remaining gap: `CaseStudy.astro` "Visit the live site" outbound anchor
  had `data-cta` + UTM but no `data-intent`, so `cta_click` fired with
  `intent: undefined`. Per CONVERSION_STANDARDS § 2 the reserved
  `product:` namespace covers case studies. Now:
  `data-intent={`product:${entry.slug}`}` renders as `product:aries` /
  `product:big7`. Server-side `INTENT_MAX=64` in `functions/api/track.ts`
  (added tick-8) accepts arbitrary namespaces, no server change needed.
- **Tick-10 dangling accounting committed (`ec4b73a`).** Prior tick
  exited `no_log` before docs / measurement JSONs got in. Committed
  Strike #5 ledger entry in `docs/lighthouse-baseline.md`, TODO tick-10
  SHIPPED section, COCKPIT_QUEUE entry, and both tick-10 JSONs
  (`lh-local-after-tick10-*.json`, `lh-mobile-after-cf-email-decode-strike-*.json`).
- **Fresh PSI mobile against live m3mm.net: HTTP 429.** PSI daily quota
  still exhausted (rolled over from tick-10). Retry next tick after
  quota reset.
- Verified: `npm test` **84/84 green**, `npm run build` clean, `dist/`
  HTML contains 7 distinct `data-intent` values across 4 tiers + book
  + 2 product namespaces.
- Files changed this tick: `src/components/CaseStudy.astro` (+1/-0).
  Docs / metadata commit added `docs/lighthouse-baseline.md`, `TODO.md`,
  `COCKPIT_QUEUE.md`, 2 perf JSONs.

---

## SHIPPED (2026-07-07, tick 10 — Rung IV strike #5: bypass CF Email Obfuscation)

- **Fix landed in sibling-agent commit `9167f81`** (`perf(footer): kill CF
  email-decode.min.js render-block …`). Two agents converged on the same
  bottleneck in parallel this tick; sibling committed first. Footer.astro
  now splits the address into `data-em-u` / `data-em-h` attrs behind an
  `/audit#intake` fallback, hydrates a real `mailto:` on load — CF's edge
  scanner sees no email pattern in HTML source, so
  `/cdn-cgi/scripts/…/email-decode.min.js` (206 ms wasted, LCP critical
  chain per tick-10 baseline) stops being injected on deploy.
- This tick's companion: baseline JSON `perf/lh-mobile-baseline-tick10-…json`
  (live m3mm.net, Perf 94 / LCP 2531 ms) + local companion
  `perf/lh-local-after-tick10-…json` (astro preview, Perf 96 / LCP 2255
  ms — statistical parity with tick-7 local, expected since the fix is a
  CF-edge behavior invisible to local preview). Ledger `docs/lighthouse-baseline.md`
  § "Strike #5" documents the fix + verification path.
- Deploy-verified PSI delta unmeasured — PSI daily quota exhausted mid-tick;
  push/deploy disallowed by tick constraints.

---

## SHIPPED (2026-07-07, tick 5 — CTA § 2/§ 3/§ 4 gap-close)

- **Three CONVERSION_STANDARDS gaps closed in one commit `64dc3c3`
  (5 files, +20/-21, local only per session brief).**
- **§ 2 intent metadata** — Header, Hero, Footer generic "Free review"
  CTAs now carry `data-intent="book:free-review"` (existing reserved
  namespace, no shared-doc edit needed). Previously fired
  `cta_click` with intent `undefined`.
- **§ 4 attribution loop** — added `<input type="hidden" name="intent">`
  to the intake form; `wirePrefill()` in `src/lib/prefill.ts` now
  writes any clicked `[data-intent]` value into it (not just
  CATALOG-mapped tiers). Intake submit handler reads intent directly
  from the hidden field — removed the fragile `inferIntent()` regex
  that could only recover intent when a message-textarea prefill was
  present. `intake_submit` now carries a real intent for
  book:free-review visitors too.
- **§ 3 intake surface prefill** — footer `mailto:` now opens with a
  populated `?subject=` line and a 3-field body scaffold so
  direct-email visitors arrive in inbox with the same context the
  form intake would have captured. Also flagged with
  `data-intent="book:free-review"` for consistency.
- Verified: `npm test` **84/84 green**, `npm run build` clean, `dist/`
  HTML contains all 5 `data-intent` values (4 tiers + `book:free-review`),
  hidden intent field renders on both `/` and `/audit`, mailto carries
  full subject+body.
- Files changed: `src/components/{Header,Hero,Footer,Intake}.astro` +
  `src/lib/prefill.ts`. Zero deps.

---

## SHIPPED (2026-07-07, tick 7 — Rung IV audit: headroom exhausted + schema hygiene)

- **Fresh mobile Lighthouse baselines confirm Rung IV is at ceiling.** Two runs:
  - `perf/lh-mobile-baseline-tick7-2026-07-07_085505.json` — LIVE m3mm.net:
    Perf **96** · FCP **1791 ms** · LCP **2555 ms** · SI **2868 ms** · TBT 0 · CLS 0.
    All 20 diagnostics score 1.0. `overallSavingsMs > 0` opportunities: none.
  - `perf/lh-local-before-tick7-2026-07-07_090114.json` + `…after…_090315.json`
    against `serve dist` on `localhost:4200` (same throttled 4G simulation):
    Perf 98 / LCP 2262-2268 ms — delta noise (±20 ms) on both metrics.
- **Investigated font-weight subsetting; confirmed no-op.** Google Fonts CSS
  API serves identical latin-subset WOFF2 URLs for Space Grotesk and Inter
  regardless of requested weight combos (variable font behavior). Trimming
  `wght@300;400;500;600;700` → `wght@500;600;700` returned the exact same
  `V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2`. Same for JetBrains Mono:
  `wght@400;500;700` vs `wght@400;500` both resolve to
  `tDbv2o-flEEny…knk-4.woff2`. Session 8's PARKED "self-host fonts" note is
  now the only remaining lever, but it's a re-architecture, not a strike.
- **Schema.org hygiene, tick-7 only code change: JSON-LD `email` →
  `contactPoint`.** `Layout.astro` was emitting a raw email string in the
  `ProfessionalService` JSON-LD, which contributes to Cloudflare's Email
  Address Obfuscation trigger (also fired by the footer `mailto:` — so this
  alone doesn't kill the `cdn-cgi/scripts/…/email-decode.min.js` inject).
  Replaced with a `schema.org/ContactPoint` pointing to `/audit`. Cleaner
  contact discoverability, no perf claim.
- Tests **84/84 green**, build 2 pages in 1.21 s. One file changed
  (`src/layouts/Layout.astro`, +11/-1). Zero deps.

**Rung IV re-strike outcome:** unchanged from session 9 (Perf 97 · LCP 2448
ms production, session 9's saved run). Guard `≥3 score OR ≥100 ms LCP` NOT
cleared this tick — headroom is honestly gone at this rung until either
(a) fonts self-host or (b) a section reshuffle moves LCP off Space Grotesk.

---

## SHIPPED (2026-07-07, session 10 — CTA audit re-close + `intake_submit` §4 alignment)

- **Fresh full CTA/canonical sweep against `docs/CONVERSION_STANDARDS.md`.**
  10 interactive elements walked. All carry `data-cta`; all have real
  destinations (no `href="#"`); Services rows carry `data-intent` (session-6);
  outbound case-study `liveUrl` carries UTM (session-6); canonical + og:url
  wired from `Astro.site` (session-7 regression test still green). Sibling
  agent (parallel lane) shipped 3 additional gap fixes in commit `657e650`:
  Custom-build tier CATALOG entry, `wireCTAs()` intent forward, `/api/track`
  intent read+log.
- **`intake_submit` event fields aligned to § 4 spec.** `Intake.astro` was
  firing `intake-success` with only `{source}`; the spec table requires
  event name `intake_submit` with `intent`, `has_prefill (bool)`,
  `message_length`. Fix:
  - Imported `isPriorPrefill`, `CATALOG` from `src/lib/prefill.ts` (public
    API stable — no sibling-lane collision).
  - Added `inferIntent(message)` — walks CATALOG, matches by prefill title
    prefix. Returns the intent the visitor clicked (when known).
  - Fires `intake_submit` (success) and `intake_error` (failure) with
    `{intent, has_prefill, message_length}` in `meta`.
- **Verified in built bundle:** `dist/_astro/hoisted.*.js` contains all four
  new tokens (`intake_submit`, `intake_error`, `has_prefill`, `message_length`).
  Zero old-name references remain in either source or `dist/`.
- Tests **84/84 green** (grew from 68 → 84 via sibling's cockpit-sink suite),
  build 2 pages in 1.25 s. One file changed (Intake.astro, +30/-2). Zero deps.
- **Parked (unchanged from session 9):** namespace extension for the generic
  "Free review" CTAs in Hero/Header/Footer — requires shared-doc edit
  outside per-tick lane. See NEXT ACTION #3.

---

## SHIPPED (2026-07-07, session 9 — Rung IV MOBILE re-strike)

- **Fresh mobile PSI baseline exposed headroom prior desktop strike missed.**
  - `perf/psi-mobile-baseline-2026-07-07_083104.json` (against LIVE m3mm.net,
    Lighthouse 11.7.1 mobile emulation, 4x CPU slowdown):
    Perf **87** · FCP **3051 ms** (score 0.48) · LCP **3051 ms** (0.76) · TBT 0 · CLS 0.
  - Fonts were 100 KB of 125 KB total wire weight (Google Fonts, 3 woff2 from
    gstatic). Root cause: even with the session-8 preload+onload swap of the
    stylesheet, the actual font URLs couldn't be discovered until the CSS
    parsed — sequential dependency, not parallel.
- **Two-strike fix, one commit each:**
  1. `d620884` — `astro.config.mjs` `inlineStylesheets: 'auto' → 'always'`
     (inlines the last 8.4 KB external CSS) + `Layout.astro` preload the
     Space Grotesk latin woff2 (H1 hero = LCP element). First after-run
     showed **+80 ms LCP, +1 score** — real but under the 100 ms guard.
  2. `90c95b4` — widened preload to all 3 latin woff2 subsets (Inter body,
     JetBrains Mono kicker). The parallel-download win compounded across
     fonts because a single preconnect already had the gstatic connection
     open when the extra preloads fired.
- **Final measure `perf/psi-mobile-after-3fonts-2026-07-07_084044.json`:**
  Perf **87 → 97 (+10)** · FCP **3051 → 1741 ms (-1310)** · LCP **3051 → 2448 ms (-603)**
  · Speed Index **3731 → 1741 ms (-1990)** · TTI **3051 → 1741 ms (-1310)**.
  Threshold guard cleared with room (needed ≥ 3 score OR ≥ 100 ms LCP).
- Tests 68/68 green after both commits. Build 2 pages in 1.21 s. Zero deps.

---

## SHIPPED (2026-07-07, session 8 — Rung IV QUICKEN + Rung V INSCRIBE close)

- **Rung IV QUICKEN strike closed.** Baseline captured via `npx lighthouse@11.7.1`
  against LIVE m3mm.net (desktop preset, headless Chrome).
  - Baseline: Perf 98 · A11y 96 · BP 93 · SEO 91 · PWA 28.
  - Top opportunity by measured savings: `render-blocking-resources` @ 437 ms.
  - Struck the biggest single blocker (Google Fonts stylesheet, 247 ms) via
    preload+onload swap in `Layout.astro` — no new deps, no runtime shift,
    `<noscript>` fallback for no-JS, `display=swap` in URL already avoids FOIT.
  - Post-strike measure: **render-blocking savings 343 ms → 96 ms** (−247 ms
    exactly as predicted). Only Astro's above-the-fold `audit.*.css` remains
    blocking; parked (can't defer without CLS risk).
  - Ledger: `docs/lighthouse-baseline.md` + raw JSONs `docs/lighthouse-2026-07-07{,-post}.json`.
  - Score didn't budge (already at ceiling for the categorical rounding) —
    resource cost drop is the real signal.
  - Commit `7040dcf`, deployed `8afab351.m3-companysite.pages.dev`, live at m3mm.net.

- **Rung V INSCRIBE — README refreshed so a stranger runs this in 5 min.**
  - Added LIVE status badge (m3mm.net · Cloudflare Pages · 2026-07-06).
  - Stack section now names the real fonts (Space Grotesk + Inter + JetBrains
    Mono, with the async-load note) — was still saying "Fraunces + Inter"
    from the pre-cyberpunk state.
  - Deploy section rewritten: first-time uses wrangler direct upload (matches
    what actually shipped 2026-07-06), subsequent gets either direct upload
    or GitHub-connect. Post-deploy smoke curl block included.
  - New "Test" section: `npm test` = 68 tests across 6 files, hits every
    money-path pure helper without a CF runtime.
  - New "Perf" section: cross-links `docs/lighthouse-baseline.md`, records
    current 98/96/93/91 + latest strike delta.

## SHIPPED (2026-07-06, session 7 — canonical URL audit + regression test)

- **Canonical audit closed clean (D-CS-009).** Full sweep of rendered source
  and built `dist/`. Every page emits `<link rel="canonical">` from
  `src/layouts/Layout.astro`, derived from `Astro.site = 'https://m3mm.net'`
  (astro.config.mjs). Built canonicals: `/` → `https://m3mm.net/`, `/audit` →
  `https://m3mm.net/audit`. `og:url` matches canonical on both. JSON-LD
  schema.org `url` = `https://m3mm.net/`. Zero
  `companysite-production.up.railway.app` leakage anywhere in rendered source.
- **Regression test: `tests/build/canonical.test.ts` (4 tests).** Asserts the
  astro.config.mjs prod-origin pin, the Layout canonical wiring, `og:url ↔
  canonical` sync, and no-leakage on the top-level rendered surfaces. Suite =
  **68/68 green in 360ms**. Any future edit that breaks the canonical
  invariant fails CI before it ships.

## SHIPPED (2026-07-06, session 6 — CONVERSION_STANDARDS pass)

- **CTA audit complete against `docs/CONVERSION_STANDARDS.md`.** Full sweep in
  session log — 3 real gaps found, 3 fixed, 0 new dead links. Gaps 1 + 2 addressed
  the Services rows (`data-intent` + prefill); gap 3 addressed outbound
  attribution on case-study `liveUrl` visits.
- **`data-intent` on Services rows (§ 2).** Each of the 3 Services `<a href="#intake">`
  rows now carries a namespaced intent — `tier:website:site-that-books`,
  `tier:automation:hours-saved`, `tier:widget:ai-assistant`. Reserved namespaces
  per CONVERSION_STANDARDS § 2 table.
- **Intake prefill wired (§ 3).** New `src/lib/prefill.ts` holds the CATALOG +
  `buildBrief` + `isPriorPrefill` + `wirePrefill`. Layout bootstrap calls
  `wirePrefill()` alongside `wireCTAs()` and `wireReveals()`. Click a Services
  row → `frustration` textarea populates with the tier title + starting price +
  a one-line detail + a separator inviting the visitor to add their own text.
  Never clobbers user-typed content (separator check).
- **UTM attribution on outbound case-study links.** `src/components/CaseStudy.astro`
  now appends `utm_source=m3mm.net · utm_medium=case-study · utm_campaign=proof ·
  utm_content=<slug>` to every rendered `liveUrl`. Verified in built HTML for both
  `aries` and `big7`.
- **Test coverage + green build.** New `tests/lib/prefill.test.ts` covers the
  three pure helpers (6 tests). Suite = **64/64 green in 370ms**; `npm run build`
  = 2 pages / 1.28s. Zero new deps.

## SHIPPED (2026-07-06, session 5 — deploy-readiness handoff)

- **`track-parse.ts` extracted + 14 new tests.** Pure helper split out of
  `functions/api/track.ts` (parse + validate CTA beacon payloads). Suite grew
  44 → **58 passed / 58 total** in 347ms. Zero code changes to `/api/track` —
  extraction is behavior-preserving. Files: `functions/_lib/track-parse.ts` +
  `tests/functions/track-parse.test.ts`.
- **`RUNBOOK.md § 3` rewritten with paste-ready deploy.** Split into 3.1
  first-time (wrangler login + project create + first upload + dashboard env +
  DNS), 3.2 subsequent (auto-deploy Path A or direct-upload Path B), 3.3
  post-deploy smoke, 3.4 pre-deploy readiness. Mike now pastes a 5-line block
  instead of clicking through Cloudflare Pages onboarding cold.
- **Fresh build + test verified 2026-07-06 20:56 EDT.** `npm test` 58/58 in
  347ms · `npm run build` 2 pages in 1.27s · `dist/` = 22.5 KB gzipped total
  (index 42 KB raw, audit 14 KB raw, single 29 KB CSS bundle). Well under the
  60 KB gzipped target.

## SHIPPED (2026-07-05, session 4 — canon ignition, Rungs 2 + 3)

- **Rung 2 TEST closed.** vitest 2.1.9 (Node-21 compat, pinned per new D-CS entry), `vitest.config.ts` at 85/85/80/85 thresholds, `scripts/test.sh` behind `make test`, CI `test → build → upload dist` job. 44/44 green: `validate.test.ts` 18 · `rate.test.ts` 7 · `validate.supplemental.test.ts` 19. Commit `3e28a0f`, pushed.
- **Rung 3 CLEAN began (Furnace one-more-rep).** `astro check` → 0 errors / 0 warnings / 0 hints across 16 files (`is:inline` on the JSON-LD script closed the last hint, commit `b6eefec`, pushed). `functions/_lib/rate.ts` self-GC every 200 calls to keep bucket Map bounded. `functions/api/lead.ts` accepts `application/x-www-form-urlencoded` in addition to JSON so no-JS clients can still submit — wrangler smoke: JSON 200, form-urlencoded 200, text/plain 415.

## SHIPPED (2026-07-05, session 3 — Rung 2 TEST close)

- **Ladder Rung 2 (TEST) complete.** Vitest 2.1.9 wired (Node 21 compat), `vitest.config.ts` scoped to `tests/**/*.test.ts` with coverage thresholds 85/85/80/85. Suite = 44/44 green across 3 files: `tests/functions/validate.test.ts` (18 — primary happy/edge), `tests/functions/rate.test.ts` (7 — sliding-window + fake timers + retry-after math), `tests/functions/validate.supplemental.test.ts` (19 — `esc` HTML-escape, `clean` non-string defense, honeypot silent-swallow contract, multi-field error capture, over-cap truncation).

## SHIPPED (2026-07-05, session 2 continuation)

- **Ladder Rung 1 (HARDEN) complete.** Rewrote `functions/api/lead.ts` with body cap, Content-Type gate, Origin allowlist, per-IP rate limit with `Retry-After`, Resend fetch timeout, structured `errors[]`, URL protocol allowlist. Same treatment on `/api/track` (4 KB cap, 60/min rate, silent 204 on junk). Extracted pure helpers to `functions/_lib/validate.ts` + `functions/_lib/rate.ts` so Rung 2 (TEST) can unit-test without a CF runtime. Verified via 9-check wrangler smoke matrix. Commit `4293feb`.
- Committed the whole 2026-07-05 rebuild in 4 clean chunks: `7b2704a` build scaffold · `328f1f1` Astro source · `4afe796` functions · `0f41776` docs + Dockerfile + legacy move + per-project meta files.

## SHIPPED (2026-07-05)

- Full Astro 4 + Tailwind 3 + Cloudflare Pages rebuild landed. Previous single-file cyberpunk site preserved at `legacy/2026-cyberpunk-index.html`.
- Homepage: editorial-scale hero with drawn neon underline + client marquee + authority stat block; Proof section with per-client SVG art (Aries deck geometry, Big 7 BUILD/FIX split); Services as editorial numbered rows with per-service accent (clay / neon / cyber); Intake with corner brackets, numbered fields, animated submit.
- `/audit` landing page for TikTok bio, tagged `source=audit-page`.
- Cloudflare Pages Functions: `/api/lead` (Resend + validation + honeypot + rate-limit) and `/api/track` (CTA beacon).
- 14+ CTAs wired to `[data-cta]` global tracker; IntersectionObserver scroll reveals; `prefers-reduced-motion` respected.
- Wire weight: **~10 KB HTML + ~6 KB CSS gzipped, zero JS bundles.**
- Verified end-to-end via `wrangler pages dev`: valid POST → 200, invalid → 400 with field list, honeypot → 200 silent, GET → 405, rate limit trips at 6th hit inside 60s, `/review` `/free-review` `/site-review` → 301 `/audit`.

## PARKED

- Case-study MP4s: drop `public/videos/{aries,big7}-scroll.mp4` + posters, uncomment `video`/`poster` fields in `src/content/caseStudies/*.md`. Michael's ClipForge output goes here.
- Add a real testimonial from David Serrano (Aries client) once approved.
- Metrics / results ribbon under hero (parked from quality pass — is a section addition, not craft).
- FAQ section (parked; section addition).
- About/founder block (parked; section addition).
- Sitemap generation (`@astrojs/sitemap` integration + reintroduce `Sitemap:` line in `robots.txt`).
- Self-host fonts to shave the last font-download from Google (Lighthouse `preload-webfonts` win).

## QUESTIONS FOR MIKE

1. Deploy CompanySite to Cloudflare Pages tonight? (y/n)
2. Resend sender = verified `hello@m3mm.net` or sandbox for week 1? (verified/sandbox)
3. Retire the old Railway CompanySite URL, or keep it as a 302 to m3mm.net? (retire/redirect)


<!-- AI-HUB-SYNC:START -->
## AI Hub Sync - 2026-07-09

Source of product truth: ..\AI_HUB.md.

**Lane:** M3 custom business website sales floor

**UI/design verdict:** Correct direction. Keep the cyberpunk M3 identity, but make the buying ladder easier to scan than the visual effects. Mobile-first TikTok traffic means the first screen needs offer, proof, CTA, and no pricing confusion.

**Product improvement:** Add case-study proof for Aries/Big7-style work, keep SiteGuide as the starter cross-sell, measure CTAs, and protect the $500/$1k-$2k/quote-only ladder from drifting back into a generic automation menu.

**Next action:**
- [ ] Verify the Services ladder UI at desktop and 375px, run npm test and npm run build, then deploy only if green.

**Combine/separate call:** Keep separate from SiteGuide; cross-sell only.

**Verification gate:** npm test; npm run build; mobile visual smoke; lead and analytics endpoints.
<!-- AI-HUB-SYNC:END -->
- [ ] RESUME (2026-07-11 12:53): auto-improve worker crashed. Last commit: eebae5b docs(cockpit): queue tick-18 Services-UTM close + regression pin. See C:\Users\Michael\Documents\GitHub\CompanySite\.autoimprove\crash-2026-07-11_12-53-32.json.
- [ ] RESUME (2026-07-11 13:25): auto-improve worker crashed. Last commit: d2a8a4d fix(conversion): thread path prop end-to-end so intake CTAs never dead-end. See C:\Users\Michael\Documents\GitHub\CompanySite\.autoimprove\crash-2026-07-11_13-25-02.json.
- [ ] Drain push queue ΓÇö 22 local commits waiting (tick constraint kept them local)
- [ ] Canonical loop is closed after 20+ ticks; rotate focus off CTA/canonical audits next tick
- [ ] Push local queue ΓÇö 23 commits deep, unpushed
- [ ] Drain `COCKPIT_QUEUE.md` entry for tick 23
- [ ] Extend URL-param prefill coverage from Intake to remaining SiteGuide demo landing paths (session goal calls for TikTok-bio links to land on pre-filled forms ΓÇö verify non-Intake entry points)
- [ ] Per-template OG raster generation for SiteGuide demo pages (session goal, not touched this tick)
- [ ] Product schema JSON-LD on SiteGuide demo pages for rich share cards (session goal, not touched this tick)
- [ ] RESUME (2026-07-11 13:43): auto-improve worker crashed. Last commit: 51d4339 feat(conversion): URL-param intent accepts all 6 reserved namespaces. See C:\Users\Michael\Documents\GitHub\CompanySite\.autoimprove\crash-2026-07-11_13-43-37.json.
