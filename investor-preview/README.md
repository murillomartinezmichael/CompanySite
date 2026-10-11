# M3MM investor showcase — review candidate

Funding target: **$2,000 USD**, confirmed by Michael on October 10, 2026.

Open `dist/index.html` directly in a browser, or run `npm start` here and open
http://127.0.0.1:4387. No install or account is needed to view the built site.
The preview server binds only to this computer. This is not a shareable hosted URL.

## Included

### October 10 demo expansion

Current coverage: **9 recorded app workflows, 2 recorded output walkthroughs,
1 existing Aries recording, 1 verified PhotoPicker output example, 6 environment
gates, 17 examples pending, and 7 parked/historical entries** (43 total).
`demo-coverage.mjs` generates the visible coverage tracker and JSON export.
New recordings: Big7 navigation, CodeReviewHub unsubmitted fictional intake,
Cockpit isolated sample task, and HandoffKit generated fictional bakery guide.
PhotoPicker processed 40 synthetic images offline: 10 keepers, 27 duplicates,
3 blurry rejects. Source output is in `output-examples/photopicker.json`.

Confluence: https://m3mm.atlassian.net/wiki/spaces/SD/pages/4096001

Earlier seven-recording descriptions below document the first capture batch;
the counts above and current manifest supersede them. Release holds remain.

- **Narrated presenter mode:** click “Play narrated presentation.” A 12-chapter
  investor pitch explains the portfolio, shows an existing Aries recording,
  covers infrastructure and the $2,000 proposal, and ends with discussion.
  Choose the full tour for all 43 portfolio entries and six framing chapters.
- 147 prerecorded synthetic narration segments, using the installed Microsoft
  Zira Desktop voice. No voice cloning, paid service or runtime AI connection.
  Michael explicitly requested AI audio for this site on October 10; this is
  a scoped exception to the older fleet no-TTS preference.
- Clickable talking points, synchronized highlighting, automatic chapter
  advance, pause/replay, chapter selection, speed, volume, desktop fullscreen,
  and a persistent mobile play/pause control. “Open product” pauses narration
  before opening a public product link; it does not submit forms or operate it.
- Seven entries now open recorded applications or a sample report, with seekable steps and extra detail. Other products can launch a narrated explanation. The existing silent
  overview clips remain clearly labeled; Aries is an actual recorded website
  walkthrough. This is not a fully automated live-app demo for every product.

- 43 portfolio entries reconciled against 45 GitHub repository metadata records,
  the fleet manifest, company roadmap and Linux product sources.
- Six featured entries; searchable, filterable full catalog with audience,
  description, commercial role and explicitly qualified lifecycle states.
- 43 original, silent, captioned 18-second MP4 explainers with matching text.
  These are editorial product overviews, **not recorded software demonstrations**.
- Existing equipment, the server-funding case, a proposed allocation totaling
  $2,000 and measurable acceptance milestones. No invented revenue or return.
- Keyboard controls, native video playback, reduced-motion support, no-JS
  content fallback and an accessibility page.

The CompanySite build includes this showcase at `/investors/`, with links in
the company header and footer. `scripts/build-investors.mjs` integrates the
static page and its accessibility page after Astro builds. Approved generated
media lives in `media/` as versionable build inputs; ignored `dist/` is output.
The standalone preview still works. Publication remains a separate release gate.
Buildless HTML/JS reuses the original M3MM mark, fonts and palette.

## Edit / reproduce

Edit `portfolio.mjs` for descriptions/statuses, `build.mjs` for the narrative,
and `style.css` / `app.js` for presentation and interactions.
Presenter scripts and chapter copy are in `presentation.mjs`, `presenter.js`
and `presenter.css`.

1. `npm run build` — generate the static site and copy approved brand assets.
2. `npm run videos` — render/rebuild all overviews (Python + Pillow + ffmpeg).
3. `npm start` — serve this candidate locally.
4. In another terminal, `npm run verify` — browser playback, filtering,
   no-JS/offline behavior and accessibility across 320/375/768/1440 widths.
5. After changing chapter narration, run `npm run narration` (Windows
   System.Speech + installed Microsoft Zira Desktop + ffmpeg), then
   `npm run verify:presenter`. Copy changes to `dist/` with `npm run build`
   before verification. Build never starts audio or remote services.

Presenter evidence: `evidence/presenter-verification.json` covers real audio
playback, natural end-of-segment/end-of-chapter transitions, pause, manual
chapter hold, full-tour mode, product entry, offline narration, and eight
responsive accessibility states. `evidence/narration-verification.json`
contains all spoken text, durations and voice identity. Audio decoding and
non-silent volume are verified; subjective voice quality was not listener-rated.

Verification reuses the existing CompanySite `puppeteer-core` and `axe-core`
dependencies and installed Chrome/Edge. It blocks external requests during
HTTP tests and never submits forms or sends emails.

## Evidence and boundaries

`evidence/browser-verification.json`, `evidence/video-verification.json`,
screenshots and `evidence/source-receipt.json` record the inspected candidate.
`github-inventory.json` is **local review metadata, not a public site asset**.
Only `dist/` belongs in a publication package.

The ThinkPad was reached read-only on October 10. m3-server and both Pis were
offline on Tailscale; their hardware is attributed to October 8–9 evidence.
The historical Linux desktop is an alternate installation in the server's
physical chassis, not a second confirmed server. Private personal and employer
data are excluded; client entries use high-level descriptions only.

No deployment, commit, push, investment contract or hardware purchase occurred.
The $1,300/$350/$200/$150 allocation is an assistant-proposed planning envelope,
not an approved quote. Investment structure, final hardware quote, permitted
investor audience and publication approval remain owner decisions.

Six real application recordings and one sample-report walkthrough now supplement
the explainers. Remaining backend/licensed workflows need isolated capture environments.
Reconnect the offline machines before refreshing current-state claims.
See `../PENDING_MANUAL.md` item `INVESTOR-2026-10-10`.

## Exact next action

Michael reviews `dist/index.html`, confirms the intended investor audience and
funding structure, and approves any publication. The execution owner can then
refresh reachable hardware evidence, obtain a specific compatible quote and
publish only the reviewed `dist/` package to the approved destination. A Sites
account is available but had no existing Sites; the current roadmap is hosted
at m3mm.net, so no existing control site was overwritten or claimed as inspected.

Portable review package: `m3mm-investor-preview.zip` (includes all narration and videos). Extract it and
open `index.html`; all videos are included. Only approved static output is in
the archive. The local HTTP test server is stopped after verification.

Cockpit Work Log draft: “Prepared M3MM $2,000 investor showcase: 43 portfolio
explainers, reconciled 45-repo metadata inventory and dated hardware evidence;
12 accessibility checks plus browser/offline playback passed. Local review
candidate only; investor terms, final quote and publication remain gated.”
This text is provided for the existing Work Log; no browser localStorage write
is claimed.

## Actual product demonstrations — October 10 follow-up

The **Real clicks. Real workflows.** section launches a seven-recording demo
playlist: CampaignForge, M3MM headquarters, website services, SiteGuide,
SouthernVN Adaptive, Aries V2 and Teardown. These replace matching presenter
explainers. CampaignForge uses bundled fictional brands and existing deterministic
generation, then edits a headline, reviews and exports a PNG. SouthernVN shows
written practice only, never synthetic lesson audio. Aries V2 runs the existing
3D concept scene, not completed construction. Teardown shows its existing sample
report, not a new scan or CLI execution.

Each recording has embedded synthetic narration, visible cursor/clicks, English
captions, seekable steps, synchronized text, rate/volume and optional More detail
disclosures. Opening a detail pauses playback. The investor pitch and remaining
overview entries retain their previous controls.

Capture sources are existing allowlisted builds, served read-only on temporary
loopback ports. Fresh browser contexts contain sample data. Provider, payment and
off-origin requests, service workers and WebSockets are blocked. The cursor
overlay is recording annotation; product source is unchanged. No live browser
sessions, private databases or credentials are used.

Reproduce: `npm run demos:audio`, `npm run demos:record`, `npm run build`.
Requires existing CampaignForge Playwright, Chrome/ffmpeg, allowlisted product
builds and `.video-work/teardown-report/index.html`, a read-only copy of the
ThinkPad's `/home/m3mm/projects/Teardown/docs/sample-report.html`. The source
sample is not in the ZIP. To recapture a subset: `node record-demos.mjs siteguide`.

Files: demo-runtime.mjs, demo-scripts.json, render-demo-audio.ps1, record-demos.mjs,
demo-manifest.json and verify-demos.mjs. Integration changes: build.mjs,
presenter.js, presenter.css, presentation.mjs, render-narration.ps1, serve.mjs,
package.json and the existing verification scripts.

Verify with `npm start`, then `npm run verify:http`. This follow-up tests HTTP
only; it does not refresh/control the blocked file-protocol browser tab.
`evidence/actual-demos/` contains per-step screenshots, source/output hashes,
media metadata, CampaignForge's actual PNG export and player checks. Automated
checks do not replace Michael's listening/pacing review.

Remaining coverage: AIMA needs its answering/retrieval service; SiteBot and
QuoteMate need isolated provider-backed flows; LeadLeak and CockpitCloud need
isolated auth/database fixtures; Cull needs a properly licensed capture instance.
No auth/license gate is bypassed. Shared libraries/infrastructure and parked
media entries remain explanations. Teardown CLI execution remains unrecorded.

Funding progress: funding.json is the owner-confirmed input. raisedUsd=null means unconfirmed, not $0. Set the received amount when confirmed, then rebuild and repackage. Bars appear in the hero and funding section; this is a static reviewed figure, not a live payment feed.
