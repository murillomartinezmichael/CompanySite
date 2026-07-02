# CLAUDE.md

## What This Is
Static marketing website for Offload Labs — a software studio that builds automation, bots, and AI assistants for small businesses. Single-file HTML site with embedded CSS.

## Stack
Single-file HTML5 + embedded CSS + small amount of inline JS (Stripe checkout toast, scroll reveals, contact form) → nginx:alpine Docker container on Railway. **No JS framework, no build step.**

Embeds the SiteGuide widget (sibling project at `../SiteGuide/`) via a single `<script>` tag at the end of `<body>`. The widget is loaded from a separately-deployed SiteGuide instance; if it's unreachable the rest of the page is unaffected.

## Key Files
- `index.html` — entire site (~2700 lines): HTML structure + all CSS in a `<style>` block + small inline JS
- `Dockerfile` — `FROM nginx:alpine`, copies `index.html`
- `SPEC.md` — full design spec: layout, typography, color system, sections, deploy guide

## Run Locally
```bash
cd CompanySite
python -m http.server 8000
# Open http://localhost:8000
```

## Deploy
Railway — push to main triggers auto-deploy via Dockerfile. nginx serves on `$PORT` (default 8080). No build step needed.

## Env Vars
None — fully static site, no server-side logic.

## Pricing (reference)
- Starter website: $350
- Business website: $750
- Bot/AI assistant setup: $600

## Rules
- **No JS framework, no build step.** Inline `<script>` is fine for small concerns (form submit, scroll reveals). Anything bigger goes in a sibling project that this site loads via `<script src>` (see SiteGuide embed).
- All styles live in the `<style>` block inside `index.html` — no external CSS files
- Google Fonts: Fraunces (serif headings) + Inter (body)
- Color palette: Cyberpunk 2077 / Edgerunners — neon yellow `--cream`, magenta `--clay`, cyan `--clay-light`, black `--ink` — defined as CSS custom properties
- YAGNI — no JS frameworks, no preprocessors


## Standards & docs

This project follows the cross-repo engineering standards:
- `../ENGINEERING_STANDARDS.md` — principles + code quality + Definition of Done
- `../docs/*_STANDARDS.md` — API, testing, observability, security, database, hosting, microservices, accessibility, performance, release
- Local doc-tier: `BRD.md` · `TRD.md` · `RUNBOOK.md` · `ONBOARDING.md` · `CHANGELOG.md` · `CONTRIBUTING.md` · `SECURITY.md`
- ADRs in `docs/adr/`, postmortems in `docs/postmortems/`
