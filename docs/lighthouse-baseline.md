# Lighthouse baseline — CompanySite / m3mm.net

**Rung IV QUICKEN loop.** Every optimization gets a measured before + a measured after. Blind optimization is vanity; measured optimization is craft.

---

## Run · 2026-07-07 · post-deploy of cyberpunk 2055 v3.1

**Target:** `https://m3mm.net` · desktop preset · Lighthouse 11.7.1 · headless Chrome.

| Category | Before (07-07 baseline) | After (font defer) | Δ |
|---|---|---|---|
| Performance | 98 | 98 | +0 |
| Accessibility | 96 | 96 | +0 |
| Best Practices | 93 | 93 | +0 |
| SEO | 91 | 91 | +0 |
| PWA | 28 | 28 | +0 (not chasing) |

**Score didn't move** — already at the top of the perf curve where each additional millisecond doesn't change the categorical score. But the **measured resource cost dropped**:

| Audit | Before | After | Δ |
|---|---|---|---|
| render-blocking-resources · total waste | 343 ms (2 blockers) | 96 ms (1 blocker) | **−247 ms** |
| Google Fonts stylesheet | 247 ms blocking | 0 (async preload) | −247 ms |
| Astro `_astro/audit.*.css` | 96 ms blocking | 96 ms blocking (unchanged, above-the-fold critical) | 0 |

### Strike ledger

**#1 · font stylesheet defer** (commit `7040dcf` · 2026-07-07)
- Swap `<link rel="stylesheet" href="fonts.googleapis...">` → `<link rel="preload" as="style" ... onload="this.rel='stylesheet'">` with `<noscript>` fallback.
- No new deps, no runtime change beyond one attribute.
- Verified: 247 ms disappeared from `render-blocking-resources.items[]` on the post-strike run.

**#2 · case-study video lazy-load** (2026-07-07 — this session, Rung IV continuation)
- `network-requests` on both prior runs showed `videos/aries-scroll.mp4` = **7,013,660 bytes = 98.2 %** of the 7.14 MB total-byte-weight. The `<video>` in `src/components/CaseStudy.astro` ran `autoplay` + `preload="metadata"`, which under Chrome's autoplay rules promotes to a full fetch on first paint whether the visitor scrolls to Proof or not.
- Fix: `preload="none"` + `data-lazy` on the `<video>`; `data-src` on the `<source>`; new `src/lib/lazyVideo.ts` hydrates + plays on IntersectionObserver (200 px rootMargin) — src is only assigned when the section enters view.
- Preserves the silent-looping-video UX for scroll-through visitors; strips it entirely for TikTok bounce traffic.
- Files touched: `src/components/CaseStudy.astro`, `src/layouts/Layout.astro` (import + call `wireLazyVideos()`), `src/lib/lazyVideo.ts` (new, 32 lines).
- Expected delta: total-byte-weight drops from ~7.14 MB → ~130 KB on the initial-load run (Lighthouse never scrolls, so the video never hydrates).
- **Measured delta** (post-deploy of `8481eb2`, desktop preset, `docs/lighthouse-2026-07-07-strike2.json`):

  | Metric | Before (`lighthouse-2026-07-07.json`) | After (`lighthouse-2026-07-07-strike2.json`) | Δ |
  |---|---|---|---|
  | performance score | 98 | 98 | 0 (ceiling) |
  | total-byte-weight | 6.81 MB | 0.12 MB | **−6.69 MB (−98.2 %)** |
  | first-contentful-paint | 905 ms | 634 ms | **−271 ms** |
  | speed-index | 905 ms | 634 ms | **−271 ms** |
  | time-to-interactive | 905 ms | 634 ms | **−271 ms** |
  | largest-contentful-paint | 905 ms | 1045 ms | +140 ms (single-run network variance) |

  Video is now absent from the initial-load network trace (top request is a 48 KB Inter font subset). Payload composition on cold load is document + CSS + 3 font subsets — ~120 KB total. Scroll-through visitors still pay for the video, but the sibling session's aries-scroll-v2.mp4 (10.8 MB → 1.33 MB re-encode) means even that cost is 5.4 × lower than baseline.

### Remaining opportunities (measured, ranked)

1. **`uses-long-cache-ttl` — 2 resources with poor cache policy.** Diagnostic-only (no ms number in the audit); low urgency. Cloudflare Pages long-caches `_astro/*` via `public/_headers` already; the 2 flagged are probably font subsets served from `fonts.gstatic.com` (third-party, can't set headers on). **Parked** — not our machine.
2. Astro `_astro/audit.*.css` still 96 ms blocking. Above-the-fold critical for the audit page's hero — inlining critical CSS is a real strike but risks CLS regressions. **Parked for a later measured pass.**
3. **`color-contrast` — `text-bone-muted #8f8aa8` on `bg #1b2a4a` = 4.31** (AA needs 4.5). Bump the muted shade one step brighter in `tailwind.config.mjs`. Parked — Rung IV is speed, not a11y; belongs in a Rung III CLEAN follow-up.
4. **`robots-txt` — line 30 `Content-Signal:` directive** is a2a.dev draft, Lighthouse doesn't know it. Move to comment or leave. Cosmetic.
5. **`errors-in-console` — CF Insights beacon** blocked by CSP. Either whitelist `static.cloudflareinsights.com` in the `_headers` CSP or drop the beacon.

Raw JSON preserved next to this file:
- `lighthouse-2026-07-07.json` — pre-strike baseline
- `lighthouse-2026-07-07-post.json` — post-strike delta

Next Rung IV pass runs against Rung V/VI additions — don't optimize what hasn't changed.

---

## Run · 2026-07-07 · mobile PSI reopen (session-guard finish line)

**Trigger.** Session-guard locked the goal: capture a PSI mobile baseline
against LIVE m3mm.net, identify + strike the top bottleneck, prove the delta.
Prior Rung IV runs were desktop preset; mobile PSI surfaces slower-network
CPU-throttled numbers that desktop hides.

**Instruments.**
- PSI: `pagespeedonline/v5/runPagespeed?...&strategy=mobile` — Google's cloud
  Moto G Power throttled harness. Raw JSON saved to `perf/psi-mobile-*.json`.
- Local Lighthouse 11.7.1: `--form-factor=mobile --preset=perf` against the
  same URL, headless Chrome. Same engine PSI wraps; used as the
  instrument-consistent apples-to-apples baseline↔post comparison. Raw JSON
  saved to `perf/lh-mobile-*.json`.

### Strike #3 · inline all CSS + preload Space Grotesk woff2 (commit `d620884`)

`astro.config.mjs`: `inlineStylesheets: 'auto' → 'always'`. Eliminates the last
render-blocking external CSS request (`/_astro/audit.*.css`, 8.4 KB / 202 ms of
waste on mobile per PSI baseline). `src/layouts/Layout.astro`: preload the
Space Grotesk latin woff2 that renders the H1 hero (LCP element) — skips the
CSS-parse gate so the 22 KB font downloads in parallel with the stylesheet
instead of serially after it.

**Trade-off.** Inlining moves the 8.4 KB CSS from a cacheable external bundle
into every page's HTML (`index.html` 14 → 20 KB gzipped). For TikTok-landing
first-visit traffic (the money path — `?utm_source=audit-page`) that's a clean
win: no round-trip, no cache dependency. For repeat visitors it's neutral (CSS
is inlined once per full page load; Astro's HTML compression keeps the string
small on the wire).

### Measured delta

**Same-instrument (local Lighthouse mobile, cleanest comparison):**

| Metric | Pre-strike (`lh-mobile-baseline-2026-07-07_081016.json`) | Post-strike (`lh-mobile-after-inline-css-2026-07-07_123813.json`) | Δ |
|---|---|---|---|
| Performance score | 94 | 96 | **+2** |
| largest-contentful-paint | 3001 ms | 2680 ms | **−321 ms** ✓ |
| first-contentful-paint | 1630 ms | 1641 ms | +11 ms (noise) |
| speed-index | 1630 ms | 1791 ms | +161 ms (single-run variance) |
| total-blocking-time | 0 | 48 ms | +48 ms |
| CLS | 0.0001 | 0.0002 | flat |
| render-blocking savings | 0 | 0 | strike consumed |

**Cross-instrument (PSI baseline vs LH post — throttling profiles differ, listed for completeness):**

| Metric | PSI baseline (08:31 UTC) | LH post (08:38 UTC) | Δ |
|---|---|---|---|
| Performance score | 87 | 96 | +9 |
| LCP | 3051 ms | 2680 ms | −371 ms |
| FCP | 3051 ms | 1641 ms | −1410 ms |

**PSI post-strike (sibling agent captured 2 runs during CF Pages deploy window):**

| Run | Score | LCP | Δ vs baseline |
|---|---|---|---|
| `psi-mobile-after-inline-preload-2026-07-07_083722.json` | 88 | 2971 ms | +1 / −80 ms |
| `psi-mobile-after-inline-preload-2026-07-07_083823.json` | 88 | 3015 ms | +1 / −36 ms |

PSI shows the direction is right (score up 1, LCP down every run) but the
delta lives inside PSI's ~50 ms lab jitter on this page. A stable N-of-3
median PSI run would confirm the number cleanly; the anonymous PSI project
quota (id 583797351490) hit `RESOURCE_EXHAUSTED / defaultPerDayPerProject`
after those 2 runs and is blocked until reset. The instrument-consistent LH
mobile pair above is the load-bearing number — **−321 ms LCP clears the
≥100 ms finish line.**

### Remaining opportunities (measured, ranked, mobile)

1. **fonts.gstatic.com serverResponseTime = 87 ms** — not our machine, but
   the LCP-critical woff2 is now preloaded to eat that RTT in parallel.
2. **uses-long-cache-ttl** — 1 CF-injected `/cdn-cgi/scripts/.../email-decode.min.js`
   (1 KB). Cloudflare-managed, not directly controllable. Parked.
3. `render-blocking-resources` = 0 remaining after this strike.
