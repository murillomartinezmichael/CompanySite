# CLAUDE.md

## What This Is

M³ marketing site at **m3mm.net**. Only job: convert TikTok / Instagram traffic
into DMs and quote requests. Visitors arrive already half-sold from a video —
this site closes the loop.

## Product Positioning (2026-07-09)

CompanySite is the M3 custom business-site sales floor, not the starter-template store.

- Audience: small businesses through corporate-style local/regional companies that need a custom site, proof, and a lead path.
- Offer ladder: $500 basic starter/refresh; $1,000-$2,000 bounded business-site package; quote-only above $2,000.
- Premium quote-only examples: AriesOutdoorLiving-grade rebuilds, Big7Construction-style company sites, heavy service lines, portals, payments, integrations, or automation.
- SiteGuide owns the starter-company DIY lane: templates, widgets, and bundles. Route low-budget/template buyers there instead of blurring the M3 custom offer.

## Stack

- **Astro 5** static output on **Cloudflare Pages** (`astro@^5.18.2`; the 5→7
  major is triaged and scoped in `TODO.md`, not yet taken)
- **Tailwind 3** utility CSS
- **Cloudflare Pages Functions** in `functions/api/*.ts` for the intake + analytics endpoints
- No JS framework beyond Astro's built-in islands
- Fonts: Fraunces (display) + Inter (body)

Old cyberpunk single-file HTML is preserved at `legacy/2026-cyberpunk-index.html`.
Do not resurrect it — the current site is a deliberate reset.

## Key files

- `src/pages/index.astro` — home
- `src/pages/audit.astro` — `/audit`, the TikTok bio link target
- `src/components/*.astro` — Hero, Proof (case studies), Services, Intake, Header, Footer
- `src/content/caseStudies/*.md` — one file per case study (Aries first)
- `src/lib/track.ts` — CTA tracker (fires on any `[data-cta]` click)
- `functions/api/lead.ts` — POST intake, emails via Resend
- `functions/_lib/referral.ts` — referral program config + copy. **One source
  of truth** for the payout terms; the intake, `/thanks`, `/start/thanks`, and
  the auto-reply email all render from it. `bountyUsd` stays `null` until Mike
  confirms an amount, and a test enforces that.
- `functions/api/track.ts` — POST analytics beacon
- `public/_headers` — CSP + HSTS + long-cache assets
- `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`

## Run locally

```bash
cd CompanySite
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/
npm run preview
```

## Deploy

Cloudflare Pages, connected to GitHub. Build cmd `npm run build`, output `dist`,
functions dir `functions` (auto). Env vars in dashboard: `RESEND_API_KEY`
(required for real emails), `LEAD_TO`, `LEAD_FROM` (optional).

## Rules

- **Every CTA gets `data-cta`.** No exceptions. The tracker is wired globally in
  `Layout.astro`'s bootstrap script.
- **Adding a case study = drop a `.md` file** in `src/content/caseStudies/`.
  Missing video/poster falls back gracefully.
- **Mobile-first.** 90%+ of traffic is TikTok. Test at 375px width first.
- **Design tokens live in `tailwind.config.mjs`** under `theme.extend.colors` +
  `fontSize` + `boxShadow`. Do not hardcode hex outside there.
- **`legacy/` is read-only.** Reference material only.
- **From-pricing on Services is intentional.** Overrides the 2026-07-03
  quote-only rework on the previous site — the new brief calls for from-pricing
  to filter tire-kickers.

## Standards & docs

- `../docs/ENGINEERING_STANDARDS.md` — principles + Definition of Done
- `../docs/CONVERSION_STANDARDS.md` — CTA + intake conventions
- `../docs/HOSTING_STANDARDS.md` — Cloudflare Pages sits under D-001 as a static-front adjacent to the Railway default
- Local doc-tier: `BRD.md` · `TRD.md` · `RUNBOOK.md` · `ONBOARDING.md` · `CHANGELOG.md`

---

## End-of-chunk: log to Cockpit

Every shipped chunk (feature end-to-end, doc rolled out, deploy that survives smoke test) gets a Work Log entry in `../COCKPIT.html` — press `l`. No entry = the chunk didn't happen. Full protocol in `../CLAUDE.md § DEFINITION OF DONE — Cockpit Work Log`.


<!-- AI-HUB-SYNC:START -->
## Shared AI Hub

Read ../AI_HUB.md after root ../CLAUDE.md and before changing this project. Product lane, UI verdict, and combine/separate decisions are centralized there so Claude and Codex stay synced.

Current lane: M3 custom business website sales floor

Current next action: Verify the Services ladder UI at desktop and 375px, run npm test and npm run build, then deploy only if green.
<!-- AI-HUB-SYNC:END -->
