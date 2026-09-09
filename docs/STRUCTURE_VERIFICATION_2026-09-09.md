# Structure verification — 2026-09-09

Final command output captured from CompanySite on the current local branch,
Node 22.23.1. All five commands exited 0. No production requests were sent.
The unit-test log contains synthetic fixture events; it is not delivery evidence.
Line endings and trailing whitespace are normalized for Markdown; log text is otherwise verbatim.
See STRUCTURE_AUDIT_2026-09-09.md for scope, earlier failures, visual review and limits.

## npm run build

```text

> m3-companysite@0.1.0 build
> npm run resume:pdf && astro build && npm run verify:dist


> m3-companysite@0.1.0 resume:pdf
> node scripts/generate-resume-pdf.mjs

resume.pdf: vendored copy (121174 bytes) → public/ + output/pdf/
08:17:05 [content] Syncing content
08:17:05 [content] Synced content
08:17:05 [types] Generated 856ms
08:17:05 [build] output: "static"
08:17:05 [build] mode: "static"
08:17:05 [build] directory: C:\Users\Michael\Documents\GitHub\CompanySite\dist\
08:17:05 [build] Collecting build info...
08:17:05 [build] ✓ Completed in 906ms.
08:17:05 [build] Building static entrypoints...
08:17:06 [vite] ✓ built in 1.02s
08:17:06 [vite] ✓ built in 113ms
08:17:06 [build] Rearranging server assets...

 generating static routes
08:17:06   ├─ /accessibility/index.html (+22ms)
08:17:06   ├─ /audit/index.html (+12ms)
08:17:06   ├─ /compare/website-options/index.html (+9ms)
08:17:06   ├─ /for/construction/index.html (+9ms)
08:17:06   ├─ /for/home-services/index.html (+5ms)
08:17:06   ├─ /for/outdoor-living/index.html (+8ms)
08:17:06   ├─ /policies/index.html (+5ms)
08:17:06   ├─ /resume/index.html (+8ms)
08:17:06   ├─ /roadmap/index.html (+15ms)
08:17:06   ├─ /start/thanks/index.html (+8ms)
08:17:06   ├─ /start/index.html (+7ms)
08:17:06   ├─ /thanks/index.html (+8ms)
08:17:06   ├─ /websites/index.html (+27ms)
08:17:06   ├─ /index.html (+6ms)
08:17:06 ✓ Completed in 303ms.

 generating optimized images
08:17:06   ▶ /_astro/big7-live-site.DTqpSfQ2_AjPwp.webp (reused cache entry) (+3ms) (1/3)
08:17:06   ▶ /_astro/big7-live-site.DTqpSfQ2_Zd5aa8.webp (reused cache entry) (+2ms) (2/3)
08:17:06   ▶ /_astro/big7-live-site.DTqpSfQ2_wQunp.webp (reused cache entry) (+2ms) (3/3)
08:17:06 ✓ Completed in 12ms.

08:17:06 [build] ✓ Completed in 1.55s.
08:17:06 [build] 14 page(s) built in 2.50s
08:17:06 [build] Complete!

> m3-companysite@0.1.0 verify:dist
> node scripts/check-shipped-placeholders.mjs dist functions

check-shipped-placeholders: clean — no placeholders in dist/, functions/
```

## npm test

```text

> m3-companysite@0.1.0 test
> vitest run


 RUN  v4.1.10 C:/Users/Michael/Documents/GitHub/CompanySite

 ✓ tests/functions/n8n-sink.test.ts (8 tests) 47ms
 ✓ tests/build/shipped-source-hygiene.test.ts (4 tests) 309ms
 ✓ tests/build/outbound-utm.test.ts (10 tests) 57ms
 ✓ tests/build/canonical.test.ts (12 tests) 63ms
 ✓ tests/build/intake-cta.test.ts (6 tests) 12ms
 ✓ tests/functions/rate.test.ts (7 tests) 15ms
 ✓ tests/build/resume-pdf.test.ts (8 tests) 630ms
     ✓ the generator runs clean and writes public/resume.pdf  601ms
 ✓ tests/build/site-structure.test.ts (3 tests) 22ms
 ✓ tests/build/reserved-intent-namespaces.test.ts (23 tests) 24ms
stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > a successful urlencoded submit redirects to the thank-you page
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1788956259473}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect is a fixed same-site path, never taken from the request
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1788956259483}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > the redirect still carries the security headers and is never cached
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.20","ts":1788956259485}

stdout | tests/functions/lead-form-redirect.test.ts > no-JS form submits land on a page, not on raw JSON > JSON callers are unchanged — they still parse an ok payload
{"event":"lead_received","source":"roadmap","business":"roadmap-subscriber","hasUrl":false,"frustrationLength":45,"intent":"book:roadmap-subscribe","resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_2f7965fd","ip":"198.51.100.21","ts":1788956259487}

 ✓ tests/functions/lead-form-redirect.test.ts (6 tests) 74ms
 ✓ tests/functions/cockpit-sink.test.ts (16 tests) 65ms
 ✓ tests/build/shipped-placeholders.test.ts (42 tests) 883ms
     ✓ CLI: a leaked .md blocks the build (exit 1) and the key is redacted from the log  494ms
 ✓ tests/functions/validate.supplemental.test.ts (19 tests) 12ms
 ✓ tests/build/start-checkout.test.ts (52 tests | 2 skipped) 28ms
 ✓ tests/build/section-anchor-invariants.test.ts (4 tests) 15ms
 ✓ tests/functions/referral.test.ts (18 tests) 17ms
 ✓ tests/functions/cors.test.ts (35 tests) 27ms
 ✓ tests/build/hq-home.test.ts (6 tests) 16ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259780}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259787}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259788}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259789}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259790}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead still lands after enough CTA beacons to exhaust its old budget
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259797}

stdout | tests/functions/security-headers.test.ts > /api/track ships the headers on every response shape > 204 beacon accept
{"event":"cta","cta":"hero-cta","ip":"unknown","ua":"unknown","ts":1788956259798}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259800}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259801}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259802}

 ✓ tests/functions/api-middleware.test.ts (7 tests) 59ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259803}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259803}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259804}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259804}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers null with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1788956259805}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259805}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259806}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259806}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259806}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259806}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259807}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259807}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259807}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259807}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259808}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers [] with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1788956259815}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259808}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259808}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers "a string" with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1788956259818}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259809}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > a real lead survives far more beacons than the lead limit
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259810}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259812}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259812}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259813}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259813}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the lead limit itself still works — this is isolation, not removal
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259813}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259817}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259817}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259817}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259817}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers 123 with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1788956259822}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259817}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259818}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259818}

stdout | tests/functions/security-headers.test.ts > the unhandled-throw funnel — Cloudflare answers those, and it strips everything > /api/track answers true with a hardened 204 instead of throwing
{"event":"cta","cta":"unknown","ip":"unknown","ua":"unknown","ts":1788956259824}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259818}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259818}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259819}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259819}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259820}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259820}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259821}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259821}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259821}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259821}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259822}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259822}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259822}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259824}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259825}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259825}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259825}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259825}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259825}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259826}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259826}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259826}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259826}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259826}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259826}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259827}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259827}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259827}

 ✓ tests/functions/security-headers.test.ts (26 tests) 85ms
 ✓ tests/build/attribution-loop.test.ts (17 tests) 15ms
stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259859}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259861}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259861}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259861}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259863}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259863}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259864}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259864}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259864}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259865}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259866}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259866}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259868}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259868}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259868}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259868}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259869}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259869}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259870}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259870}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259870}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259871}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259871}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259871}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"cta","cta":"hero-cta","section":"hero","ip":"198.51.100.77","ua":"unknown","ts":1788956259872}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > the track limit still works on its own key
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"198.51.100.77","ts":1788956259873}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1788956259878}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1788956259879}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1788956259880}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1788956259881}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.9","ts":1788956259881}

stdout | tests/functions/rate-isolation.test.ts > the analytics beacon must not spend the lead allowance > rate buckets stay separated per IP as well as per route
{"event":"lead_received","source":"unknown","business":"landscaping","hasUrl":false,"frustrationLength":56,"resend":{"admin":{"ok":false,"skipped":true},"reply":{"ok":false,"skipped":true}},"cockpit":{"ok":false,"skipped":true},"n8n":{"ok":false,"skipped":true},"cockpitId":"lead_cbb1c745","ip":"203.0.113.10","ts":1788956259881}

 ✓ tests/functions/rate-isolation.test.ts (5 tests) 141ms
 ✓ tests/functions/validate.test.ts (18 tests) 12ms
 ✓ tests/functions/track-parse.test.ts (14 tests) 18ms
 ✓ tests/build/trade-pages.test.ts (12 tests) 16ms
 ✓ tests/lib/prefill.test.ts (23 tests) 15ms
 ✓ tests/build/roadmap-signup.test.ts (6 tests) 10ms
 ✓ tests/lib/track.test.ts (9 tests) 9ms
 ✓ tests/build/referral-program.test.ts (13 tests) 12ms
 ✓ tests/build/intent-preserving-fallback.test.ts (12 tests) 10ms
 ✓ tests/build/muted-text-contrast.test.ts (5 tests) 8ms
 ✓ tests/build/cta-intent-coverage.test.ts (6 tests) 8ms
 ✓ tests/build/guarantee-badge.test.ts (3 tests) 8ms
 ✓ tests/build/teardown-offer.test.ts (6 tests) 8ms
 ✓ tests/build/intake-submit-intent-fallback.test.ts (3 tests) 7ms
 ✓ tests/build/casestudy-outbound-utm.test.ts (7 tests) 7ms
 ✓ tests/build/faq.test.ts (6 tests) 9ms
 ✓ tests/build/two-door.test.ts (4 tests) 8ms
 ✓ tests/build/thanks-urgent-mailto.test.ts (5 tests) 6ms
 ✓ tests/functions/chat.test.ts (25 tests) 1646ms
     ✓ OPTIONS defers to the shared CORS preflight  1584ms
 ✓ tests/build/content-attribution.test.ts (3 tests) 5ms

 Test Files  41 passed (41)
      Tests  512 passed | 2 skipped (514)
   Start at  08:17:37
   Duration  2.88s (transform 7.39s, setup 0ms, import 11.01s, tests 4.44s, environment 10ms)

```

## npm run test:a11y

```text

> m3-companysite@0.1.0 test:a11y
> node scripts/axe-home.mjs

PASS  / @ narrow (320px) — 40 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /roadmap/ @ narrow (320px) — 46 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /websites/ @ narrow (320px) — 50 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /compare/website-options/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /audit/ @ narrow (320px) — 42 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/ @ narrow (320px) — 42 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/thanks/ @ narrow (320px) — 36 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /thanks/ @ narrow (320px) — 39 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /resume/ @ narrow (320px) — 41 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /policies/ @ narrow (320px) — 36 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /accessibility/ @ narrow (320px) — 39 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/construction/ @ narrow (320px) — 42 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/home-services/ @ narrow (320px) — 42 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/outdoor-living/ @ narrow (320px) — 42 rules passed, 0 violations
PASS chat open @ narrow — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  / @ tablet (768px) — 40 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /roadmap/ @ tablet (768px) — 46 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /websites/ @ tablet (768px) — 50 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /compare/website-options/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /audit/ @ tablet (768px) — 42 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/ @ tablet (768px) — 42 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/thanks/ @ tablet (768px) — 36 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /thanks/ @ tablet (768px) — 39 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /resume/ @ tablet (768px) — 41 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /policies/ @ tablet (768px) — 36 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /accessibility/ @ tablet (768px) — 39 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/construction/ @ tablet (768px) — 42 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/home-services/ @ tablet (768px) — 42 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/outdoor-living/ @ tablet (768px) — 42 rules passed, 0 violations
PASS chat open @ tablet — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  / @ mobile (375px) — 40 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /roadmap/ @ mobile (375px) — 46 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /websites/ @ mobile (375px) — 50 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /compare/website-options/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /audit/ @ mobile (375px) — 42 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/ @ mobile (375px) — 42 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/thanks/ @ mobile (375px) — 36 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /thanks/ @ mobile (375px) — 39 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /resume/ @ mobile (375px) — 41 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /policies/ @ mobile (375px) — 36 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /accessibility/ @ mobile (375px) — 39 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/construction/ @ mobile (375px) — 42 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/home-services/ @ mobile (375px) — 42 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/outdoor-living/ @ mobile (375px) — 42 rules passed, 0 violations
PASS chat open @ mobile — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  / @ desktop (1440px) — 40 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /roadmap/ @ desktop (1440px) — 46 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /websites/ @ desktop (1440px) — 50 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /compare/website-options/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /audit/ @ desktop (1440px) — 42 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/ @ desktop (1440px) — 42 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /start/thanks/ @ desktop (1440px) — 36 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /thanks/ @ desktop (1440px) — 39 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /resume/ @ desktop (1440px) — 41 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /policies/ @ desktop (1440px) — 36 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /accessibility/ @ desktop (1440px) — 39 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/construction/ @ desktop (1440px) — 42 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/home-services/ @ desktop (1440px) — 42 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS  /for/outdoor-living/ @ desktop (1440px) — 42 rules passed, 0 violations
PASS chat open @ desktop — 0 violations; greeting review 8.38:1 text, 6.90:1 link
PASS keyboard skip, focus outline, reduced motion, and mobile navigation without JavaScript

axe-core: clean on 56 page × viewport combinations.
```

## npm run audit:canonicals

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
ok  dist\start\index.html  →  https://m3mm.net/start
ok  dist\start\thanks\index.html  →  https://m3mm.net/start/thanks
ok  dist\thanks\index.html  →  https://m3mm.net/thanks
ok  dist\websites\index.html  →  https://m3mm.net/websites

audit-canonicals: 14 page(s) OK.
```

## npx astro check

```text
08:17:45 [content] Syncing content
08:17:45 [content] Synced content
08:17:45 [types] Generated 814ms
08:17:45 [check] Getting diagnostics for Astro files in C:\Users\Michael\Documents\GitHub\CompanySite...
Result (38 files):
- 0 errors
- 0 warnings
- 0 hints

```
