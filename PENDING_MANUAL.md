# Pending manual

## Competitor-research implementation gates (2026-07-19)

- [ ] **Be ready to deliver recorded video teardowns (OBS/Loom).**
  - **What to do:** Pick OBS or Loom, do one dry-run recording, and treat every new intake as a 5-minute recorded video teardown (screen-record the lead's site while narrating what's working / what's leaking / rebuild-or-fix).
  - **Why blocked on him:** The site, FAQ, /thanks, and the auto-reply email now all promise "a 5-minute recorded video teardown within 24 hours" (commit `ee00fbf`) — only Mike can record with his own voice/face (LAW 8: human voice).
  - **Resumes:** The promise is honest the moment the next lead gets a video reply. Also unblocks reusing teardowns as TikTok content.

- [ ] **Add a "teardown delivered" step to the n8n lead OS + sync the n8n auto-reply copy.**
  - **What to do:** In michaelmurillo.app.n8n.cloud, add a delivered/not-delivered tracking field (leads data table column or workflow step) and update the n8n-side auto-reply Gmail template to promise the video teardown (same wording as `functions/api/lead.ts`).
  - **Why blocked on him:** The live lead workflow was verified end-to-end 2026-07-19 (execution #1144); editing a verified money-path workflow can't be safely re-verified without firing real emails at Mike — the real-write smoke is deliberately manual (TODO § Manual/data follow-ups #4).
  - **Resumes:** Teardown-delivery SLA becomes measurable; auto-reply and site promises stop drifting.

- [x] **Refund/down-payment policy confirmed 2026-07-20.**
  - **Decision:** Require 20% down before work starts. The down payment is non-refundable; all other payments are refundable before launch.
  - **Implemented:** Replaced the superseded full-refund badge on the $500 + $1k-$2k Services cards and added regression coverage.

- [ ] **Stripe Payment Link for the directly-buyable $500 Basic tier.**
  - **Status 2026-08-05 (supersedes 2026-07-21):** The `/start` page + `/start/thanks` + lead-capture wiring are built (`a81a7c1`). The placeholder no longer fails the suite OR renders a dead buy button: `checkoutReady` in `src/config/offers.ts` semantically validates the link (only a well-formed LIVE `https://buy.stripe.com/<slug>` passes; placeholder, `test_`-mode, and malformed values all fail closed) and /start gates to the free-review intake with honest "checkout opening soon" copy while it's false. `tests/build/start-checkout.test.ts` pins the validator (table of good/bad links), the source structure, and the built `dist/start/index.html`.
  - **Status 2026-08-12 (supersedes the paste-into-code step below):** the link now comes from an **env var**, so this is a dashboard-only action — no code edit, no commit. `src/config/offers.ts`'s `resolvePaymentLink()` reads `PUBLIC_STRIPE_PAYMENT_LINK`, validates it, and falls back to the placeholder (page stays gated on the free-review intake) if it is missing, blank, `test_`-mode, or malformed. `npm run build` now ends in `scripts/check-shipped-placeholders.mjs`, which **fails the Cloudflare Pages build** if any dead payment link or placeholder marker reaches `dist/` — the tests alone could not do that, because Pages never runs `npm test`.
  - **Status 2026-08-31 (agent automation attempt — narrows the manual step to ONE authorization):**
    - Stripe CLI is live-authenticated (account M3MM.dev, `acct_1Tsb7O0ktQ0lYq0W`, keys valid to 2026-11-19) but its restricted key has **no write permission** for products, prices, or payment links — probed live: `products create` and `prices create` both return `more_permissions_required`. So the link could not be created by script yet. Verified read-side: `payment_links list --live` = **0 links exist**; live catalog has `M3 — Basic Business Site` at $500 (full price, not the $100 deposit).
    - Cloudflare side needs **no dashboard clicks**: the Pages project `m3-companysite` is git-connected (GitHub `murillomartinezmichael/CompanySite`, production branch `main`, deploys enabled), and the pre-authed Cloudflare API MCP can PATCH the Production env var and POST a new production deployment. Deployed prod commit `45f7577` == local `main` (verified 2026-08-31).
    - Build plumbing verified 2026-08-31 on a clean clone of `main` (@`45f7577`): env var unset → build green + /start gated (fence clean); well-formed live-shaped link → `data-cta="start-pay-deposit"` renders, "Checkout opening soon" gone; `test_`-mode link → **build fails** with the TEST-mode reason (fence works). Live baseline curl: gate copy present, CTA absent — matches.
    - **The one remaining Mike action:** grant script write access to Stripe live — either approve the Stripe MCP OAuth (one click, agent supplies the URL), or enable Products + Prices + Payment links **write** on the Stripe CLI's restricted key in Dashboard → API keys. After that single step, an agent finishes link-create → env var → redeploy → smoke unattended.
  - **What to do (Mike only, ~5 min — or just the one authorization above):**
    1. Stripe dashboard → **live mode** (not test) → Payment links → create a link for **$100 USD**, name it `M3MM Basic site — 20% down payment`, description noting the down payment is non-refundable and the $400 balance is due before launch.
    2. Set the link's success/redirect URL to `https://m3mm.net/start?checkout=complete` (that query param is what reveals the project-intake step).
    3. Copy the link — it looks like `https://buy.stripe.com/aBcD1234efGh5678` (a `test_` prefix will NOT unlock the gate).
    4. Cloudflare Pages → the CompanySite project → **Settings → Environment variables → Production** → add `PUBLIC_STRIPE_PAYMENT_LINK` = that URL → Save.
    5. **Redeploy** (Deployments → Retry deployment, or push). The site is static: the env var does nothing until a build runs.
    6. Smoke it with RUNBOOK § 3.3's /start block — `data-cta="start-pay-deposit"` should now be 1 and `Checkout opening soon` 0.
  - **If you'd rather keep it in code:** paste the URL as the fallback argument in `resolvePaymentLink()` instead. The env var is preferred because a bad paste in the dashboard costs a redeploy, not a commit on the money path.
  - **Why blocked on him:** Needs Mike's authenticated Stripe dashboard; the pricing policy itself was confirmed 2026-07-20.
  - **Resumes:** After paste + rebuild + redeploy, the paid CTA replaces the gated fallback on /start, the suite's dormant live-link tests activate, and the $500 tier is directly buyable.

- [ ] **Pick + upload the reel clip for the pricing-section video embed.**
  - **What to do:** Choose the best-performing 60-90s vertical TikTok clip, export it, and upload to Cloudflare R2 or Stream (NOT the Pages bundle — 25MB per-file limit); drop the URL + a poster frame in the repo or this file.
  - **Why blocked on him:** The clip is his content (LAW 8/9); R2/Stream setup needs his Cloudflare dashboard.
  - **Resumes:** High/M research item "ship the reel above pricing" — the embed itself (muted autoplay, poster, prefers-reduced-motion) is a one-session build once the asset URL exists.

- [~] **Founder photo + real TikTok/IG profile URLs for the intake signature card — PARTIAL 2026-07-20.**
  - **TikTok SHIPPED 2026-07-20:** `https://www.tiktok.com/@m3mm_dev` is wired into the intake signature card (`src/components/Intake.astro`), tracked as `data-cta="signature-tiktok"` (NAV_ONLY, no conversion intent).
  - **Still needed:** Instagram profile URL, and the headshot itself (Mike said "later" — not ready yet, not blocked on anything technical, just hasn't been taken/picked).
  - **What to do:** add Instagram + swap in the real headshot once both exist — same signature-card pattern.
  - **Why blocked on him:** headshot + IG handle are his to provide.
  - **Resumes:** Medium/S research item "close the face loop by the review form" — TikTok half is done; Instagram + headshot close it out.

- [ ] **Approve the Aries before/after slider (old site vs shipped site).**
  - **What to do:** (a) OK showing Aries' pre-rebuild site publicly with David Serrano (client conversation), then (b) pick the Wayback Machine capture of the old ariesoutdoorliving.com to use.
  - **Why blocked on him:** Publishing a teardown-style comparison of a client's old site without their OK risks the relationship (LAW 9-adjacent); the screenshot choice is editorial.
  - **Resumes:** High/S research item "before/after slider" — pure CSS/JS component + two screenshots is a half-day agent build once approved; same asset doubles as a TikTok post.

- [ ] **Record trade-specific TikTok/IG videos deep-linking to the new /for/* pages.**
  - **What to do:** Film outdoor-living / construction / home-services variants and put `https://m3mm.net/for/<trade>?utm_source=tiktok&utm_medium=bio&utm_campaign=<video>` in the bio/caption per video.
  - **Why blocked on him:** Content creation is human-voice work (LAW 8); the landing pages shipped in `533ca72` and are live-ready.
  - **Resumes:** Message match holds end-to-end (video → trade headline → matching case study → form) — the multiplier the research called out.

- [x] ~~Homepage FAQ physical-keyboard smoke (Tab + Enter/Space toggle)~~ **DONE 2026-07-19 — Mike confirmed Enter and Space both open and close the FAQ items on the live site.** Final keyboard-interaction gate cleared.

- [x] ~~Set `N8N_LEAD_WEBHOOK_URL` in Cloudflare Pages + redeploy~~ **DONE 2026-07-19** — Mike set the var and retried the deployment; verified end-to-end with a marker lead through live m3mm.net → n8n execution #1144 all-green (scored, stored as leads row id 3, notify + auto-reply Gmail both sent). Marker row cleanup tracked in root `PENDING_MANUAL.md` P0 item 3.


## Referral program gate (2026-08-03)

- [ ] **Set the referral bounty amount (and when it's paid).**
  - **What to do:** Decide the cash paid per successful referral and the payout trigger, then set them in `functions/_lib/referral.ts` — `REFERRAL_PROGRAM.bountyUsd` (currently `null`) and `payoutTrigger` (currently `'when their build starts'`). That one edit lights up all four surfaces at once: the intake hint, `/thanks`, `/start/thanks`, and the auto-reply email. The research pattern (WebsiteDesignFor99) uses $100/referral; the field, the `?ref=` share links, and the admin-email attribution row are already live and capturing referrers today.
  - **Why blocked on him:** It is a cash commitment published on a live money-path site. Guessing the number would be fabrication (LAW 6), so the code deliberately ships in capture-only mode and `tests/build/referral-program.test.ts` fails if any payout figure reaches a public surface while `bountyUsd` is null.
  - **Resumes:** The program stops being "tell me who sent you" and becomes "get $X for sending someone" — the actual conversion mechanic. Also update the expectation in `tests/build/referral-program.test.ts` ("keeps the bounty unset until the owner confirms it") in the same commit as the decision.
