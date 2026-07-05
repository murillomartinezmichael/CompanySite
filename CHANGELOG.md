# Changelog

All notable changes to this project.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Full rebuild: Astro 4 + Tailwind 3 on Cloudflare Pages** (was single-file nginx:alpine on Railway). Previous site preserved verbatim at `legacy/2026-cyberpunk-index.html`. New brief: convert TikTok/Instagram traffic — dark premium aesthetic, mobile-first, Lighthouse-95+ target. Every CTA carries `data-cta` and fires a tracked event on click (`src/lib/track.ts` → `functions/api/track.ts` beacon). Dockerfile updated to multi-stage build so Railway remains a fallback deploy target.
- refactor(nginx): extract nginx server block from the inline `echo` in `Dockerfile` into a proper `nginx.conf` file, matching the Big7Construction pattern. Adds `${PORT:-8080}` substitution via `sed` at container start, replacing the previous hardcoded `listen 80` + `EXPOSE 80`. Rebuild required after merge.

### Added
- **`src/pages/index.astro`** — home with Hero → Proof → Services → Intake, all rendered from atomic components.
- **`src/pages/audit.astro`** — dedicated `/audit` landing page for the TikTok bio link; shorter, no nav clutter, `source=audit-page` on the intake so click-throughs are traceable.
- **Case-study content collection** at `src/content/caseStudies/*.md` with Zod schema in `src/content/config.ts`. Aries Outdoor Living and Big 7 Construction seeded; adding a new case study = one `.md` file + one MP4 + one poster JPG in `public/videos/`.
- **`functions/api/lead.ts`** — Cloudflare Pages function: validates the intake, sends admin notification + auto-reply via Resend (env `RESEND_API_KEY`), falls back to logging if the key is missing so MVP works pre-key. Per-IP rate limit 5/60s + honeypot.
- **`functions/api/track.ts`** — CTA analytics beacon. Logs to Cloudflare tail (later swap for Plausible/D1). Client uses `navigator.sendBeacon` when available.
- **`public/_headers`** — CSP, HSTS, X-Frame-Options DENY, immutable long-cache for `_astro/*`.
- **`public/_redirects`** — `/review`, `/free-review`, `/site-review` → `/audit` (301) for TikTok bio-link variants.

### Added
- feat(security): 5 defense-in-depth response headers on every response — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. Closes SECURITY_AUDIT.md § M3-M6 for CompanySite (out of original audit scope, surfaced by `verify-security-headers.py` live sweep). Headers duplicated in `location = /index.html` because nginx `add_header` inheritance resets when a nested location declares its own directives. Docker build + curl smoke pending next Railway redeploy.

## [0.1.0] - 2026-07-03

Initial documented release. Prior work committed since 2026-04-22 is being
captured retroactively; see `git log` for the full history.

### Added
- README: replace hardcoded 'C:\Users\Michael\Documents\GitHub\' path with relative reference
- feat: first-visit brightness health warning + dim-mode toggle
- feat: consolidate pricing into tabbed Build-Your-Own section
- price: correct Basic tier scope + real Aries V1 receipt + entry-level rates
- feat: custom hours care option in quote builder
- price: Basic website tier starting price 800 to 1000
- work: remove mock products, show only live work with inline pricing
- Replace 'jane@company.com' placeholder with generic 'you@example.com'
- work: universal intent-CTA prefill — every tier CTA feeds intake with context
- work: bot playbook — niche picker + pipeline flow + real bot pricing
