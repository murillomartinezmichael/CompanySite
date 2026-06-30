# CompanySite — Technical Requirements

**Author:** Michael Martinez
**Last updated:** 2026-06-29
**Status:** Live
**Links:** [BRD](./BRD.md) · [RUNBOOK](./RUNBOOK.md) · [ONBOARDING](./ONBOARDING.md)

---

## 1. Summary

Single-file static HTML marketing site for Offload Labs. Embedded CSS, no JS framework. Served via `nginx:alpine` Docker image on Railway. "Buy Now" buttons hand off to PaymentBackend Stripe Checkout endpoints.

## 2. Non-functional requirements

| Category | Requirement |
|---|---|
| First contentful paint | < 1.5s p95 |
| Lighthouse | > 95 Perf / A11y / BP / SEO |
| Hosting cost | min tier (currently Railway ~$5, target $0 on CF Pages) |
| Browser support | Last 2 versions Chrome/Edge/Safari/Firefox + iOS Safari |

## 3. Architecture

```
[Browser]
   │
   ▼
[nginx:alpine on Railway]
   ├── index.html (single-file, embedded CSS, SVG grain texture inline)
   └── No backend — Stripe buttons POST to PaymentBackend
```

## 4. Stack choices

| Concern | Choice | Why |
|---|---|---|
| Markup | HTML5 | Simplest possible, no build step |
| Styling | Embedded CSS in `<style>` block | One file, easy deploy, no asset pipeline |
| Fonts | Google Fonts — Fraunces (serif headings) + Inter (body) | Brand identity |
| Server | nginx:alpine via Dockerfile | Lightweight, cacheable |
| Hosting | Railway (today) | Evaluate Cloudflare Pages for $0 + global edge |
| Payments | Delegate to PaymentBackend | Site stays static |

## 5. Brand tokens

```css
--color-cream: ...
--color-clay:  ...
--color-stone: ...
--color-ink:   ...
```

(Exact hex values in `index.html` `<style>` block.)

## 6. Cross-cutting

- No JS — no error budget for client-side bugs
- No cookies, no tracking (yet) → simplifies privacy posture; add Plausible (privacy-friendly) if/when analytics needed
- Security headers via nginx config in Dockerfile
- No CMS — content edits are git commits

## 7. Open decisions

- **Migrate to Cloudflare Pages** — saves ~$5/mo, faster CDN. Trivial migration.
- **Add Plausible analytics** ($9/mo) or Cloudflare Web Analytics (free) — needed when measuring conversion in earnest.

## 8. Future work

- Cloudflare Pages migration
- SiteBot widget embed (eat our own dog food)
- Privacy-friendly analytics
- A/B test pricing copy (requires moving off pure static, or Cloudflare Workers)
