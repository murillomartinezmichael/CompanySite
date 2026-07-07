# CompanySite — Runbook

**Last updated:** 2026-07-05
**Owner:** Michael Martinez (murillomartinezmichael@gmail.com)
**Project shape:** Astro static site + Cloudflare Pages Functions. Rebuilt 2026-07-05 from the previous single-file HTML (preserved at `legacy/2026-cyberpunk-index.html`).

---

## Quick reference

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Run locally | `npm run dev` → http://localhost:4321 |
| Build | `npm run build` → `dist/` |
| Preview built site | `npm run preview` |
| Deploy | `git push origin main` — Cloudflare Pages auto-deploys |
| Smoke prod | `curl -I https://m3mm.net` → expect 200 |
| Tail prod logs | Cloudflare dashboard → Pages → CompanySite → Deployments → tail |

---

## 1. Local development

```bash
cd CompanySite
npm install
npm run dev
# open http://localhost:4321
```

Astro hot-reloads on file save. Content collections (case studies) also hot-reload.

Functions (`functions/api/*.ts`) are not exercised by `astro dev`. To exercise them
locally, either:
- Run against `npm run preview` after `npm run build` (functions still won't run
  under Astro's preview server; use wrangler for that), or
- Use `npx wrangler pages dev dist --compatibility-date=2024-11-01` after building.

For iteration, the form's fetch to `/api/lead` returns a network error in `dev`
mode — that's expected. Client-side error handling shows a graceful fallback.

---

## 2. Environment variables

| Var | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | For real emails | Bearer token for the Resend API. Get one at resend.com. Without it, `/api/lead` still returns 200 (logs the lead) but no email is sent. |
| `LEAD_TO` | No | Recipient of intake notifications. Defaults to `murillomartinezmichael@gmail.com`. |
| `LEAD_FROM` | No | Sender address. Must be a verified sender in Resend. Defaults to Resend's sandbox address. |

Set these in Cloudflare Pages → Settings → Environment variables. No `.env` file
is needed for the static build itself.

---

## 3. Deploy

### 3.1 First-time deploy (Mike-hands-only, ~5 min)

The Pages project doesn't exist yet. This one-time setup creates it and pushes
the current `dist/`. Runs once, ever.

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite

# 1. Auth (browser flow — opens dashboard consent)
npx wrangler login

# 2. Fresh production build
npm ci
npm run build

# 3. Create the Pages project (choose "None" for framework preset, "dist" as build output)
npx wrangler pages project create m3-companysite --production-branch main

# 4. First upload (this IS the deploy)
npx wrangler pages deploy dist --project-name=m3-companysite --branch=main

# 5. Dashboard follow-up (browser, 2 min):
#    - Cloudflare → Pages → m3-companysite → Settings → Environment variables
#      Add: RESEND_API_KEY   (production)
#      Optional: LEAD_TO, LEAD_FROM
#    - Custom domains → Set up a custom domain → m3mm.net
#      (Cloudflare guides the DNS; if the zone is already on Cloudflare it's
#      one click.)
```

### 3.2 Subsequent deploys (~90s)

Once the Pages project exists there are two paths:

**Path A — auto-deploy via GitHub (preferred once wired).** Push to `main`.
Cloudflare Pages sees the push, runs `npm ci && npm run build`, uploads
`dist/` and mounts `functions/` at the edge.

**Path B — direct upload via wrangler.** Sandbox-friendly, no GitHub round-trip:

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite
npm run build
npx wrangler pages deploy dist --project-name=m3-companysite --branch=main
```

### 3.3 Post-deploy smoke (any path)

```bash
curl -sSI https://m3mm.net | head -1
# HTTP/2 200

curl -sS https://m3mm.net | grep -c "Websites that"
# 1 — headline still present

curl -sS -X POST https://m3mm.net/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke","email":"smoke@example.com","businessType":"test","frustration":"local smoke test that is at least ten chars"}'
# {"ok":true}
```

### 3.4 Pre-deploy readiness (this runs every time before you paste)

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite
npm test                # expect 58/58 green (as of 2026-07-06)
npm run build           # expect "2 page(s) built" · <60 KB gz total
ls -la dist/index.html dist/audit/index.html dist/_headers dist/_redirects
# 4 files present; if any is missing, do NOT deploy.
```

---

## 4. Rollback

Cloudflare Pages retains every deployment. Roll back from the dashboard in one
click. Or:

```bash
git revert <bad-sha>
git push origin main
# Cloudflare redeploys the reverted state in ~90s
```

Zero DB, zero state — rollback is always safe.

---

## 5. Debug

### 5.1 Locally

- `npm run dev` gives you Astro's dev server. Hot reload on file save.
- Case study not showing? Check `src/content/caseStudies/*.md` frontmatter matches
  the schema in `src/content/config.ts`.
- Form 404 in dev? Expected — `/api/lead` is a Cloudflare function, not served by
  Astro dev. Test via `wrangler pages dev dist` or in production.

### 5.2 Prod logs

Cloudflare dashboard → Pages → CompanySite → **Functions** → tail. Every
intake fires a `lead_received` log line with the payload summary. Every CTA
fires a `cta` log line.

### 5.3 Common failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Form submits but no email arrives | `RESEND_API_KEY` unset OR sender not verified | Check Cloudflare env; verify sender in Resend |
| CSP violation in browser console | New third-party script/font added | Update `public/_headers` CSP directive |
| Case study renders "coming soon" | `public/videos/<slug>-scroll.mp4` missing | Drop the MP4 + `<slug>-poster.jpg` in `public/videos/` |
| Rate limit 429 in dev testing | Same-IP rate limit hit (5/60s) | Wait 60s or bump `RATE_MAX` in `functions/api/lead.ts` |
| Build fails on `content:*` type | Frontmatter drift from schema | `npm run astro sync` regenerates types |

---

## 6. Content editing rules

- **Design tokens in `tailwind.config.mjs`** — don't inline hex.
- **Every CTA needs `data-cta`** — the global tracker hooks into it.
- **Adding a case study = one `.md` file** in `src/content/caseStudies/` + one
  MP4 + one poster JPG in `public/videos/`.
- **From-pricing on Services is intentional** — the 2026-07-05 rebrief overrode
  the prior quote-only stance.

---

## 7. Secrets

Only `RESEND_API_KEY` matters, and it lives only in Cloudflare Pages env — never
committed. Rotate every 90 days per `docs/SECURITY_STANDARDS.md`.

---

## 8. Useful one-liners

```bash
# Count case studies
ls src/content/caseStudies/*.md | wc -l

# Verify all CTAs have data-cta
grep -RE 'class="[^"]*btn-(primary|ghost)"' src/ | grep -cv 'data-cta'
# Expect 0

# Check bundled CSS size
du -h dist/_astro/*.css
```

---

## Cross-refs

- **Repo map:** `../PROJECT_GLOSSARY.md`
- **Live URL manifest:** `../STATUS.md`
- **CTA + intake standard:** `../docs/CONVERSION_STANDARDS.md`
- **Hosting choice:** `../docs/HOSTING_STANDARDS.md`
- **Legacy single-file site:** `legacy/2026-cyberpunk-index.html`
