# CompanySite — m3mm.net

**Status:** 🟢 LIVE at [https://m3mm.net](https://m3mm.net) (Cloudflare Pages, since 2026-07-06).
**Aesthetic:** Cyberpunk 2055 · Edgerunners palette (Lucy cyan primary, magenta rare punch, yellow CTA hover, David-lime accent).
**Perf:** Lighthouse desktop = 98/96/93/91. Measurement + strike ledger at [`docs/lighthouse-baseline.md`](docs/lighthouse-baseline.md).

M³'s marketing site. Turns TikTok/Instagram traffic into DMs and quote requests.
Visitors arrive already half-sold from a video; this site's only job is to close the loop.

## Offer Ladder

CompanySite is the M3 custom-work lane. The public site should make the ladder obvious:

| Lane | Price posture | Best fit |
|---|---|---|
| Basic starter / refresh | from $500 | simple credibility site, one-page refresh, quick lead capture |
| Business site package | $1,000-$2,000 | small to corporate-style local/regional company site with proof, intake, services, and deployment |
| Premium custom | quote-only over $2,000 | AriesOutdoorLiving / Big7Construction caliber redesigns, larger content, integrations, portals, payments, automation |

SiteGuide handles the DIY starter-company lane: templates, widgets, and bundles. CompanySite points low-budget/template buyers there and keeps this site focused on custom outcomes.

## Stack

- **Astro 4** — static output, zero runtime JS by default
- **Tailwind 3** — utility-first, cyberpunk design system in `tailwind.config.mjs`
- **Cloudflare Pages** — build + host + edge functions
- **Cloudflare Pages Functions** (`functions/api/*.ts`) — serverless intake (`/api/lead` via Resend) + analytics beacon (`/api/track`)
- **Fonts:** Space Grotesk (display) + Inter (body) + JetBrains Mono (labels), Google Fonts loaded async (preload+onload swap — Rung IV strike)

## Structure

```
CompanySite/
├── src/
│   ├── layouts/Layout.astro       ← meta, JSON-LD, fonts, tracking bootstrap
│   ├── components/
│   │   ├── Header.astro / Footer.astro
│   │   ├── Hero.astro             ← "Websites that get you customers"
│   │   ├── Proof.astro            ← rendered from content collection
│   │   ├── CaseStudy.astro        ← one card per case study
│   │   ├── Services.astro         ← outcomes-framed services + from-pricing
│   │   └── Intake.astro           ← lead form + client-side submit
│   ├── content/
│   │   ├── config.ts              ← case-study schema
│   │   └── caseStudies/*.md       ← drop a .md file = new case study
│   ├── lib/track.ts               ← CTA tracking helper (data-cta attribute)
│   ├── pages/
│   │   ├── index.astro            ← home
│   │   └── audit.astro            ← /audit — TikTok bio link target
│   └── styles/global.css          ← Tailwind + design tokens
├── functions/api/
│   ├── lead.ts                    ← POST → validate → Resend email + auto-reply
│   └── track.ts                   ← POST → log CTA event (204)
├── public/
│   ├── _headers                   ← CSP + HSTS + cache rules
│   ├── _redirects                 ← /review, /free-review → /audit
│   ├── og.svg                     ← social share
│   ├── robots.txt
│   └── videos/                    ← case-study scroll MP4s (drop-in)
└── legacy/
    └── 2026-cyberpunk-index.html  ← previous single-file site, preserved
```

## Setup

```bash
cd CompanySite
npm install
npm run dev            # → http://localhost:4321
```

## Build + preview locally

```bash
npm run build          # → dist/
npm run preview        # serve dist/
```

## Deploy — Cloudflare Pages

Two paths — first-time uses **wrangler direct upload**, ongoing runs pick either.

### First-time (Mike-hands, ~5 min)

```bash
cd CompanySite
npx wrangler login                                          # browser consent
npm ci && npm run build
npx wrangler pages project create m3-companysite \
  --production-branch main
npx wrangler pages deploy dist \
  --project-name=m3-companysite --branch=main
```

Then in the dashboard:
- **Settings → Environment variables** — add `RESEND_API_KEY` (production). Optional: `LEAD_TO`, `LEAD_FROM`.
- **Custom domains** — attach `m3mm.net`.

### Subsequent deploys (~30 sec)

Either:
- `npx wrangler pages deploy dist --project-name=m3-companysite --branch=main` (direct upload from local `dist/`), or
- Connect the GitHub repo in the dashboard → CF auto-deploys on every `main` push.

Full step-by-step + first-live-buyer test-mode smoke checklist in [`RUNBOOK.md § 3`](RUNBOOK.md).

### Post-deploy smoke

```bash
curl -sSI https://m3mm.net | head -1                        # HTTP/2 200
curl -sS  https://m3mm.net | grep -c "get you customers"    # 1
curl -sS -X POST https://m3mm.net/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke","email":"s@e.com","businessType":"test","frustration":"ten char minimum"}'
# -> {"ok":true}
```

## Environment variables

| Var | Where | Required | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | Cloudflare Pages env | for real emails | Sends admin notification + auto-reply on lead submit |
| `LEAD_TO` | Cloudflare Pages env | no | Override the recipient of intake notifications |
| `LEAD_FROM` | Cloudflare Pages env | no | Override the "from" address (must be verified in Resend) |

**No env vars needed for the build itself.** The site builds and runs statically even with zero Cloudflare env — the functions just gracefully fall back to logging.

## Content — adding a case study

1. Drop a new `.md` file in `src/content/caseStudies/`.
2. Fill in the frontmatter (see `aries.md` as reference).
3. Drop a scroll `.mp4` + poster `.jpg` in `public/videos/` matching the `video` and `poster` fields.
4. `npm run build` — case study appears automatically in `#proof`, ordered by `order`.

Missing media falls back to a "coming soon" tile so the site never breaks on missing files.

## Adding a CTA

Any element with `data-cta="<name>"` fires a tracked event on click via `src/lib/track.ts`.
Add `data-section="<section>"` to tag which section it lives in. That's the whole contract.

## Test

```bash
npm test                    # vitest — 68 tests across 6 files
                            # covers /api/lead + /api/track validators,
                            # rate limiter, HTML escape, prefill helpers
```

Suite hits every money-path function pure helper (validate, rate, track-parse, prefill catalog) without needing a Cloudflare runtime — extracted from the function bodies exactly so they'd be unit-testable.

## Perf

Rung IV QUICKEN cycle — every optimization is measured before + after.
Current desktop Lighthouse: **98 / 96 / 93 / 91**. Strike ledger + raw JSON in
[`docs/lighthouse-baseline.md`](docs/lighthouse-baseline.md).

Latest strike (2026-07-07): Google Fonts stylesheet deferred via preload+onload swap → −247 ms render-blocking, no score change (already at ceiling), no FOIT (display=swap in URL).

## Standards & docs

Cross-repo engineering standards (one level up):

| Doc | Purpose |
|---|---|
| `../docs/ENGINEERING_STANDARDS.md` | Principles + code quality + Definition of Done |
| `../docs/CONVERSION_STANDARDS.md` | CTA + intake conventions (this site is the reference) |
| `../docs/HOSTING_STANDARDS.md` | Why Cloudflare Pages here |
| `../docs/EMBEDDABLE_PRODUCT_STANDARDS.md` | SiteGuide embed contract |

Project-specific docs at repo root: `BRD.md` · `TRD.md` · `RUNBOOK.md` · `ONBOARDING.md` · `CHANGELOG.md` · `CONTRIBUTING.md` · `SECURITY.md`.
