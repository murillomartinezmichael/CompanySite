# CompanySite — Business Requirements

**Author:** Michael Martinez
**Last updated:** 2026-06-29
**Status:** Live on Railway
**Stakeholders:** Offload Labs (the business behind it), prospective small-business clients

---

## 1. Problem

Offload Labs is Michael's freelance consulting business — automations, bots, and AI assistants for small business. Without a polished public site, prospects can't quickly answer "are these people real, what do they sell, how much, how do I buy." Every sales conversation starts with the same explanation, which is slow and inconsistent.

## 2. Who has this problem

### Primary
- **Small-business owners** evaluating Offload Labs as a vendor for automation work
- **Referrals** sent by existing clients who need a credible landing page to close

### Anti-persona
- Enterprise procurement teams (not the target market)
- DIY hobbyists looking for free automation tutorials

## 3. Success criteria

| # | Metric | Target |
|---|---|---|
| 1 | Visitor can understand what Offload Labs sells in < 30s | yes |
| 2 | Pricing is on the page (not "contact us for quote") | yes — $350 / $750 / $600 |
| 3 | Lighthouse | > 95 across all categories |
| 4 | Inbound qualified leads | > 2/mo within 90 days |
| 5 | Hosting cost | minimum tier (free or near-free) |

## 4. Scope

### In scope (v1)
- Single-page marketing site: hero, services, pricing, process, about, contact
- 3 fixed pricing packages: Starter Website $350, Business Website $750, Bot/AI Setup $600
- "Buy Now" buttons that route to PaymentBackend Stripe Checkout
- Branded design: Fraunces (headings) + Inter (body), cream/clay/stone/ink palette, subtle SVG grain
- Mobile-responsive
- Live deploy with custom domain

### Out of scope (v1)
- Blog
- Customer portal
- Multi-page architecture (everything fits on one page)
- Multi-language
- Live chat (use SiteBot once that project ships)

### Maybe later
- Add SiteBot widget once SiteBot is live (eat our own dog food)
- Case studies / project gallery
- Booking calendar (Calendly embed)

## 5. User stories

1. As a small-business owner, I land on the site, scroll once, and understand what Offload Labs sells.
2. As a buyer, I click "Buy Starter Website" and Stripe Checkout opens with the right SKU.
3. As any visitor, I can read the site on my phone without zooming.

## 6. Constraints

- Hosting: minimum tier (currently Railway, evaluating Cloudflare Pages for $0)
- No build step (single HTML file with embedded CSS)
- All payment flow handled by PaymentBackend — site stays static
- Brand consistency with Offload Labs identity (palette, fonts)

## 7. Risks

| Risk | Mitigation |
|---|---|
| Pricing on the page caps deal size — large prospects scared off | Acceptable trade-off; we're optimizing for SMB volume |
| Static site can't AB test copy | Add Cloudflare Workers or move to a deployable framework later |
| No live chat hurts conversion | Embed SiteBot once stable |

## 8. Dependencies

- PaymentBackend live + Stripe configured for 3 SKUs
- Domain (custom)
- Hosting (Railway today; consider Cloudflare Pages for $0)
