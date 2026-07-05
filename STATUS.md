# CompanySite — STATUS

**Live URL:** — (not yet deployed; target `https://m3mm.net`)
**Stack:** Astro 4 + Tailwind 3 + Cloudflare Pages + Pages Functions (Resend)
**Definition of Done:** bio link → page → form submission works end to end and looks expensive.
**DoD hit:** 2026-07-05 (local, wrangler pages dev verified).

---

## Evolution ladder

Current rung: **RUNG 2 — TEST** (queued; RUNG 1 completed 2026-07-05).

| Rung | Focus | Status |
|---|---|---|
| 1. HARDEN | Failure paths, validation, retries, idempotency on `/api/lead` + `/api/track` | ✅ 2026-07-05 (9-check smoke matrix green — body cap 16KB, Origin allowlist, Content-Type gate, Resend timeout 6s, structured `errors[]`, Retry-After 429, `_lib/{validate,rate}` split for future testability) |
| 2. TEST | Coverage on money paths — form validation, honeypot, rate limit, email dispatch | 🎯 next |
| 3. CLEAN | Dead code, honest names, one-screen functions | ⏳ pending |
| 4. SPEED | Real Lighthouse in Chrome, fix the top bottleneck only | ⏳ pending |
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
