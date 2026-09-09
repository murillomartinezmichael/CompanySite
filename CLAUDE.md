# CLAUDE.md

## What This Is

M3MM company headquarters at **m3mm.net**. The root is the public umbrella for
released products, client work, company departments, policies, career proof,
and the shipping roadmap. The website-services conversion floor lives at
`/websites` and still closes TikTok / Instagram traffic into quote requests.

## Brand and hub direction

- The written brand is **M3MM**, never `M³` or standalone `M3`.
- The three Ms mean **Modernize. Mobilize. Multiply.** Keep that punctuation and order.
- Use the supplied three-fold logo (`public/mark-light.png` on dark surfaces) wherever a visual wordmark/mark is shown; do not rebuild the old typed M³ mark.
- `m3mm.net` is the umbrella hub. The root must keep separate Released and Roadmap sections and route visitors to every M3MM department. `/hub` permanently redirects to `/`.
- Public reachability and official release are separate states. Only M3MM Hub is currently released; AriesOutdoorLiving is next; preview deployments stay labeled `testing`; Big7 is long-term pending real jobsite photography.
- `/websites` is the complete custom-site sales department. Preserve its Hero → TwoDoor → Proof → Services → FAQ → Intake funnel and its `#proof`, `#services`, and `#intake` anchors.
- `/policies` is the public company-policy library. Its COVID-19 policy keeps vaccination voluntary, protects medical privacy, prohibits retaliation, and yields to applicable law or client-controlled worksite requirements.

## Product Positioning (2026-07-09)

`/websites` is the M3MM custom business-site sales floor, not the starter-template store.

- Audience: small businesses through corporate-style local/regional companies that need a custom site, proof, and a lead path.
- Offer ladder: $500 basic starter/refresh; $1,000-$2,000 bounded business-site package; quote-only above $2,000.
- Premium quote-only examples: AriesOutdoorLiving-grade rebuilds, Big7Construction-style company sites, heavy service lines, portals, payments, integrations, or automation.
- SiteGuide owns the starter-company DIY lane: templates, widgets, and bundles. Route low-budget/template buyers there instead of blurring the M3 custom offer.

## Stack

- **Astro 7** static output on **Cloudflare Pages** (`astro@^7.3.2`);
  Node >=22.12, tested runtime pinned in `.node-version`.
- **Tailwind 3** utility CSS via PostCSS; content loader in `src/content.config.ts`
- **Cloudflare Pages Functions** in `functions/api/*.ts` for the intake + analytics endpoints
- No JS framework beyond Astro's built-in islands
- Fonts: self-hosted Space Grotesk + Inter variable WOFF2 files

Old cyberpunk single-file HTML is preserved at `legacy/2026-cyberpunk-index.html`.
Do not resurrect it — the current site is a deliberate reset.

## Key files

- `src/pages/index.astro` — M3MM umbrella hub, Released ledger, and Roadmap preview
- `src/pages/websites.astro` — custom website-services sales floor
- `src/pages/audit.astro` — `/audit`, the TikTok bio link target
- `src/pages/roadmap.astro` — public product roadmap
- `src/config/roadmap.ts` — single source for the 21 tracked drops and homepage release state
- `src/pages/policies.astro` — company policies, including voluntary COVID-19 vaccination
- `src/components/*.astro` — Hero, Proof (case studies), Services, Intake, Header, Footer
- `src/content/caseStudies/*.md` — one file per case study (Aries first)
- `src/lib/track.ts` — CTA tracker (fires on any `[data-cta]` click)
- `functions/api/lead.ts` — POST intake, emails via Resend
- `functions/_lib/referral.ts` — referral program config + copy. **One source
  of truth** for the payout terms; the intake, `/thanks`, `/start/thanks`, and
  the auto-reply email all render from it. `bountyUsd` stays `null` until Mike
  confirms an amount, and a test enforces that.
- `functions/api/track.ts` — POST analytics beacon
- `public/_headers` — CSP + HSTS + long-cache assets
- `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`

## Run locally

```bash
cd CompanySite
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/
npm run preview
```

## Deploy

Cloudflare Pages, connected to GitHub. Build cmd `npm run build`, output `dist`,
functions dir `functions` (auto). Env vars in dashboard: `RESEND_API_KEY`
(required for real emails), `LEAD_TO`, `LEAD_FROM` (optional),
`PUBLIC_STRIPE_PAYMENT_LINK` (build-time; the live Stripe Payment Link for the
$500 tier's $100 down payment — unset/invalid means /start gates to the free
review instead of showing a checkout button).

`npm run build` ends in `scripts/check-shipped-placeholders.mjs`, which fails the
build if a placeholder reaches `dist/` (dead Stripe link, `REPLACE_*` marker,
placeholder analytics id, `example.com` contact target, 555-01xx phone, Stripe
key material). Pages runs the build but never `npm test`, so that fence — not the
suite — is what stops a placeholder from reaching production.

## Rules

- **Every CTA gets `data-cta`.** No exceptions. The tracker is wired globally in
  `Layout.astro`'s bootstrap script.
- **Adding a case study = drop a `.md` file** in `src/content/caseStudies/`.
  Missing video/poster falls back gracefully.
- **Mobile-first.** 90%+ of traffic is TikTok. Test at 375px width first.
- **Design tokens live in `tailwind.config.mjs`** under `theme.extend.colors` +
  `fontSize` + `boxShadow`. Do not hardcode hex outside there.
- **`legacy/` is read-only.** Reference material only.
- **From-pricing on Services is intentional.** Overrides the 2026-07-03
  quote-only rework on the previous site — the new brief calls for from-pricing
  to filter tire-kickers.

## Standards & docs

- `../docs/ENGINEERING_STANDARDS.md` — principles + Definition of Done
- `../docs/CONVERSION_STANDARDS.md` — CTA + intake conventions
- `../docs/HOSTING_STANDARDS.md` — Cloudflare Pages sits under D-001 as a static-front adjacent to the Railway default
- Local doc-tier: `BRD.md` · `TRD.md` · `RUNBOOK.md` · `ONBOARDING.md` · `CHANGELOG.md`

---

## End-of-chunk: log to Cockpit

Every shipped chunk (feature end-to-end, doc rolled out, deploy that survives smoke test) gets a Work Log entry in `../COCKPIT.html` — press `l`. No entry = the chunk didn't happen. Full protocol in `../CLAUDE.md § DEFINITION OF DONE — Cockpit Work Log`.


<!-- AI-HUB-SYNC:START -->
## Shared AI Hub

Read ../AI_HUB.md after root ../CLAUDE.md and before changing this project. Product lane, UI verdict, and combine/separate decisions are centralized there so Claude and Codex stay synced.

Current lane: M3 custom business website sales floor

Current next action: Verify the Services ladder UI at desktop and 375px, run npm test and npm run build, then deploy only if green.
<!-- AI-HUB-SYNC:END -->
