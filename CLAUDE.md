# CLAUDE.md

## What This Is
Static marketing website for Offload Labs — a software studio that builds automation, bots, and AI assistants for small businesses. Single-file HTML site with embedded CSS.

## Stack
Single-file HTML5 + embedded CSS — no build step, no JS framework → nginx:alpine Docker container on Railway

## Key Files
- `index.html` — entire site (~1000+ lines): HTML structure + all CSS in a `<style>` block
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
- No JavaScript — pure HTML + CSS only
- All styles live in the `<style>` block inside `index.html` — no external CSS files
- Google Fonts: Fraunces (serif headings) + Inter (body)
- Color palette: cream, clay, stone, ink — defined as CSS custom properties
- YAGNI — no JS frameworks, no build tools, no preprocessors
