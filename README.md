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

<!-- standards-block-v1 -->
## Standards & docs

This project follows the cross-repo engineering standards. See top-level docs at `C:\Users\Michael\Documents\GitHub\`:

| Doc | Purpose |
|---|---|
| `ENGINEERING_STANDARDS.md` | Principles + code quality + stack picking + Definition of Done |
| `docs/TESTING_STANDARDS.md` | Test pyramid, coverage gates |
| `docs/API_STANDARDS.md` | REST + Swagger + Postman conventions |
| `docs/OBSERVABILITY_STANDARDS.md` | Logs / metrics / traces / health / alerts |
| `docs/SECURITY_STANDARDS.md` | OWASP top 10, auth, secrets, supply chain |
| `docs/DATABASE_STANDARDS.md` | Schema, migrations, indexing |
| `docs/HOSTING_STANDARDS.md` | Hosting picks + cost ladder |
| `docs/MICROSERVICES_STANDARDS.md` | When to split, contracts, fitness function |

Project-specific docs live in this repo at the root: `BRD.md` · `TRD.md` · `RUNBOOK.md` · `ONBOARDING.md` · `CHANGELOG.md` · `CONTRIBUTING.md` · `SECURITY.md`.

ADRs live in `docs/adr/`. Postmortems live in `docs/postmortems/`.
