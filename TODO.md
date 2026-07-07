# CompanySite — TODO

**Cold-start rule:** a fresh session should read this file and be productive in 60 seconds.

---

## NEXT ACTION

**Rung VI EXPAND — one money-impacting capability from the brief not yet
built.** Candidates (ordered by money impact, not interest):

1. **`/api/lead` writes to CockpitCloud as a "Lead" card** — same session
   Mike's live at m3mm.net can start seeing leads land in his kanban
   without opening email. Cross-fleet strategic bond (Book V Rung VII).
2. **Real testimonials wall** — swap the placeholder quotes for real
   client words (David Serrano / Aries + Big 7 owner). Conversion lift
   on the section directly above `/intake`.
3. **ClipForge-driven case-study MP4 landing** — the two `<video>` slots
   in Aries + Big 7 case studies stub to poster-only. Slotting real
   MP4s is 2 files + a `<video>` flip, not a build change.

Pick #2 next — real testimonials is copy-only, no deps, no perf risk,
directly moves conversion above the intake fold.

Ladder Rung IV SPEED is CLOSED for this cycle. Next Rung IV strike
opens when a new feature ships that could regress perf (measured, not
speculative).

While Mike's on Stripe (SiteGuide Rung 2): I re-fire on the next money
rung. This project doesn't wait on him.

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
