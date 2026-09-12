# ADR 0001 — Split website services out; fold the resume into the hub

**Status:** accepted, not yet implemented
**Date:** 2026-08-19

## Context

m3mm.net currently does three jobs at once. Its own description says it is
"Michael Murillo-Martinez's main company hub: released products, client work,
website services, career." In the source that shows up as:

```
src/pages/index.astro       the hub
src/pages/websites.astro    "M3MM's website-services department"
src/pages/for/construction.astro | home-services.astro | outdoor-living.astro
src/pages/roadmap.astro     the shipping schedule
src/pages/start.astro       checkout / intake
src/pages/audit.astro       free site review
```

Meanwhile the resume lives somewhere else entirely — `ResumeSite`, a separate
Cloudflare **Worker** (`resumesite`) on `resumesite.murillomartinezmichael.workers.dev`,
with its own repo, its own deploy, and a pending task to go buy it a domain.

Two problems follow from that split.

**The company site reads as a product.** A visitor landing on m3mm.net meets a
website-selling department before they meet the company. The vertical pages
(`for/construction`, `for/home-services`, `for/outdoor-living`) are sales
surfaces for one offering, not company pages.

**The career story is homeless.** The resume is a separate site with no domain,
and rung 6 of the money ladder is literally "pick + buy the custom domain" —
spending money and maintenance on a second property to host one page. The docs
cannot even agree what to buy: `PENDING_MANUAL.md` says michaelmurillo.dev,
`CLAUDE.md` says murillomartinez.dev.

Notably, `src/config/roadmap.ts` already types a drop's category as
`'Company' | 'Client work' | 'Product' | 'Career'`. The hub was designed to
carry career content. It just never did.

## Decision

**1. m3mm.net becomes the company site, and the resume moves onto it.**
The `Career` category stops being a type that never appears. `ResumeSite`'s
content lands at `m3mm.net/resume`, and the standalone Worker is retired once
the content is live and redirecting.

**2. Website services spins out into its own project.**
`websites.astro` and the `for/*` vertical pages move to a dedicated site. The
offering gets to have its own homepage, pricing, and funnel instead of being a
tab on a company hub.

**3. m3mm.net counts as one site.**
Not "the hub plus the resume plus the websites department" — one property, one
entry in `projects.yaml`, one thing to keep alive.

## Consequences

**Good**
- Rung 6's "buy a domain" task disappears. The resume gets a real address on a
  domain that is already bought, already on Cloudflare, and already has traffic.
- One fewer Cloudflare Worker to deploy, monitor, and pay attention to.
- The michaelmurillo.dev / murillomartinez.dev disagreement stops mattering.
- The company hub reads like a company.
- The website-services offering can be sold without competing for attention
  with career content and product announcements on the same page.

**Costs and risks**
- m3mm.net is money rung 1 and is currently one Stripe link away from taking
  payment. **This refactor must not land before that link is live.** Shipping a
  structural change to the checkout site while checkout is still unfinished
  trades revenue for tidiness.
- `resumesite.murillomartinezmichael.workers.dev` is already indexed and is on
  a résumé/job-application path. Retire it with a 301, not a deletion, and do
  not take it down until the new URL is serving.
- ResumeSite is a Cloudflare **Worker**, m3mm.net is **Pages**. This is not a
  file copy — the content has to be ported into Astro pages, and
  `scripts/generate-resume-pdf.mjs` has to move with it.
- The website-services split creates a new project with a new deploy contract,
  a new `deploy.yaml`, and a new domain to decide on. That is the expensive half
  of this ADR; it can land after the resume move.

## Sequencing

Deliberately ordered so revenue is never blocked on cleanup:

1. **Set `PUBLIC_STRIPE_PAYMENT_LINK` and rebuild.** Nothing here starts first.
2. Port the resume into `m3mm.net/resume`; keep `scripts/generate-resume-pdf.mjs`.
3. 301 the Worker to the new URL. Leave it running.
4. Mark rung 6's domain purchase obsolete in the money ladder.
5. Only then: spin `websites.astro` + `for/*` into their own project.
6. Retire the `resumesite` Worker once the redirect has been in place long
   enough for the old URL to fall out of use.

## Notes

Big7Construction is deliberately *not* part of this. It is deployed and serving
but not released — the portfolio is a shell until the client's job photos land.
It is flagged `blocked_on_user` in `projects.yaml` for that reason and should not
be cited as proof-of-work on either the hub or the new services site until the
shoot happens.
