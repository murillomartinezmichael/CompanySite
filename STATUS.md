# CompanySite — STATUS

**Live URL:** `https://m3mm.net` (deployed via Cloudflare Pages, GitHub-connect auto-deploy)
**Stack:** Astro 4 + Tailwind 3 + Cloudflare Pages + Pages Functions (Resend)
**Definition of Done:** bio link → page → form submission works end to end and looks expensive.
**DoD hit:** 2026-07-05 (local, wrangler pages dev verified).
**Deploy-ready:** 2026-07-06 (58/58 tests, `dist/` 22.5 KB gz, RUNBOOK § 3 paste-ready — waiting only on Mike's `wrangler login` + first-time project create).
**Session 9 (2026-07-07):** Rung IV RE-STRIKE on mobile — PSI 87→97 / LCP −603 ms shipped in commits `d620884`+`90c95b4`. Ledger + raw JSONs in `docs/lighthouse-baseline.md` + `perf/psi-mobile-after-3fonts-2026-07-07_084044.json`. 3 commits (`5c19929`, `7d8a18d`, `7748a3d`) waiting on `scripts/auto-improve/GUARDS_ACTIVE` lift before push.

---

## Evolution ladder

Current rung: **RUNG 4 — SPEED** (pending Cloudflare Pages deploy; RUNGS 1–3 complete).

| Rung | Focus | Status |
|---|---|---|
| 1. HARDEN | Failure paths, validation, retries, idempotency on `/api/lead` + `/api/track` | ✅ 2026-07-05 (9-check smoke matrix green — body cap 16KB, Origin allowlist, Content-Type gate, Resend timeout 6s, structured `errors[]`, Retry-After 429, `_lib/{validate,rate}` split for future testability) |
| 2. TEST | Coverage on money paths — form validation, honeypot, rate limit, email dispatch, canonical/SEO invariant | ✅ 2026-07-06 (vitest 68/68 green across 6 files · `validate.test.ts` 18 · `rate.test.ts` 7 · `validate.supplemental.test.ts` 19 · `track-parse.test.ts` 14 · `prefill.test.ts` 6 · `canonical.test.ts` 4) |
| 3. CLEAN | Dead code, honest names, one-screen functions | ✅ 2026-07-06 (`astro check` 0/0/0 across 16 files · `rate.ts` self-GC · form-urlencoded intake · pure `track-parse.ts` split from `/api/track` · 22.5 KB gz total on wire) |
| 4. SPEED | Real Lighthouse in Chrome, fix the top bottleneck only | ✅ 2026-07-07 (session 8: strike #1 font-defer -247ms blocking `7040dcf` · strike #2 case-study video lazy-load -6.69 MB `8481eb2`+`4eaabd5`. session 9 mobile re-strike: #3 inline CSS + Space Grotesk preload `d620884` · #4 widen preload to Inter + JetBrains Mono `90c95b4`. **PSI mobile Perf 87 → 97 (+10), LCP 3051 → 2448 ms (−603 ms)** — clears the ≥3/≥100 ms guard.) |
| 5. DOCUMENT | Stranger runs it in 5 minutes from README | ⏳ pending (README already close) |
| 6. UPGRADE | One money-impacting capability from the brief that isn't built | ⏳ pending (candidates: SiteGuide embed on m3mm.net itself; real testimonials wall; ClipForge-driven case-study MP4 landing) |
| 7. EVOLVE | Strategic connection to another fleet project | ⏳ pending (candidate: `/api/lead` writes to CockpitCloud kanban as a new "Lead" card) |
| 8. RESET | Rung complete → back to Phase 2 step 4 | — |

---

## What's up

- Site meets brief DoD locally; awaiting Cloudflare Pages deploy for the money path to open.
- All prior CompanySite Railway state (URL confusion at `companysite-production.up.railway.app` returning a Rotterdam SaaS) is now moot — Cloudflare Pages at m3mm.net is the new target.
- Legacy cyberpunk single-file site preserved at `legacy/2026-cyberpunk-index.html`; do not resurrect.

## What's next

The exact next action lives in `TODO.md § NEXT ACTION`. Cold sessions should read that first.
