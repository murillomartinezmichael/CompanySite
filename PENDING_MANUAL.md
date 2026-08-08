# Pending manual

## www.m3mm.net returns 522 — Cloudflare zone fix (2026-08-07)

- [ ] **Bind or redirect `www.m3mm.net` in the Cloudflare dashboard (zone changes are Mike-only).**
  - **Diagnosis (VERIFIED 2026-08-07, read-only):** `https://m3mm.net/` returns 200 with the site's own `_headers` (CSP/HSTS present). `https://www.m3mm.net/` returns **522** with generic Cloudflare error headers. DNS for `www` resolves to the same proxied Cloudflare anycast IPs as the apex (104.21.76.226 / 172.67.201.235 via 1.1.1.1), so the record exists and is orange-clouded — but Cloudflare's edge has no origin for that hostname. The repo has **no** `wrangler.jsonc`/`wrangler.toml` (Pages project is dashboard-configured), and nothing in `dist` (canonical, og:url, sitemap.xml) or `dist/_redirects` references www — no content drift. **Likely cause (INFERRED, classic shape):** the `www` DNS record is proxied into the zone but `www.m3mm.net` is not attached as a custom domain on the Pages project, so no route/origin answers → 522.
  - **Fix — Option A (recommended, matches canonical URLs which are all apex): zone-level 301 www → apex.**
    Cloudflare dashboard → zone **m3mm.net** → **Rules** → **Redirect Rules** → **Create rule**:
    - Rule name: `www to apex`
    - If: Custom filter expression → Field **Hostname** equals `www.m3mm.net`
    - Then: **Dynamic** redirect, expression `concat("https://m3mm.net", http.request.uri.path)`, status **301**, check **Preserve query string**
    - Deploy. (Requires the `www` DNS record to stay **Proxied** — it already is.)
  - **Fix — Option B (alternative): bind www to the Pages project.**
    Dashboard → **Workers & Pages** → the CompanySite Pages project → **Custom domains** → **Set up a custom domain** → enter `www.m3mm.net` → Activate. Note: this serves the full site at www too; canonical tags already point at apex, so SEO is safe, but Option A keeps one URL per page.
  - **Verify after either fix:** `curl -sI https://www.m3mm.net/` → Option A: `301` + `location: https://m3mm.net/`; Option B: `200` with the site CSP header.
  - **Why blocked on him:** DNS/zone/Pages-domain changes are owner-gated this session (no dashboard access; zone changes are Mike-only by contract).
  - **Resumes:** Anyone typing `www.m3mm.net` (or old links) reaches the site instead of a Cloudflare error page.

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
  - **What to do:** Create a **live-mode** Stripe Payment Link for the $100 down payment (20% of the $500 Basic tier), label it non-refundable, paste the real URL into `src/config/offers.ts`'s `BASIC_SITE.paymentLink` (replacing `'https://buy.stripe.com/REPLACE_AFTER_SIGN_IN'` — a `test_` link will NOT unlock the gate), then **rebuild + redeploy** (`npm run build` && push or wrangler deploy — the site is static, so pasting the link alone changes nothing in production) and run RUNBOOK § 3.3's /start smoke.
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
