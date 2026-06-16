# CompanySite
Offload Labs marketing website — automation, bots, and AI assistants for small business. Single-file static HTML site.

## Stack
- HTML5 + embedded CSS (no build step, no JS framework)
- Google Fonts: Fraunces (headings) + Inter (body)
- nginx:alpine → Railway

## Setup
```bash
cd CompanySite

# Serve locally — any static server works
python -m http.server 8000
# Open http://localhost:8000
```

## Environment Variables
None — fully static site.

## Deploy
Railway — push to main triggers Docker build. nginx:alpine serves `index.html` on `$PORT`.

## Status
Live. Sections: hero, services, pricing, process, about, contact. Pricing: Starter $350 / Business $750 / Bot Setup $600.
