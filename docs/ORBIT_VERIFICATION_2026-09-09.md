# Orbit and roadmap verification — September 9, 2026

Local CompanySite refinement on `codex/companysite-todo-2026-09-09`.
No push, deployment, external submission or production API call was performed.
The initial redesign's evidence remains in PERFORMANCE_VERIFICATION_2026-09-09.md.

## What changed and why

- A next-launch spotlight and animated release path make the roadmap's priority visible.
- A sticky desktop release directory and wrapping mobile jumps improve navigation.
- Native build disclosures reduce scanning effort; released/next start open.
- Status filters animate briefly, announce counts and honor motion preferences.
- The homepage and sales artwork now use a flowing particle field with static SVG fallback.
- Wider shared containers, quieter labels, softer surfaces and a two-column department directory improve rhythm.
- All 15 routes and 21 roadmap entries remain; prices, release data, form endpoints and original logo bytes are unchanged.

## Diff by file

| File | Change |
| --- | --- |
| src/pages/roadmap.astro | Next-launch spotlight; sidebar + grouped board; responsive spacing |
| src/components/ReleasePath.astro | Decorative SVG release flow, stopped offscreen or by motion preference |
| src/components/RoadmapTimeline.astro | Native expandable builds with aligned date/status/title and source descriptions |
| src/components/RoadmapFilters.astro | Short filter transitions, cancellation and reduced-motion bypass |
| src/components/KineticTrack.astro | Static orbital SVG and canvas enhancement surface |
| src/lib/orbitalField.ts | Deterministic particle renderer with mobile density/DPR/frame caps and pause/visibility handling |
| src/lib/motion.ts | Connect shared preference and intersection state to canvas renderers |
| src/pages/index.astro | Two-column, quieter department directory |
| src/components/Hero.astro | Simplified evidence panel boundary |
| src/styles/global.css | Wider shared container, quiet labels, motion-control/button treatment |
| tailwind.config.mjs | 8px controls, 16px panels, refined hero size; unchanged palette |
| scripts/check-performance-ui.mjs | Pixel-level motion checks, native disclosure keyboard checks, fallback and filter tests |
| tests/build/cta-intent-coverage.test.ts | Classify the new motion preference control as navigation/UI |
| docs/M3_DESIGN_SYSTEM.md | Version 2.1 component/motion/layout contracts |
| docs/ORBIT_DESIGN_2026-09-09.md | Prioritized findings and design plan |
| DECISIONS.md | D-CS-012 owner preference and bounded implementation |
| TODO.md | Completed refinement and parked product rollout |
| COCKPIT_QUEUE.md | Appended a draft Work Log entry; preserved prior entries |
| docs/ORBIT_VERIFICATION_2026-09-09.md | This result and real command logs |

## Checks actually performed

Build/placeholder fence passed for 15 pages. Vitest: 42 files passed, 518 tests
passed, 2 existing skips. Canonicals: 15 pages. Astro diagnostics: 44 files,
0 errors/warnings/hints. Axe: 60 page × viewport combinations with no violations,
including open chat; keyboard skip, visible focus, reduced motion and no-JS
mobile navigation checked. Browser widths: 320, 375, 768, 1440.

Interaction runner verified changing canvas pixels while enabled and identical
pixels while paused; pause survives reload, OS reduction overrides enabled motion,
offscreen artwork stops, SVG survives unavailable canvas and no JS. It also
verified the roadmap release-path animation/pause, keyboard open/close, all five
filter counts, quarter jumps resetting filters and no filter animation under
reduced motion. All passed at all four widths.

Visual inspection: home and roadmap hero at 375/1440; roadmap board and expanded
Testing filter at 375/1440 capture (375 Testing inspected); websites hero at
375/1440; policies at 1440; receipt at 375. Screenshots show readable text on solid
surfaces, a separate bounded visual, desktop date columns, stacked mobile cards,
and wrapping filter/navigation controls. Automated overflow checks cover every
route at all four widths. Other captured page types were not individually
visually reviewed in this pass.

Local captures are in `output/orbit-qa/`, including home-{375,1440}.png,
roadmap-{375,1440}.png, roadmap-board-{375,1440}.png and
roadmap-filter-{375,1440}.png. Full-page captures also exist for home, roadmap,
and websites. The general accessibility runner writes output/design-qa/axe-home.json.

## Not done / needs Michael

- Deployment/publication is pending Michael; this refinement is local only.
- The broader product standard is recorded in ../docs/PRODUCT_DESIGN_STANDARD.md.
  Other product UIs, including Aries V2, were not redesigned in this pass; Aries V1 is untouched.
- Real-device Safari/iOS, low-end GPU battery/frame-time measurements, screen-reader
  speech output and actual background-tab lifecycle were not exercised. Canvas
  visibility-change handling was inspected in code; offscreen stopping was tested.
- No outbound form/email/payment/analytics integration was exercised. Existing
  payment, release and client-photo gates remain in PENDING_MANUAL.md.
- No new claims, dates, proof or release progress were invented.
- Cockpit Work Log text is drafted locally; Michael performs its browser write.

## Verbatim command output

The following is the real redirected output from the completed commands. Only
terminal ANSI control sequences are removed if present; text and line-ending
whitespace are preserved. Consequently, a whitespace-only diff check may flag
literal lines inside these log blocks.

### `npm run build` — exit 0

```text

> m3-companysite@0.1.0 build
> npm run resume:pdf && astro build && npm run verify:dist


> m3-companysite@0.1.0 resume:pdf
> node scripts/generate-resume-pdf.mjs

resume.pdf: vendored copy (121174 bytes) → public/ + output/pdf/
23:35:54 [content] Syncing content
23:35:54 [content] Synced content
23:35:54 [types] Generated 475ms
23:35:54 [build] output: "static"
23:35:54 [build] mode: "static"
23:35:54 [build] directory: C:\Users\Michael\Documents\GitHub\CompanySite\dist\
23:35:54 [build] Collecting build info...
23:35:54 [build] ✓ Completed in 507ms.
23:35:54 [build] Building static entrypoints...
23:35:54 [vite] ✓ built in 659ms
23:35:54 [vite] ✓ built in 66ms
23:35:54 [build] Rearranging server assets...

 generating static routes 
23:35:54   ├─ /accessibility/index.html (+14ms) 
23:35:54   ├─ /audit/index.html (+9ms) 
23:35:54   ├─ /compare/website-options/index.html (+6ms) 
23:35:54   ├─ /for/construction/index.html (+7ms) 
23:35:54   ├─ /for/home-services/index.html (+5ms) 
23:35:54   ├─ /for/outdoor-living/index.html (+4ms) 
23:35:54   ├─ /policies/index.html (+5ms) 
23:35:54   ├─ /resume/index.html (+6ms) 
23:35:54   ├─ /roadmap/thanks/index.html (+6ms) 
23:35:54   ├─ /roadmap/index.html (+10ms) 
23:35:54   ├─ /start/thanks/index.html (+6ms) 
23:35:54   ├─ /start/index.html (+5ms) 
23:35:54   ├─ /thanks/index.html (+5ms) 
23:35:54   ├─ /websites/index.html (+26ms) 
23:35:55   ├─ /index.html (+9ms) 
23:35:55 ✓ Completed in 198ms.

 generating optimized images 
23:35:55   ▶ /_astro/big7-live-site.DTqpSfQ2_AjPwp.webp (reused cache entry) (+2ms) (1/3)
23:35:55   ▶ /_astro/big7-live-site.DTqpSfQ2_Zd5aa8.webp (reused cache entry) (+1ms) (2/3)
23:35:55   ▶ /_astro/big7-live-site.DTqpSfQ2_wQunp.webp (reused cache entry) (+1ms) (3/3)
23:35:55 ✓ Completed in 5ms.

23:35:55 [build] ✓ Completed in 978ms.
23:35:55 [build] 15 page(s) built in 1.50s
23:35:55 [build] Complete!

> m3-companysite@0.1.0 verify:dist
> node scripts/check-shipped-placeholders.mjs dist functions

check-shipped-placeholders: clean — no placeholders in dist/, functions/
```

### `npm test` — exit 0

```text

> m3-companysite@0.1.0 test
> vitest run


 RUN  v4.1.10 C:/Users/Michael/Documents/GitHub/CompanySite

 ✓ tests/build/outbound-utm.test.ts (10 tests) 45ms
 ✓ tests/build/shipped-source-hygiene.test.ts (4 tests) 87ms
 ✓ tests/build/resume-pdf.test.ts (8 tests) 174ms
 ✓ tests/build/section-anchor-invariants.test.ts (4 tests) 17ms
 ✓ tests/build/reserved-intent-namespaces.test.ts (24 tests) 24ms
 ✓ tests/build/canonical.test.ts (12 tests) 78ms
 ✓ tests/build/trade-pages.test.ts (12 tests) 9ms
 ✓ tests/build/site-structure.test.ts (3 tests) 27ms
 ✓ tests/functions/api-middleware.test.ts (7 tests) 41ms
 ✓ tests/functions/cockpit-sink.test.ts (16 tests) 41ms
 ✓ tests/build/shipped-placeholders.test.ts (42 tests) 447ms
 ✓ tests/build/hq-home.test.ts (6 tests) 14ms
 ✓ tests/functions/validate.test.ts (18 tests) 12ms
 ✓ tests/build/start-checkout.test.ts (52 tests | 2 skipped) 18ms
 ✓ tests/functions/referral.test.ts (18 tests) 11ms
 ✓ tests/functions/n8n-sink.test.ts (8 tests) 39ms
 ✓ tests/functions/rate.test.ts (7 tests) 10ms
stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > a roadmap subscriber lands on the roadmap receipt, not the review one
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789011382235}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > every other intent still lands on the default thank-you page
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:free-review","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789011382239}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > an unknown intent falls back to the default rather than 404ing the visitor
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:not-a-real-flow","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789011382242}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.40","ts":1789011382243}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"https://evil.example/steal","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.41","ts":1789011382245}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"//evil.example","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.42","ts":1789011382245}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"/../../etc/passwd","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.43","ts":1789011382246}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect still carries the security headers and is never cached
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789011382249}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > JSON callers are unchanged — they still parse an ok payload
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.21","ts":1789011382251}

 ✓ tests/functions/lead-form-redirect.test.ts (8 tests) 55ms
 ✓ tests/functions/cors.test.ts (35 tests) 19ms
 ✓ tests/build/intake-cta.test.ts (6 tests) 12ms
 ✓ tests/lib/prefill.test.ts (23 tests) 12ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382361}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382363}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382363}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382364}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382364}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382367}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382370}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382370}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382371}

 ✓ tests/build/attribution-loop.test.ts (17 tests) 9ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382372}

stdout | tests/functions/security-headers.test.ts > /api/track ships the headers on every response shape > 204 beacon accept
{"event":"cta","cta":"hero-cta","ip":"unknown","ua":"unknown","ts":1789011382375}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382372}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382373}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382373}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382373}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382373}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382373}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382374}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382374}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382374}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382374}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382374}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382374}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382375}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382375}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382375}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382375}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382375}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382376}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382376}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382377}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382377}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382377}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382379}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382379}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382379}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382379}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382380}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382380}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382380}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382380}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382380}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382380}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382381}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382381}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers null with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789011382381}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382381}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382381}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382381}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382381}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382382}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382382}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers [] with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789011382383}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382383}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382384}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382385}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382385}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382385}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers "a string" with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789011382385}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382385}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382385}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382386}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382386}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382386}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382386}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382386}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers 123 with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789011382387}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers true with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382387}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382388}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382389}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382390}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382390}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789011382390}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789011382390}

 ✓ tests/functions/security-headers.test.ts (26 tests) 47ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789011382392}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789011382392}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789011382393}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789011382393}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789011382393}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.10","ts":1789011382393}

 ✓ tests/functions/track-parse.test.ts (14 tests) 9ms
 ✓ tests/functions/rate-isolation.test.ts (5 tests) 58ms
 ✓ tests/functions/validate.supplemental.test.ts (19 tests) 8ms
 ✓ tests/build/teardown-offer.test.ts (6 tests) 6ms
 ✓ tests/build/official-logo.test.ts (1 test) 6ms
 ✓ tests/build/roadmap-signup.test.ts (8 tests) 9ms
 ✓ tests/build/guarantee-badge.test.ts (3 tests) 6ms
 ✓ tests/lib/track.test.ts (9 tests) 9ms
 ✓ tests/build/cta-intent-coverage.test.ts (6 tests) 6ms
 ✓ tests/build/two-door.test.ts (4 tests) 4ms
 ✓ tests/build/faq.test.ts (6 tests) 6ms
 ✓ tests/build/casestudy-outbound-utm.test.ts (7 tests) 5ms
 ✓ tests/build/muted-text-contrast.test.ts (5 tests) 8ms
 ✓ tests/build/referral-program.test.ts (13 tests) 8ms
 ✓ tests/build/intent-preserving-fallback.test.ts (12 tests) 7ms
 ✓ tests/build/intake-submit-intent-fallback.test.ts (3 tests) 5ms
 ✓ tests/build/thanks-urgent-mailto.test.ts (5 tests) 5ms
 ✓ tests/functions/chat.test.ts (25 tests) 814ms
     ✓ OPTIONS defers to the shared CORS preflight  767ms
 ✓ tests/build/content-attribution.test.ts (3 tests) 5ms

 Test Files  42 passed (42)
      Tests  518 passed | 2 skipped (520)
   Start at  23:36:21
   Duration  1.65s (transform 8.54s, setup 0ms, import 11.34s, tests 2.23s, environment 6ms)

```

### `npm run test:a11y` — exit 0

```text

> m3-companysite@0.1.0 test:a11y
> node scripts/axe-home.mjs

PASS  / @ narrow (320px) — 39 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ narrow (320px) — 46 rules passed, 0 violations
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
PASS  /roadmap/ @ tablet (768px) — 46 rules passed, 0 violations
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
PASS  /roadmap/ @ mobile (375px) — 46 rules passed, 0 violations
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
PASS  /roadmap/ @ desktop (1440px) — 46 rules passed, 0 violations
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

### `npm run audit:canonicals` — exit 0

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

### `npx astro check` — exit 0

```text
23:36:00 [content] Syncing content
23:36:00 [content] Synced content
23:36:00 [types] Generated 447ms
23:36:00 [check] Getting diagnostics for Astro files in C:\Users\Michael\Documents\GitHub\CompanySite...
Result (44 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### `node scripts/check-performance-ui.mjs` — exit 0

```text
PASS 320px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS 375px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS 768px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS 1440px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS
PASS unavailable canvas: static SVG remains visible
```

