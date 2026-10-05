# Aries Adobe showcase — local draft, 2026-09-27

Owner: ASTRA MEDIUM. Goal: replace the narrow website presentation and prepare a TikTok ad creative for M3MM custom website services.

## Deliverables

- `aries-tiktok-draft.mp4`: 1080x1920, 30fps, 18 seconds, H.264/AAC, 9,271,158 bytes.
- `aries-website-showcase.mp4`: 1920x1080, 30fps, 18 seconds, H.264/AAC.
- `aries-showcase.aep`: actual Adobe After Effects 26.3 project with editable titles, source footage and audio.
- `build.jsx`, then `soundtrack.py` and `refine.jsx`: creation recipe. Run build in an empty AE project; scripts are one-shot authoring scripts, not an idempotent fleet utility. Repeated refinement imports duplicate music.
- `original-instrumental.wav`: procedural instrumental generated from AI-authored Python; no external samples, voice cloning, TTS or music recording. Imported and mixed by After Effects.
- Logs and sampled PNGs document production. PNGs without `final` in their names include superseded QA renders.

Actual website source: `../../public/videos/aries-scroll-v2.mp4`, preserved unchanged. AI authored the creative, animation scripts and synthesized music. No Firefly generation was performed. No C2PA/Content Credentials signature or Adobe approval is claimed. Source website screenshots retain their existing content and claims; those claims have not been independently substantiated for paid advertising.

The wide export was remuxed without re-encoding for fast-start playback to `../../public/videos/aries-showcase-adobe.mp4`. Its WebP poster was extracted from the actual Adobe render. Aries frontmatter and the case-study video's poster selection reference these local assets. The separate larger-still viewer retains its original actual-site still.

## Verification

- Adobe render logs confirm both compositions finished, 540 frames each.
- Final sampled wide/vertical frames inspected: main titles and disclosure readable; full original footage retained after correcting cropped badges. The source has its own animated phone framing; it was not rebuilt as a new site capture.
- ffprobe confirms dimensions, codecs, frame rate and 18-second duration. TikTok draft bitrate 4,120,514 bps; audio peak measured -12.5 dBFS, no clipping. Audio listening review remains for Michael.
- `npm run build`: exit 0; all 15 static pages built, shipped-placeholder check clean.
- `git diff --check`: passed before documentation closeout; rechecked on completion.
- Public destination `https://m3mm.net/websites` follows redirect to HTTP 200. This is availability evidence, not a complete landing-page policy audit or live conversion test.
- No unit tests added for media/reference edits. No full browser viewport QA or actual TikTok placement preview performed.

## Policy basis and submission gate

Checked 2026-09-27:

- [TikTok misleading/false content policy](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-misleading-and-false-content?lang=en): disclose generated/significantly edited content, substantiate claims and keep the landing page consistent with the ad.
- [TikTok ad disclaimers](https://ads.us.tiktok.com/resources/help/article/about-ad-disclaimers-in-tiktok-ads-manager?lang=en): AI/synthetic media disclosure; use the available Ads Manager setting as well as the embedded audio disclosure.
- [In-feed specifications](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads): vertical minimum 540x960, maximum 500MB, minimum 516kbps. Export passes these numeric checks. Safe zones depend on placement and caption; confirm the selected placement preview before spending.
- [Adobe Content Credentials](https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/content-credentials-overview.html): provenance metadata is distinct from TikTok ad approval. This export is not Firefly-certified.

Caption draft: “Custom websites for businesses with real work to show. Explore the Aries Outdoor Living website showcase and plan your next build with M3MM. AI-generated instrumental soundtrack.”

Destination: `https://m3mm.net/websites/`. Suggested native CTA: Learn more.

Michael must confirm paid-ad usage rights for the client branding/imagery and the visible existing claims (rating, project totals, licensing, etc.), check the actual ad preview, set disclosure and authorize spend/submission. These gates are recorded in both PENDING_MANUAL files. No TikTok approval, submission, publication, account action, commit, push or website deployment occurred.

## Files touched

CompanySite: this marketing directory, `public/videos/aries-showcase-adobe.mp4`, `public/videos/aries-showcase-adobe.webp`, `src/content/caseStudies/aries.md`, `src/components/CaseStudy.astro`, `TODO.md`, and an appended entry in `PENDING_MANUAL.md` (pre-existing edits preserved).

Fleet root: `SESSION_GOAL.md` (other owners preserved), appended gate in `PENDING_MANUAL.md`.

Proposed next durable update after approval: record the chosen final creative, paid-use evidence, actual placement/disclosure check and TikTok's review result here; integrate this scoped media change through the existing CompanySite release owner.
