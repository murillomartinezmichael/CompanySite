# CLAUDE.md

## What This Is

M³ marketing site at **m3mm.net**. Only job: convert TikTok / Instagram traffic
into DMs and quote requests. Visitors arrive already half-sold from a video —
this site closes the loop.

## Stack

- **Astro 4** static output on **Cloudflare Pages**
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
