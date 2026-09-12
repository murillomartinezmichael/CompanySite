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

## Ready to post (draft stills, 2026-08-24) — LAW #8 human post only

- **Hub TikTok/Reels still** — `public/social/m3mm-hub-tiktok.png` (9:16). Copy matches the live hub: Everything I'm building / One front door. Bio target stays m3mm.net.
- **Hub Instagram square** — `public/social/m3mm-hub-square.png`.
- **Hub loop (draft only)** — `public/social/m3mm-hub-loop.gif` (+ `.webm`). Dark navy + cyan trefoil, “One front door.” Not wired on `index.astro` — the hub is type-only and a decorative loop would fight it. Human post, never auto.
- **Do not auto-publish.** Overlay your voice / on-camera if you record; the still is the card, not the video.

## Once deployed

- **"m3mm.net going live"** — DNS propagation, Cloudflare Pages deploy log, first curl of `/api/lead`. 30s.
- **"Bio-link → intake → email"** — phone-cam, tap TikTok bio, `/audit` page loads, form submit, notification sound on iPhone. 20s. This is THE money-path video.
