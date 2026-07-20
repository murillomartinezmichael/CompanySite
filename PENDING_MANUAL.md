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
  - **What to do:** Create a Stripe Payment Link for the $100 down payment (20% of the $500 Basic tier), label it non-refundable, then hand the URL to a session to build the /start page + n8n webhook into the lead OS.
  - **Why blocked on him:** Needs Mike's authenticated Stripe dashboard; the pricing policy itself was confirmed 2026-07-20.
  - **Resumes:** High/M research item "make the $500 tier directly buyable" becomes agent-actionable end-to-end.

- [ ] **Pick + upload the reel clip for the pricing-section video embed.**
  - **What to do:** Choose the best-performing 60-90s vertical TikTok clip, export it, and upload to Cloudflare R2 or Stream (NOT the Pages bundle — 25MB per-file limit); drop the URL + a poster frame in the repo or this file.
  - **Why blocked on him:** The clip is his content (LAW 8/9); R2/Stream setup needs his Cloudflare dashboard.
  - **Resumes:** High/M research item "ship the reel above pricing" — the embed itself (muted autoplay, poster, prefers-reduced-motion) is a one-session build once the asset URL exists.

- [ ] **Founder photo + real TikTok/IG profile URLs for the intake signature card.**
  - **What to do:** Drop a headshot (square, ~500px) into `public/` and write the exact TikTok + Instagram profile URLs here.
  - **Why blocked on him:** No photo exists in the repo and the handles are documented nowhere in the fleet — guessing profile URLs would be fabrication (LAW 6).
  - **Resumes:** Medium/S research item "close the face loop by the review form" (the name + signature card already exist in `Intake.astro`).

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

