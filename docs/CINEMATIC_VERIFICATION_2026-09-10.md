# Cinematic application verification — September 10, 2026

Local CompanySite branch: `codex/companysite-todo-2026-09-09`; implementation
built on `6459585`. No push, production deployment or outbound submission.

## Structural change summary

- Replaced the fixed next-launch spotlight with a source-driven 21-build explorer.
- Selection coordinates project visual, title, description, state and detail jump with short motion.
- Retained the complete grouped roadmap, filters, native disclosures and follow form.
- Expanded existing case-study media into larger stages with editorial explanations below.
- Added native still viewers with Escape, close, focus return and keyboard containment.
- Made video playback explicit; it pauses offscreen, on document hiding and when a viewer opens.
- Hid the floating review shortcut while interactive proof/stage areas are visible.
- Reused an uncropped Aries walkthrough frame; preserved original logo, source data, pricing and all 15 routes.
- Saved reference observations, applied outcomes and limits in existing fleet guidance.

Audit and rationale: [cinematic application](CINEMATIC_APPLICATION_2026-09-09.md).

## Diff summary by file

| File | Change |
| --- | --- |
| src/components/RoadmapStage.astro | New isolated source-driven explorer, native chooser, desktop roving index, short transitions and static fallback |
| src/pages/roadmap.astro | Two-column intro/counts and explorer replace fixed spotlight; complete board retained |
| src/components/CaseStudy.astro | Large media/editorial structure, native still dialogs, manual video and pause behavior |
| src/components/Proof.astro | Marks proof as an interactive area for floating shortcut suppression |
| src/layouts/Layout.astro | Suppresses floating review over marked areas; synchronizes hidden link focus state |
| public/videos/aries-walkthrough-still.webp | Existing walkthrough's 00:03 frame, uncropped WebP |
| scripts/check-performance-ui.mjs | Actual playback, stage state/keyboard/image/jump, modal focus/contrast, sticky collision and screenshot checks |
| docs/M3_DESIGN_SYSTEM.md | v2.2 component and motion contracts |
| docs/CINEMATIC_APPLICATION_2026-09-09.md | Reference scope, findings/evidence/fixes/priorities and design critique |
| docs/CINEMATIC_VERIFICATION_2026-09-10.md | This report and verbatim check output |
| DECISIONS.md | D-CS-013 implementation decision |
| TODO.md | Completed bounded pass and remaining owner/product work |
| PENDING_MANUAL.md | Native-video review availability and existing proof-media approval |
| COCKPIT_QUEUE.md | Appended draft local work-log entry; preserved prior history |

Fleet files updated separately: `AI_LEARNING_LOG.md`,
`docs/PRODUCT_DESIGN_STANDARD.md`, `chatgpt-handoffs/13-astra-design-reference.md`.
The root session date was refreshed while preserving the other task's studio goal;
that shared in-progress file is not included in this implementation commit.

## Actual visual and interaction review

Browser automation used local Chrome at 320, 375, 768 and 1440 pixels, with
outbound requests blocked and local /api calls stubbed. No live submission was tested.
Home, Roadmap, Websites proof and Big7 viewer screenshots were actually inspected
at 375/1440. Aries viewer at 320 was inspected for the axe review below.

- Home: original white-backed logo, readable four-link mobile navigation, stacked
  copy/CTAs above orbital art; desktop has copy left and one focal galaxy right.
- Roadmap: mobile intro/counts lead to native chooser, text and contained portrait
  preview; desktop has intro/counts in two columns and copy/media explorer with
  a thin numbered index. Mobile chooser text can truncate the long option label;
  the selected project's full title and state remain directly below it.
- Websites: larger portrait walkthrough remains uncropped and shows native controls;
  desktop uses a broad media surface. Initial screenshots caught a transient
  Chromium control spinner; settled captures show the clean source frame.
- Viewer: title and Close fit at both widths; media is contained. The existing
  Big7 source is not high-resolution new photography, so enlargement reveals
  its original limitations and placeholder contact/claim details.

Actual motion checks compare canvas pixels when running/paused, verify preference
persistence, OS override, offscreen stop, fallback without canvas and no-JS content.
Stage checks cover next, released, testing and planned states, loaded source image,
Home/End navigation, and jumps after filtering. Video checks request playback,
verify time advances, then verify offscreen pause. Both native viewers open with
focus inside, close with Escape and return focus to their triggers.

Screenshots: ignored local `output/cinematic-qa/`, including home-375.png,
home-1440.png, roadmap-stage-375.png, roadmap-stage-1440.png,
websites-proof-375.png, websites-proof-1440.png, project-viewer-375.png,
project-viewer-1440.png and modal-axe-review.png. Additional page screenshots were
captured by the runner but are not all claimed as visually reviewed in this pass.

### Accessibility results and reviewed exception

Final base-page sweep passed all 60 route/width combinations, plus existing chat,
keyboard/skip/focus/no-JS checks. Open-dialog axe runs had zero violations. At 320px,
axe additionally returned a color-contrast **incomplete** for each modal heading
(`elmPartiallyObscuring`), not a zero-incomplete result. Direct screenshot review
and independent computed opaque colors yielded **17.06:1** contrast; geometry
checks verified the heading lies within the modal and does not overlap Close.
Only that exact heading/finding is accepted by the runner; other incompletes fail.
This is a documented manual/geometry review, not a claim of blanket WCAG certification.

### Initial failures fixed

The first axe sweep failed on three narrow roadmap widths because the index
clipped; native mobile selection resolved this. The first pointer interaction run
failed because the floating review link intercepted the still-viewer button;
interactive-area suppression resolved it. The next run flagged modal contrast as
incomplete; the explicit solid surface and narrow independent review above resolve
its verification disposition. Original failing output is preserved below.

## Source invariants and asset provenance

`git diff --quiet -- src/config/roadmap.ts src/content/caseStudies functions
public/official-logo.png src/components/Services.astro` returned exit 0.
No routes were deleted. No dependencies added. Original-logo tests passed.

- `public/official-logo.png`: `27c7c0c1a8c069e4ea38c87a41c7a6d1523d00ebbde4c5e9eb6637372ec24e97` (804005 bytes)
- `public/videos/aries-scroll-v2.mp4`: `0f42c469c7cb916dc956075ea299b251b70b2825fad5dcfc831fb853adc8ad2c` (1334237 bytes)
- `public/videos/aries-walkthrough-still.webp`: `8f84e7d0e55fd2384af7edb796dda6daa034fddf10ecb5a225b7e846bb9acc67` (27846 bytes)

The WebP was extracted from the existing project video using an uncropped single
frame (`ffmpeg -ss 3 -i public/videos/aries-scroll-v2.mp4 -frames:v 1 -c:v libwebp
-quality 85 public/videos/aries-walkthrough-still.webp`). This was project asset
preparation, not a tutorial transcript/analysis pipeline. The source video stayed unchanged.

## Not done / needs Michael

- Review/replace existing proof media before publication: Big7's embedded `(555)`
  phone and license line, Aries' embedded ratings/project counts. No new claims
  were written and these old embedded statements were not independently verified.
- Full tutorial narration/audiovisual review: only sampled on-screen frames were
  reviewed. Gemini upload needed sign-in, logged without attempting login/upload.
- No Safari, physical-device, screen-reader, GPU/battery, conversion or load-test claim.
- No live API, payment, email delivery, analytics ingestion or production check.
- Aries V2, Resume-specific interaction and the broader product rollout remain separate work.
- No push/deploy; Michael owns publication. Cockpit entry remains a draft.

## Verification output, verbatim

Outputs below are copied from actual final logs; timing and formatting are retained.
All six final commands completed successfully. Vitest: 520 passed, two existing skips.
Astro checked 45 files with zero errors/warnings/hints. Root doc verification also
passed 11 checks with zero warnings/failures; it does not establish client/product behavior.

### npm run build

```text

> m3-companysite@0.1.0 build
> npm run resume:pdf && astro build && npm run verify:dist


> m3-companysite@0.1.0 resume:pdf
> node scripts/generate-resume-pdf.mjs

resume.pdf: vendored copy (121174 bytes) → public/ + output/pdf/
00:09:02 [content] Syncing content
00:09:02 [content] Synced content
00:09:02 [types] Generated 405ms
00:09:02 [build] output: "static"
00:09:02 [build] mode: "static"
00:09:02 [build] directory: C:\Users\Michael\Documents\GitHub\CompanySite\dist\
00:09:02 [build] Collecting build info...
00:09:02 [build] ✓ Completed in 436ms.
00:09:02 [build] Building static entrypoints...
00:09:03 [vite] ✓ built in 664ms
00:09:03 [vite] ✓ built in 67ms
00:09:03 [build] Rearranging server assets...

 generating static routes 
00:09:03   ├─ /accessibility/index.html (+13ms) 
00:09:03   ├─ /audit/index.html (+8ms) 
00:09:03   ├─ /compare/website-options/index.html (+5ms) 
00:09:03   ├─ /for/construction/index.html (+6ms) 
00:09:03   ├─ /for/home-services/index.html (+5ms) 
00:09:03   ├─ /for/outdoor-living/index.html (+8ms) 
00:09:03   ├─ /policies/index.html (+4ms) 
00:09:03   ├─ /resume/index.html (+5ms) 
00:09:03   ├─ /roadmap/thanks/index.html (+5ms) 
00:09:03   ├─ /roadmap/index.html (+14ms) 
00:09:03   ├─ /start/thanks/index.html (+4ms) 
00:09:03   ├─ /start/index.html (+6ms) 
00:09:03   ├─ /thanks/index.html (+4ms) 
00:09:03   ├─ /websites/index.html (+16ms) 
00:09:03   ├─ /index.html (+6ms) 
00:09:03 ✓ Completed in 179ms.

 generating optimized images 
00:09:03   ▶ /_astro/big7-live-site.DTqpSfQ2_wQunp.webp (reused cache entry) (+1ms) (1/3)
00:09:03   ▶ /_astro/big7-live-site.DTqpSfQ2_AjPwp.webp (reused cache entry) (+1ms) (2/3)
00:09:03   ▶ /_astro/big7-live-site.DTqpSfQ2_Zd5aa8.webp (reused cache entry) (+1ms) (3/3)
00:09:03 ✓ Completed in 4ms.

00:09:03 [build] ✓ Completed in 957ms.
00:09:03 [build] 15 page(s) built in 1.41s
00:09:03 [build] Complete!

> m3-companysite@0.1.0 verify:dist
> node scripts/check-shipped-placeholders.mjs dist functions

check-shipped-placeholders: clean — no placeholders in dist/, functions/
```

### npm test

```text

> m3-companysite@0.1.0 test
> vitest run


 RUN  v4.1.10 C:/Users/Michael/Documents/GitHub/CompanySite

 ✓ tests/build/shipped-source-hygiene.test.ts (4 tests) 65ms
 ✓ tests/build/canonical.test.ts (12 tests) 35ms
 ✓ tests/build/outbound-utm.test.ts (10 tests) 35ms
 ✓ tests/build/resume-pdf.test.ts (8 tests) 96ms
 ✓ tests/build/reserved-intent-namespaces.test.ts (26 tests) 16ms
 ✓ tests/build/section-anchor-invariants.test.ts (4 tests) 10ms
 ✓ tests/build/site-structure.test.ts (3 tests) 16ms
 ✓ tests/functions/rate.test.ts (7 tests) 10ms
 ✓ tests/build/trade-pages.test.ts (12 tests) 9ms
 ✓ tests/build/intake-cta.test.ts (6 tests) 10ms
 ✓ tests/build/shipped-placeholders.test.ts (42 tests) 244ms
 ✓ tests/functions/api-middleware.test.ts (7 tests) 36ms
 ✓ tests/functions/cockpit-sink.test.ts (16 tests) 33ms
 ✓ tests/functions/n8n-sink.test.ts (8 tests) 35ms
 ✓ tests/build/hq-home.test.ts (6 tests) 9ms
 ✓ tests/build/start-checkout.test.ts (52 tests | 2 skipped) 17ms
 ✓ tests/functions/referral.test.ts (18 tests) 9ms
 ✓ tests/lib/prefill.test.ts (23 tests) 10ms
stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > a roadmap subscriber lands on the roadmap receipt, not the review one
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789013771094}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > every other intent still lands on the default thank-you page
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:free-review","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789013771097}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > an unknown intent falls back to the default rather than 404ing the visitor
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:not-a-real-flow","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789013771098}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.40","ts":1789013771099}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"https://evil.example/steal","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.41","ts":1789013771101}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"//evil.example","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.42","ts":1789013771102}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"/../../etc/passwd","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.43","ts":1789013771102}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect still carries the security headers and is never cached
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789013771105}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > JSON callers are unchanged — they still parse an ok payload
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.21","ts":1789013771106}

 ✓ tests/functions/lead-form-redirect.test.ts (8 tests) 43ms
 ✓ tests/functions/validate.test.ts (18 tests) 9ms
 ✓ tests/functions/cors.test.ts (35 tests) 19ms
 ✓ tests/build/roadmap-signup.test.ts (8 tests) 9ms
 ✓ tests/functions/validate.supplemental.test.ts (19 tests) 9ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771174}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771177}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771179}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771180}

stdout | tests/functions/security-headers.test.ts > /api/track ships the headers on every response shape > 204 beacon accept
{"event":"cta","cta":"hero-cta","ip":"unknown","ua":"unknown","ts":1789013771180}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771181}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771186}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers null with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789013771186}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers [] with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789013771187}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771189}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers "a string" with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789013771189}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771190}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers 123 with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789013771190}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771190}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers true with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789013771190}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771191}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771192}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771192}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771192}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771193}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771193}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771193}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771193}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771193}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771194}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771194}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771194}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771194}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771194}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771194}

 ✓ tests/functions/security-headers.test.ts (26 tests) 45ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771195}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771195}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771195}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771196}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771196}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771197}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771197}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771197}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771199}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771199}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771199}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771199}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771200}

 ✓ tests/build/attribution-loop.test.ts (17 tests) 12ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771200}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771200}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771200}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771200}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771200}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771201}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771202}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771202}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771203}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771203}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771204}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771205}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771206}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771207}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771208}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771209}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771209}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771209}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789013771209}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789013771210}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789013771212}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789013771212}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789013771212}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789013771213}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789013771213}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.10","ts":1789013771213}

 ✓ tests/functions/rate-isolation.test.ts (5 tests) 66ms
 ✓ tests/build/intent-preserving-fallback.test.ts (12 tests) 6ms
 ✓ tests/functions/track-parse.test.ts (14 tests) 8ms
 ✓ tests/functions/chat.test.ts (25 tests) 522ms
     ✓ OPTIONS defers to the shared CORS preflight  471ms
 ✓ tests/lib/track.test.ts (9 tests) 8ms
 ✓ tests/build/teardown-offer.test.ts (6 tests) 6ms
 ✓ tests/build/official-logo.test.ts (1 test) 5ms
 ✓ tests/build/referral-program.test.ts (13 tests) 6ms
 ✓ tests/build/cta-intent-coverage.test.ts (6 tests) 4ms
 ✓ tests/build/faq.test.ts (6 tests) 5ms
 ✓ tests/build/muted-text-contrast.test.ts (5 tests) 5ms
 ✓ tests/build/intake-submit-intent-fallback.test.ts (3 tests) 4ms
 ✓ tests/build/casestudy-outbound-utm.test.ts (7 tests) 4ms
 ✓ tests/build/thanks-urgent-mailto.test.ts (5 tests) 4ms
 ✓ tests/build/two-door.test.ts (4 tests) 3ms
 ✓ tests/build/guarantee-badge.test.ts (3 tests) 3ms
 ✓ tests/build/content-attribution.test.ts (3 tests) 3ms

 Test Files  42 passed (42)
      Tests  520 passed | 2 skipped (522)
   Start at  00:16:10
   Duration  1.24s (transform 6.19s, setup 0ms, import 8.07s, tests 1.50s, environment 5ms)

```

### npm run test:a11y

```text

> m3-companysite@0.1.0 test:a11y
> node scripts/axe-home.mjs

PASS  / @ narrow (320px) — 39 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ narrow (320px) — 47 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ narrow (320px) — 50 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ narrow (320px) — 40 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ narrow (320px) — 37 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ narrow (320px) — 38 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ narrow (320px) — 40 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ narrow (320px) — 38 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ narrow (320px) — 38 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ narrow (320px) — 37 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  / @ tablet (768px) — 39 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ tablet (768px) — 47 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ tablet (768px) — 50 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ tablet (768px) — 40 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ tablet (768px) — 37 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ tablet (768px) — 38 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ tablet (768px) — 40 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ tablet (768px) — 38 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ tablet (768px) — 38 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ tablet (768px) — 37 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  / @ mobile (375px) — 39 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ mobile (375px) — 47 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ mobile (375px) — 50 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ mobile (375px) — 40 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ mobile (375px) — 37 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ mobile (375px) — 38 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ mobile (375px) — 40 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ mobile (375px) — 38 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ mobile (375px) — 38 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ mobile (375px) — 37 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  / @ desktop (1440px) — 39 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ desktop (1440px) — 48 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ desktop (1440px) — 50 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ desktop (1440px) — 40 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ desktop (1440px) — 37 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ desktop (1440px) — 38 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ desktop (1440px) — 40 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ desktop (1440px) — 38 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ desktop (1440px) — 38 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ desktop (1440px) — 37 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS keyboard skip, focus outline, reduced motion, and mobile navigation without JavaScript

axe-core: clean on 60 page × viewport combinations.
```

### npm run audit:canonicals

```text

> m3-companysite@0.1.0 audit:canonicals
> node scripts/audit-canonicals.mjs

ok  dist\accessibility\index.html  →  https://m3mm.net/accessibility
ok  dist\audit\index.html  →  https://m3mm.net/audit
ok  dist\compare\website-options\index.html  →  https://m3mm.net/compare/website-options
ok  dist\for\construction\index.html  →  https://m3mm.net/for/construction
ok  dist\for\home-services\index.html  →  https://m3mm.net/for/home-services
ok  dist\for\outdoor-living\index.html  →  https://m3mm.net/for/outdoor-living
ok  dist\index.html  →  https://m3mm.net/
ok  dist\policies\index.html  →  https://m3mm.net/policies
ok  dist\resume\index.html  →  https://m3mm.net/resume
ok  dist\roadmap\index.html  →  https://m3mm.net/roadmap
ok  dist\roadmap\thanks\index.html  →  https://m3mm.net/roadmap/thanks
ok  dist\start\index.html  →  https://m3mm.net/start
ok  dist\start\thanks\index.html  →  https://m3mm.net/start/thanks
ok  dist\thanks\index.html  →  https://m3mm.net/thanks
ok  dist\websites\index.html  →  https://m3mm.net/websites

audit-canonicals: 15 page(s) OK.
```

### npx astro check

```text
00:07:00 [content] Syncing content
00:07:00 [content] Synced content
00:07:00 [types] Generated 487ms
00:07:00 [check] Getting diagnostics for Astro files in C:\Users\Michael\Documents\GitHub\CompanySite...
Result (45 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### M3_QA_OUTPUT='../output/cinematic-qa/' node scripts/check-performance-ui.mjs

```text
REVIEW 320px aries: native-modal heading overlap finding; verified 17.06:1 opaque contrast, no close-button overlap, contained title
REVIEW 320px big7: native-modal heading overlap finding; verified 17.06:1 opaque contrast, no close-button overlap, contained title
PASS 320px: roadmap stage source state, keyboard navigation, image, filtered jump; project viewer Escape/focus; video manual playback
PASS 320px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS 375px: roadmap stage source state, keyboard navigation, image, filtered jump; project viewer Escape/focus; video manual playback
PASS 375px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS 768px: roadmap stage source state, keyboard navigation, image, filtered jump; project viewer Escape/focus; video manual playback
PASS 768px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS 1440px: roadmap stage source state, keyboard navigation, image, filtered jump; project viewer Escape/focus; video manual playback
PASS 1440px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS unavailable canvas: static SVG remains visible
```

## Earlier failing runs, verbatim

### a11y-initial.log

```text

> m3-companysite@0.1.0 test:a11y
> node scripts/axe-home.mjs

PASS  / @ narrow (320px) — 39 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
FAIL  /roadmap/ @ narrow (320px)
  incomplete color-contrast: Elements must meet minimum color contrast ratio thresholds
    button[data-stage-index="7"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="8"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="9"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="10"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="11"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="12"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="13"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="14"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="15"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="16"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="17"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="18"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="19"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="20"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ narrow (320px) — 50 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ narrow (320px) — 40 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ narrow (320px) — 37 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ narrow (320px) — 38 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ narrow (320px) — 40 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ narrow (320px) — 38 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ narrow (320px) — 38 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ narrow (320px) — 37 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  / @ tablet (768px) — 39 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
FAIL  /roadmap/ @ tablet (768px)
  incomplete color-contrast: Elements must meet minimum color contrast ratio thresholds
    button[data-stage-index="16"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="17"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="18"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="19"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="20"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ tablet (768px) — 50 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ tablet (768px) — 40 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ tablet (768px) — 37 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ tablet (768px) — 38 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ tablet (768px) — 40 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ tablet (768px) — 38 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ tablet (768px) — 38 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ tablet (768px) — 37 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  / @ mobile (375px) — 39 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
FAIL  /roadmap/ @ mobile (375px)
  incomplete color-contrast: Elements must meet minimum color contrast ratio thresholds
    button[data-stage-index="8"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="9"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="10"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="11"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="12"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="13"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="14"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="15"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="16"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="17"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="18"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="19"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
    button[data-stage-index="20"] > span[aria-hidden="true"][data-astro-cid-tip5pq5e=""]: elmPartiallyObscured
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ mobile (375px) — 50 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ mobile (375px) — 40 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ mobile (375px) — 37 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ mobile (375px) — 38 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ mobile (375px) — 40 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ mobile (375px) — 38 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ mobile (375px) — 38 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ mobile (375px) — 37 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  / @ desktop (1440px) — 39 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ desktop (1440px) — 48 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /websites/ @ desktop (1440px) — 50 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /compare/website-options/ @ desktop (1440px) — 40 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /audit/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /start/thanks/ @ desktop (1440px) — 37 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /thanks/ @ desktop (1440px) — 38 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /resume/ @ desktop (1440px) — 40 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /policies/ @ desktop (1440px) — 38 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /accessibility/ @ desktop (1440px) — 38 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/thanks/ @ desktop (1440px) — 37 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/construction/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/home-services/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /for/outdoor-living/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS keyboard skip, focus outline, reduced motion, and mobile navigation without JavaScript

axe-core: 3 failing combination(s).
```

### interactions-initial.log

```text
node:internal/modules/run_main:123
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

false !== true

    at file:///C:/Users/Michael/Documents/GitHub/CompanySite/scripts/check-performance-ui.mjs:111:14 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v22.23.1
```

### interactions-modal-initial.log

```text
node:internal/modules/run_main:123
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: Open viewer axe checks
+ actual - expected

  {
+   incomplete: [
+     'color-contrast'
+   ],
-   incomplete: [],
    violations: []
  }

    at file:///C:/Users/Michael/Documents/GitHub/CompanySite/scripts/check-performance-ui.mjs:117:14 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: { violations: [], incomplete: [ 'color-contrast' ] },
  expected: { violations: [], incomplete: [] },
  operator: 'deepStrictEqual',
  diff: 'simple'
}

Node.js v22.23.1
```

