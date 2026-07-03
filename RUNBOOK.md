# CompanySite — Runbook

**Last updated:** 2026-07-03
**Owner:** Michael Martinez (murillomartinezmichael@gmail.com)
**Project shape:** static single-file HTML5 site. No build step, no server-side logic, no database.

---

## Quick reference

| Task | Command |
|---|---|
| Run locally | `python -m http.server 8000` (from repo root) |
| Build Docker image | `docker build -t companysite:local .` |
| Run container | `docker run --rm -p 8080:8080 companysite:local` |
| Deploy | `git push origin main` — Railway auto-deploys from the Dockerfile |
| Tail prod logs | `railway logs` (from the Railway CLI, project linked) |
| Smoke test prod | `curl -I <PROD_URL>` → expect `HTTP/2 200` |
| Open live site | `<PROD_URL>` — set in `STATUS.md` |

`<PROD_URL>` currently `null` in `STATUS.md § 🟢 LIVE right now` — update the manifest as soon as Railway assigns the public domain.

---

## 1. Local development

The whole site is `index.html` (~5600 lines) plus a `Dockerfile`. Any HTTP server works locally.

```bash
cd CompanySite
python -m http.server 8000
# open http://localhost:8000
```

There is **no build step**, no `npm install`, no framework toolchain. Edit `index.html`, refresh the browser, done.

The site embeds the SiteGuide widget as the last `<script>` tag in `<body>` (loaded from `https://siteguide-production.up.railway.app/widget.js`). If SiteGuide is unreachable, the rest of the page still renders — the widget just doesn't appear.

---

## 2. Environment variables

**None.** The site is fully static. Formspree endpoint (`https://formspree.io/f/xykabwog`) is hardcoded in the form action; Formspree handles the intake email.

Contact attribution: hidden `intent` and `source` fields on the contact form are populated at runtime — `intent` by the last-clicked `[data-intent]` CTA, `source` by referrer/URL at page load. See § 6 for how to inspect this.

---

## 3. Docker

The Dockerfile is `FROM nginx:alpine` with `index.html` and any static assets copied in. nginx serves on `$PORT` (Railway injects it; default `8080`).

```bash
docker build -t companysite:local .
docker run --rm -p 8080:8080 companysite:local
# open http://localhost:8080
```

---

## 4. Deploy

Push to `main` triggers Railway auto-deploy. Time-to-live is typically ~90 seconds.

```bash
git add index.html
git commit -m "content: <what changed>"
git push origin main
# Railway sees the push, builds the Docker image, redeploys
```

**Post-deploy smoke test (mandatory per `docs/DEPLOY_STANDARDS.md § 5`):**

```bash
curl -sS -o /dev/null -w "%{http_code}\n" <PROD_URL>
# expect 200
curl -sS <PROD_URL> | grep -c 'siteguide-production.up.railway.app/widget.js'
# expect 1 — confirms the SiteGuide embed line is intact
```

---

## 5. Rollback

Standard flow per `docs/DEPLOY_STANDARDS.md § 6`. Static site, no state, no migrations — rollback is always safe.

```bash
git revert <bad-sha>
git push origin main
# Railway redeploys the reverted state in ~90s
```

---

## 6. Debug

### 6.1 Locally

- Everything is inline. Open browser DevTools; there are no source maps to fetch.
- The intent-CTA flow: click a `[data-intent]` element, then inspect the contact form — the textarea should be prefilled with the brief, `input[name="intent"]` should carry the intent key.
- SiteGuide widget not appearing? Check the network tab for a blocked request to `siteguide-production.up.railway.app/widget.js`. Confirm the widget origin is up: `curl -I https://siteguide-production.up.railway.app/health`.

### 6.2 Prod logs

```bash
railway logs
# or, from the Railway dashboard: Deployments → latest → Logs
```

nginx access lines flow to stdout. `502` from Railway = the container isn't binding to `$PORT` — check the `Dockerfile` port substitution.

### 6.3 Common failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Page loads but chat bubble missing | SiteGuide unreachable | `curl -I https://siteguide-production.up.railway.app/health` — if down, that's a SiteGuide problem, page is unaffected |
| Formspree submission fails silently | Formspree endpoint changed / plan limit | Log in to Formspree, check the form status |
| 502 on prod URL | Railway container failing to bind `$PORT` | Check container logs, verify nginx config uses `$PORT` |
| CTA prefill doesn't populate | JS error earlier in the file broke script execution | Open DevTools console; fix the earlier error |

---

## 7. Content editing rules

- **No JS framework, no build step** — inline `<script>` is fine for small concerns; anything bigger becomes a sibling project loaded via `<script src>`.
- **All styles live inside the `<style>` block in `index.html`.** No external CSS files.
- **Pricing:** the site is quote-based only. Do not add `$` back into the pricing section — the 2026-07-03 rework was intentional.
- **Fonts:** Fraunces (serif headings) + Inter (body), both from Google Fonts.
- **Palette:** cyberpunk — neon yellow `--cream`, magenta `--clay`, cyan `--clay-light`, black `--ink`. Defined as CSS custom properties near the top of the `<style>` block.

---

## 8. Secrets

**None on this project.** Formspree is public. SiteGuide's Anthropic key lives in the SiteGuide service, not here.

Global rotation cadence (`docs/SECURITY_STANDARDS.md`): 90 days for any secret; immediately if leak suspected. Not applicable here today.

---

## 9. Useful one-liners

```bash
# How many links point at the current SiteGuide prod URL?
grep -c "siteguide-production.up.railway.app" index.html

# How many CTAs use the intent pattern?
grep -c "data-intent=" index.html

# Verify the contact form still carries the attribution fields
grep -E 'name="(intent|source)"' index.html
```

---

## Cross-refs

- **Where CompanySite fits in the tree:** `../PROJECT_GLOSSARY.md`
- **Live URL manifest:** `../STATUS.md § 🟢 LIVE right now`
- **CTA + intake standard:** `../docs/CONVERSION_STANDARDS.md`
- **Deploy standard:** `../docs/DEPLOY_STANDARDS.md`
- **Hosting choice rationale:** `../docs/HOSTING_STANDARDS.md` + `../docs/DECISIONS.md § D-001` (Railway default)
- **SiteGuide embed contract:** `../docs/EMBEDDABLE_PRODUCT_STANDARDS.md`
