# Performance redesign verification — 2026-09-09

Branch: `codex/companysite-todo-2026-09-09`; starting point `ab405ff`.
Local preview: http://127.0.0.1:4321. No deployment or new push.

## What changed and why

- Applied Michael's requested black/lime/blue direction through shared tokens,
  typography, controls, panels and navigation across all 15 routes.
- Replaced the retired page mark and social/favicon references with the exact
  supplied PNG, preserving its white background and full square aspect ratio.
- Built a lightweight dimensional SVG track sculpture for home and websites;
  added persistent pause, OS reduced-motion override and offscreen stop.
- Moved home release facts into a compact strip and made Website services a
  direct department choice. Released and Testing remain separate.
- Made global navigation consistent, added visible breadcrumbs, reorganized the
  footer and added sales section jumps. Mobile package action labels are visible.
- Added keyboard-accessible roadmap status filters, live result counts and
  quarter-jump reset. All 21 builds remain present without JavaScript.
- Kept reading content immediately visible; preserved all pages, prices, proof,
  form endpoints, receipt destinations and release states.

## Audit and design authority

`DESIGN_DIRECTION_2026-09-09.md` contains the plan and finding → evidence → fix →
priority list. `STRUCTURE_AUDIT_2026-09-09.md` preserves the earlier page map and
adds the new roadmap receipt. `M3_DESIGN_SYSTEM.md` v2 and D-CS-011 record the
latest owner direction; earlier single-accent restrictions are superseded.

## Visual review and limits

Viewed actual Chrome captures of home and roadmap at 375 and 1440, home at
320/768, websites at 375/1440, the comparison at 1440, and mobile departments,
intake and footer. The homepage presents its statement/actions before the
artwork on mobile; on desktop the sculpture sits beside it. Release facts
follow as a strip. Roadmap targets, statuses and blue/lime distinctions remain
readable. The sales CTA precedes its artwork on mobile. Footer links wrap in
two columns and the complete email address fits. No logo crop or filter.

Automated coverage visits all 15 routes at 320/375/768/1440, checks page and open
chat axe results, horizontal overflow, JavaScript errors, failed requests,
keyboard skip/focus, reduced motion, email-link hydration and no-JS navigation.
The separate interaction runner checks motion start/pause/persistence/OS override/
offscreen stop, keyboard filter counts, quarter reset, all-build no-JS fallback
and static no-JS artwork at all four widths. Screenshot artifacts are in
`output/design-qa/` and `output/performance-qa/` (local, ignored by Git).

This is Chrome desktop emulation, not a physical phone, Safari/Firefox or a
screen-reader certification. Not every screenshot was individually viewed.
No production forms, checkout, email delivery, external preview targets, live
analytics or Cloudflare deployment were exercised. Browser API requests are
intercepted; outbound traffic is blocked. Vitest uses fixture environments.
No new performance score or conversion result is claimed. The original logo
is 804,005 bytes, deliberately not recompressed or derived.

## Problems found during verification

The first unit pass failed five assertions tied to the retired logo, old
header-only anchors, and new navigation/motion tracking classifications. Tests
were updated to the real contract; source CTA names were disambiguated. The
first axe run had 26 incomplete combinations: decorative glyph assessment and
SVG terrain overlapping its caption. The glyph is now CSS decoration and the
artwork stays inside its view box; no selector exemption was added. One later
run overlapped rebuilding dist and failed the no-JS /start/thanks check.
That run was discarded and the stable final build was checked again.
First-pass output remains locally in `output/performance-qa/*first-pass.log`
and `a11y-interrupted-build.log` for inspection.

## Not done / needs Michael

- Review and choose when to publish. This redesign is local and unpushed.
- Existing Stripe/link, dependency remediation, real proof assets, client
  permissions, referral payout and live-delivery gates remain in
  `PENDING_MANUAL.md`; no claims or values were invented to close them.
- Existing roadmap update cadence/format is still Michael's decision.
- Copy the prepared Cockpit Work Log entry from `COCKPIT_QUEUE.md` into the real
  browser state. No localStorage write is claimed.
- Broader Aries V2/fleet work is outside this CompanySite redesign and remains
  in its existing handoffs.

## Diff by file

| File | Change |
| --- | --- |
| tailwind.config.mjs | Black/graphite, lime and blue roles; readable neutral text; stronger hero scale and shared radii. |
| src/styles/global.css | Visible content, shared breadcrumbs/motion control, intro/reading/receipt treatments, form labels and reduced motion. |
| src/layouts/Layout.astro | Shared visible breadcrumbs, motion bootstrap, original logo icons and square sharing metadata. |
| src/components/Header.astro | Consistent wrapping primary navigation, current-page state, exact logo and review action. |
| src/components/Footer.astro | Responsive directory, original logo, full email row and motion preference. |
| src/components/KineticTrack.astro | New decorative layered track artwork using only design tokens. |
| src/lib/motion.ts | Persistent preference, OS override and viewport-aware animation. |
| src/components/Hero.astro | Sales composition with copy/CTA before artwork on mobile; separate proof column. |
| src/components/TwoDoor.astro | Stronger choice hierarchy and distinct lime/blue door borders. |
| src/components/Services.astro | Visible mobile action labels and accent rails; prices and service copy intact. |
| src/components/Intake.astro | Original logo, bounded form surface, CSS decorative dot. |
| src/components/TradeLanding.astro | Shared intro treatment and blue supporting proof accent for all three trade pages. |
| src/components/SectionNav.astro | Blue, wrapping section choices with clear target areas. |
| src/components/RoadmapTimeline.astro | Filterable rows, explicit next/testing treatments, unchanged entries. |
| src/components/RoadmapFilters.astro | New progressive filters, pressed states, result announcement and quarter reset. |
| src/pages/index.astro | Hero sculpture, compact release strip, direct Website services department, removed redundant hidden branding. |
| src/pages/roadmap.astro | Filters and clearer status overview; original logo and section hierarchy. |
| src/pages/websites.astro | Sales jump navigation; remove retired sharing artwork override. |
| src/pages/audit.astro | Shared intro structure. |
| src/pages/start.astro | Shared intro structure; checkout gate untouched. |
| src/pages/thanks.astro | Receipt structure; original review promise intact. |
| src/pages/start/thanks.astro | Receipt surface and visible hierarchy via breadcrumbs. |
| src/pages/roadmap/thanks.astro | Receipt surface and roadmap breadcrumbs, no new subscriber promise. |
| src/pages/policies.astro | Original logo and shared intro styling; policy text unchanged. |
| src/pages/resume.astro | Shared reading hierarchy; source and PDF intact. |
| src/pages/accessibility.astro | Shared reading hierarchy; statement intact. |
| src/pages/compare/website-options.astro | Blue borders distinguish comparison options. |
| public/official-logo.png | Exact original asset, SHA-256 pinned by test. |
| scripts/axe-home.mjs | Adds roadmap receipt to all-route coverage. |
| scripts/check-performance-ui.mjs | Local browser interaction and screenshot verification. |
| tests/build/official-logo.test.ts | Pins public and built original bytes. |
| tests/build/muted-text-contrast.test.ts | Adds blue text/fill pairs to existing contrast gate. |
| tests/build/cta-intent-coverage.test.ts | Documents navigation/motion-only tracking and removes retired nav names. |
| tests/build/resume-pdf.test.ts | Expects the correct original mark in shared chrome. |
| tests/build/section-anchor-invariants.test.ts | Sales jump contract follows its move out of global navigation. |
| AGENTS.md; CLAUDE.md; DECISIONS.md | Records owner supersession and immutable logo authority. |
| docs/M3_DESIGN_SYSTEM.md | Design system v2 and component/motion/accessibility contracts. |
| docs/DESIGN_DIRECTION_2026-09-09.md | Plan, critique and prioritized design findings. |
| docs/STRUCTURE_AUDIT_2026-09-09.md | Follow-through and 15th-route inventory correction. |
| TODO.md; PENDING_MANUAL.md; COCKPIT_QUEUE.md | Progress, remaining owner gates and prepared work-log entry. |
| docs/PERFORMANCE_VERIFICATION_2026-09-09.md | This report and real command output. |

## Final result

Build: 15 pages, placeholder fence clean. Vitest: 518 passed, 2 existing skips,
42 files passed. Axe: clean across 60 page/viewport combinations plus the open
chat state; all mobile primary navigation works without JavaScript. Canonicals:
15 OK. Interaction checks: all four widths pass. Astro check: 0 errors, warnings
or hints. Logo hash and all 15 sharing metadata records verified. No API or
roadmap-data diff. `git diff --check` clean.

Screenshot selection: `output/performance-qa/home-375.png`, `home-1440.png`,
`roadmap-375.png`, `roadmap-1440.png`, `websites-375.png`, `websites-1440.png`.
Full-page captures for these three routes are beside them with `-full` suffix.

## Verbatim command output

The logs below are captured command output, including intentional fixture-event
stdout from Vitest. They are not production lead records.

### npm run build

```text

> m3-companysite@0.1.0 build
> npm run resume:pdf && astro build && npm run verify:dist


> m3-companysite@0.1.0 resume:pdf
> node scripts/generate-resume-pdf.mjs

resume.pdf: vendored copy (121174 bytes) → public/ + output/pdf/
23:07:41 [content] Syncing content
23:07:41 [content] Synced content
23:07:41 [types] Generated 429ms
23:07:41 [build] output: "static"
23:07:41 [build] mode: "static"
23:07:41 [build] directory: C:\Users\Michael\Documents\GitHub\CompanySite\dist\
23:07:41 [build] Collecting build info...
23:07:41 [build] ✓ Completed in 460ms.
23:07:41 [build] Building static entrypoints...
23:07:42 [vite] ✓ built in 596ms
23:07:42 [vite] ✓ built in 56ms
23:07:42 [build] Rearranging server assets...

 generating static routes 
23:07:42   ├─ /accessibility/index.html (+16ms) 
23:07:42   ├─ /audit/index.html (+6ms) 
23:07:42   ├─ /compare/website-options/index.html (+4ms) 
23:07:42   ├─ /for/construction/index.html (+5ms) 
23:07:42   ├─ /for/home-services/index.html (+4ms) 
23:07:42   ├─ /for/outdoor-living/index.html (+3ms) 
23:07:42   ├─ /policies/index.html (+4ms) 
23:07:42   ├─ /resume/index.html (+4ms) 
23:07:42   ├─ /roadmap/thanks/index.html (+5ms) 
23:07:42   ├─ /roadmap/index.html (+7ms) 
23:07:42   ├─ /start/thanks/index.html (+3ms) 
23:07:42   ├─ /start/index.html (+3ms) 
23:07:42   ├─ /thanks/index.html (+3ms) 
23:07:42   ├─ /websites/index.html (+17ms) 
23:07:42   ├─ /index.html (+4ms) 
23:07:42 ✓ Completed in 147ms.

 generating optimized images 
23:07:42   ▶ /_astro/big7-live-site.DTqpSfQ2_AjPwp.webp (reused cache entry) (+1ms) (1/3)
23:07:42   ▶ /_astro/big7-live-site.DTqpSfQ2_Zd5aa8.webp (reused cache entry) (+1ms) (2/3)
23:07:42   ▶ /_astro/big7-live-site.DTqpSfQ2_wQunp.webp (reused cache entry) (+1ms) (3/3)
23:07:42 ✓ Completed in 4ms.

23:07:42 [build] ✓ Completed in 847ms.
23:07:42 [build] 15 page(s) built in 1.32s
23:07:42 [build] Complete!

> m3-companysite@0.1.0 verify:dist
> node scripts/check-shipped-placeholders.mjs dist functions

check-shipped-placeholders: clean — no placeholders in dist/, functions/

```

### npm test

```text

> m3-companysite@0.1.0 test
> vitest run


 RUN  v4.1.10 C:/Users/Michael/Documents/GitHub/CompanySite

 ✓ tests/build/shipped-source-hygiene.test.ts (4 tests) 62ms
 ✓ tests/build/canonical.test.ts (12 tests) 36ms
 ✓ tests/build/resume-pdf.test.ts (8 tests) 96ms
 ✓ tests/build/outbound-utm.test.ts (10 tests) 41ms
 ✓ tests/build/intake-cta.test.ts (6 tests) 10ms
 ✓ tests/build/reserved-intent-namespaces.test.ts (24 tests) 20ms
 ✓ tests/build/section-anchor-invariants.test.ts (4 tests) 11ms
 ✓ tests/functions/cockpit-sink.test.ts (16 tests) 36ms
 ✓ tests/build/site-structure.test.ts (3 tests) 17ms
 ✓ tests/functions/rate.test.ts (7 tests) 10ms
 ✓ tests/functions/n8n-sink.test.ts (8 tests) 36ms
 ✓ tests/functions/api-middleware.test.ts (7 tests) 38ms
 ✓ tests/build/hq-home.test.ts (6 tests) 11ms
 ✓ tests/functions/referral.test.ts (18 tests) 11ms
stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > a roadmap subscriber lands on the roadmap receipt, not the review one
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789009664320}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > every other intent still lands on the default thank-you page
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:free-review","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789009664323}

 ✓ tests/build/start-checkout.test.ts (52 tests | 2 skipped) 16ms
stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > an unknown intent falls back to the default rather than 404ing the visitor
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:not-a-real-flow","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789009664325}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.40","ts":1789009664326}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"https://evil.example/steal","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.41","ts":1789009664327}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"//evil.example","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.42","ts":1789009664328}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a same-site path from the allowlist, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"/../../etc/passwd","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.43","ts":1789009664328}

 ✓ tests/build/shipped-placeholders.test.ts (42 tests) 272ms
stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect still carries the security headers and is never cached
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1789009664331}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > JSON callers are unchanged — they still parse an ok payload
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.21","ts":1789009664332}

 ✓ tests/functions/cors.test.ts (35 tests) 19ms
 ✓ tests/functions/lead-form-redirect.test.ts (8 tests) 43ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664462}

stdout | tests/functions/security-headers.test.ts > /api/track ships the headers on every response shape > 204 beacon accept
{"event":"cta","cta":"hero-cta","ip":"unknown","ua":"unknown","ts":1789009664470}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664465}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers null with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789009664475}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664465}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers [] with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789009664477}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664466}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers "a string" with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664467}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers 123 with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789009664480}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664471}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers true with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1789009664481}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664473}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664474}

 ✓ tests/functions/security-headers.test.ts (26 tests) 45ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664474}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664475}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664476}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664476}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664476}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664476}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664477}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664477}

 ✓ tests/build/attribution-loop.test.ts (17 tests) 9ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664477}

 ✓ tests/lib/prefill.test.ts (23 tests) 11ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664477}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664477}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664478}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664479}

 ✓ tests/build/trade-pages.test.ts (12 tests) 10ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664479}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664480}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664480}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664481}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664481}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664481}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664483}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664483}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664483}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664484}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664484}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664484}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664484}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664485}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664485}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664485}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664485}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664485}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664485}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664486}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664486}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664486}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664486}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664486}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664488}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664489}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664490}

 ✓ tests/functions/validate.test.ts (18 tests) 11ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664490}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664490}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664490}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664491}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664491}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664491}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664491}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664491}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664491}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664492}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664492}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664492}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664492}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664492}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

 ✓ tests/build/roadmap-signup.test.ts (8 tests) 9ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

 ✓ tests/functions/chat.test.ts (25 tests) 645ms
     ✓ OPTIONS defers to the shared CORS preflight  563ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664493}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664494}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664494}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664494}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664494}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664494}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664494}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664495}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664495}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664495}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664495}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1789009664495}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1789009664496}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789009664497}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789009664498}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789009664498}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789009664498}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1789009664498}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.10","ts":1789009664499}

 ✓ tests/functions/rate-isolation.test.ts (5 tests) 63ms
 ✓ tests/functions/track-parse.test.ts (14 tests) 9ms
 ✓ tests/functions/validate.supplemental.test.ts (19 tests) 9ms
 ✓ tests/build/muted-text-contrast.test.ts (5 tests) 7ms
 ✓ tests/build/referral-program.test.ts (13 tests) 8ms
 ✓ tests/lib/track.test.ts (9 tests) 8ms
 ✓ tests/build/faq.test.ts (6 tests) 6ms
 ✓ tests/build/intent-preserving-fallback.test.ts (12 tests) 6ms
 ✓ tests/build/official-logo.test.ts (1 test) 8ms
 ✓ tests/build/teardown-offer.test.ts (6 tests) 7ms
 ✓ tests/build/thanks-urgent-mailto.test.ts (5 tests) 4ms
 ✓ tests/build/casestudy-outbound-utm.test.ts (7 tests) 4ms
 ✓ tests/build/intake-submit-intent-fallback.test.ts (3 tests) 5ms
 ✓ tests/build/guarantee-badge.test.ts (3 tests) 5ms
 ✓ tests/build/cta-intent-coverage.test.ts (6 tests) 5ms
 ✓ tests/build/two-door.test.ts (4 tests) 4ms
 ✓ tests/build/content-attribution.test.ts (3 tests) 4ms

 Test Files  42 passed (42)
      Tests  518 passed | 2 skipped (520)
   Start at  23:07:43
   Duration  1.41s (transform 6.77s, setup 0ms, import 9.29s, tests 1.69s, environment 6ms)


```

### npm run test:a11y

```text

> m3-companysite@0.1.0 test:a11y
> node scripts/axe-home.mjs

PASS  / @ narrow (320px) — 39 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 10.07:1 text, 13.47:1 link
PASS  /roadmap/ @ narrow (320px) — 45 rules passed, 0 violations
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
PASS  /roadmap/ @ tablet (768px) — 45 rules passed, 0 violations
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
PASS  /roadmap/ @ mobile (375px) — 45 rules passed, 0 violations
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
PASS  /roadmap/ @ desktop (1440px) — 45 rules passed, 0 violations
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

### node scripts/check-performance-ui.mjs

```text
PASS 320px: motion, persistence, OS override, offscreen stop, keyboard filters, quarter reset, no-JS
PASS 375px: motion, persistence, OS override, offscreen stop, keyboard filters, quarter reset, no-JS
PASS 768px: motion, persistence, OS override, offscreen stop, keyboard filters, quarter reset, no-JS
PASS 1440px: motion, persistence, OS override, offscreen stop, keyboard filters, quarter reset, no-JS

```

### npx astro check

```text
23:05:28 [content] Syncing content
23:05:28 [content] Synced content
23:05:28 [types] Generated 492ms
23:05:28 [check] Getting diagnostics for Astro files in C:\Users\Michael\Documents\GitHub\CompanySite...
Result (42 files): 
- 0 errors
- 0 warnings
- 0 hints


```
