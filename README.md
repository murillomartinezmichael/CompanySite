# CompanySite — m3mm.net

M³'s marketing site. Turns TikTok/Instagram traffic into DMs and quote requests.
Visitors arrive already half-sold from a video; this site's only job is to close the loop.

## Stack

- **Astro 4** — static output, zero runtime JS by default
- **Tailwind 3** — utility-first, dark-premium design system
- **Cloudflare Pages** — build + host + edge functions
- **Cloudflare Pages Functions** (`functions/api/*.ts`) — serverless intake + analytics
- **Fonts:** Fraunces (display) + Inter (body), via Google Fonts

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

1. Push this repo to GitHub.
2. In Cloudflare dashboard → **Pages → Create → Connect to Git**.
3. Point at the `CompanySite/` directory (root directory setting).
4. **Build command:** `npm run build`
5. **Build output directory:** `dist`
6. **Functions directory:** `functions` (auto-detected — no config needed).
7. **Environment variables** (Settings → Environment):
   - `RESEND_API_KEY` — from resend.com (required for real emails; without it, form submits still succeed but no email is sent — logs the lead to console)
   - `LEAD_TO` — optional; defaults to `murillomartinezmichael@gmail.com`
   - `LEAD_FROM` — optional; defaults to Resend sandbox address. Set to a verified domain sender (e.g. `hello@m3mm.net`) once DNS is set up.
8. **Custom domain:** attach `m3mm.net`.

Cloudflare Pages redeploys on every push to `main`.

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

## Standards & docs

Cross-repo engineering standards (one level up):

| Doc | Purpose |
|---|---|
| `../docs/ENGINEERING_STANDARDS.md` | Principles + code quality + Definition of Done |
| `../docs/CONVERSION_STANDARDS.md` | CTA + intake conventions (this site is the reference) |
| `../docs/HOSTING_STANDARDS.md` | Why Cloudflare Pages here |
| `../docs/EMBEDDABLE_PRODUCT_STANDARDS.md` | SiteGuide embed contract |

Project-specific docs at repo root: `BRD.md` · `TRD.md` · `RUNBOOK.md` · `ONBOARDING.md` · `CHANGELOG.md` · `CONTRIBUTING.md` · `SECURITY.md`.
