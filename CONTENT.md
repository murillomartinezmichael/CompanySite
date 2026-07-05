# CompanySite — Filmable Moments

One-line video ideas for the TikTok pipeline. The fleet's work IS the raw material.

---

## Ideas from this rebuild (2026-07-05)

- **"Before / After" split-screen** — old cyberpunk single-file site (screen-record legacy/index in a browser) → new dark editorial homepage. 15s.
- **"Zero JS on the wire"** — DevTools Network tab on m3mm.net homepage showing 0 JS bundles + 10 KB gzipped HTML. Overlay: "site loads before your video does." 10s.
- **"One .md file = new case study"** — screen record dropping a new `.md` file in `src/content/caseStudies/`, `npm run build`, refresh → new card appears. 20s.
- **"How the intake email actually works"** — real form submission in Chrome → Cloudflare Pages Functions dashboard tail → Resend email lands in inbox → auto-reply in submitter's inbox. Cut fast. 30s.
- **"Rate limit doing its job"** — curl the endpoint 6 times fast, watch the 6th return 429. Overlay: "5/min per IP." Bot-defense demo. 15s.
- **"That neon underline draws in on load"** — slow-mo screen record of the hero headline with the SVG underline animating. Type-nerd bait. 8s.
- **"Case study art (no MP4 yet)"** — pan over the Aries isometric deck-and-pergola SVG art. "This is not a stock illustration. It's the CSS I typed." 15s.
- **"Editorial vs. Bootstrap-card services"** — split-screen: generic SaaS 3-column pricing grid vs. this site's editorial numbered rows. Same info, different feel. 20s.

## Once deployed

- **"m3mm.net going live"** — DNS propagation, Cloudflare Pages deploy log, first curl of `/api/lead`. 30s.
- **"Bio-link → intake → email"** — phone-cam, tap TikTok bio, `/audit` page loads, form submit, notification sound on iPhone. 20s. This is THE money-path video.
