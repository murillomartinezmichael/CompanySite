# CompanySite — TODO

**Cold-start rule:** a fresh session should read this file and be productive in 60 seconds.

---

## NEXT ACTION

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
