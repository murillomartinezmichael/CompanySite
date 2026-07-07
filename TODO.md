# CompanySite — TODO

**Cold-start rule:** a fresh session should read this file and be productive in 60 seconds.

---

## NEXT ACTION

**Deploy — money path opens.** Repo is one command away as of 2026-07-06:
`npm test` = 58/58 green (14 new from `track-parse.test.ts`), `npm run build`
= 2 pages / 22.5 KB gzipped, `dist/` is present with `_headers` + `_redirects`
+ `og.svg`. Mike pastes:

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite
npx wrangler login
npm ci && npm run build
npx wrangler pages project create m3-companysite --production-branch main
npx wrangler pages deploy dist --project-name=m3-companysite --branch=main
```

Then browser: dashboard → Environment variables → `RESEND_API_KEY` →
Custom domain → `m3mm.net`. Full step-by-step in `RUNBOOK.md § 3.1`.
Post-deploy smoke in § 3.3.

While Mike's on the deploy: Ladder RUNG 4 SPEED is the next Claude-executable
slot — real Lighthouse in Chrome once m3mm.net answers 200, then measured
strike on the top bottleneck. Do NOT blind-optimize.

---

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
