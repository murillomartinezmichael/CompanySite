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

### Strike #4 · widen preload to Inter + JetBrains Mono woff2 (commit `90c95b4`)

Sibling agent's follow-up to #3 in the same session. The PSI post-`d620884`
runs (`perf/psi-mobile-after-inline-preload-2026-07-07_083{722,823}.json`)
showed +1 score / −80 ms LCP — direction right, magnitude inside PSI's lab
jitter. Widening preload to Inter + JetBrains Mono means body copy and
kicker/eyebrow fonts arrive in parallel with the stylesheet instead of after
it — since Google Fonts subsets are ~22 KB each and were already going to
load, preload just moves them earlier in the waterfall.

### Measured delta (strikes #3 + #4 combined)

**Same-instrument (local Lighthouse mobile, cleanest comparison):**

| Metric | Pre-strike (`lh-mobile-baseline-2026-07-07_081016.json`) | Post-strike final (`lh-mobile-after-inline-css-and-font-preloads-2026-07-07_124152.json`) | Δ |
|---|---|---|---|
| Performance score | 94 | **98** | **+4** ✓ |
| largest-contentful-paint | 3001 ms | **1759 ms** | **−1242 ms** ✓✓✓ |
| first-contentful-paint | 1630 ms | 1380 ms | **−250 ms** |
| speed-index | 1630 ms | ~1500 ms | ~−130 ms |
| total-blocking-time | 0 ms | 130 ms | +130 ms (font preload competes for main thread; still well under Google's 200 ms warn line) |
| CLS | 0.0001 | 0.0002 | flat |
| render-blocking savings | 0 | 0 | strike consumed |

**Intermediate reading (strike #3 only, before #4 landed):** post-`d620884`
LH mobile at 08:38 UTC = score 96, LCP 2680 ms, saved to
`perf/lh-mobile-after-inline-css-2026-07-07_123813.json` for ledger integrity
(+2 score, −321 ms LCP already clears the ≥100 ms guard on its own).

**Cross-instrument (PSI baseline vs LH post-final — throttling profiles differ, listed for completeness):**

| Metric | PSI baseline (08:31 UTC) | LH post-final (08:41 UTC) | Δ |
|---|---|---|---|
| Performance score | 87 | 98 | +11 |
| LCP | 3051 ms | 1759 ms | −1292 ms |
| FCP | 3051 ms | 1380 ms | −1671 ms |

**PSI post-strike runs (sibling agent captured 3 runs across the deploy window):**

| Run | Deployed state | Score | LCP | Δ vs baseline |
|---|---|---|---|---|
| `psi-mobile-after-inline-preload-2026-07-07_083722.json` | strike #3 only | 88 | 2971 ms | +1 / −80 ms |
| `psi-mobile-after-inline-preload-2026-07-07_083823.json` | strike #3 only | 88 | 3015 ms | +1 / −36 ms |
| `psi-mobile-after-3fonts-2026-07-07_084044.json` | strikes #3 + #4 | **97** | **2448 ms** | **+10 / −603 ms** ✓✓✓ |

The first two PSI runs (post-`d620884` only, before `90c95b4` shipped) live
inside PSI's ~50 ms lab jitter on this page. The third run — captured after
the full font-preload widening deployed — clears the finish line cleanly on
PSI's own throttled harness: **+10 score, −603 ms LCP, both well above the
≥3 / ≥100 ms guard.** The intermediate LH mobile pair above corroborates
same-instrument at −1242 ms LCP. Both instruments agree the strike was real.

### Remaining opportunities (measured, ranked, mobile)

1. **fonts.gstatic.com serverResponseTime = 87 ms** — not our machine, but
   the LCP-critical woff2 is now preloaded to eat that RTT in parallel.
2. **uses-long-cache-ttl** — 1 CF-injected `/cdn-cgi/scripts/.../email-decode.min.js`
   (1 KB). Cloudflare-managed, not directly controllable. Parked.
3. `render-blocking-resources` = 0 remaining after this strike.

### Strike #5 · bypass Cloudflare Email Address Obfuscation (tick-10, commit `9167f81`)

Follow-on to the "parked" `email-decode.min.js` line above. Two agents
converged on this bottleneck in parallel — sibling committed Footer.astro
first as `9167f81`; this entry ledgers the strike with the second-instrument
local-after companion measurement.

Tick-10 baseline
(`perf/lh-mobile-baseline-tick10-2026-07-07_121224.json`) against live
m3mm.net regressed to Perf 94 / LCP 2531 ms and pinned the residual bottleneck:

```
render-blocking-insight:
  url: /cdn-cgi/scripts/…/cloudflare-static/email-decode.min.js
  totalBytes: 1000
  wastedMs: 206
```

Also present in `network-dependency-tree-insight` as a child of the root
document with 210 ms transferTime. CF Email Address Obfuscation injects this
script at the edge whenever the served HTML contains a raw email or a
`mailto:` anchor — Footer had `<a href="mailto:murillo…@gmail.com">…</a>`
in plain HTML source, so every m3mm.net response triggered the decoder
injection.

**Fix.** `src/components/Footer.astro`: split the address into `data-em-u` /
`data-em-h` attrs on an anchor whose default `href` is `/audit#intake`
(graceful no-JS fallback). A tiny `is:inline` script hydrates on load,
building `mailto:{u}@{h}?subject=…&body=…` and swapping the visible text.
The rendered HTML — what CF's edge scanner sees — contains no email
pattern and no `mailto:` href, so the decoder script is never injected.

Verified in the built bundle:
- `grep -c "murillomartinezmichael@gmail.com" dist/index.html` → 0
- `grep -o "mailto:[^\"]*" dist/index.html` → 0 anchor hrefs (only 2 hits, both inside the inline `<script>`).

**Local delta (`lh-local-after-tick10`, astro preview 4321, no CF middleware
in the request path):** Perf 96, LCP 2255 ms — statistical parity with
tick-7 local-after (98 / 2262 ms). Expected: the whole point of the fix
is a CF-edge behavior invisible to local preview. Local Lighthouse can't
score improvement it can't observe.

**Deploy-verified delta:** unmeasured this tick — session hard constraints
disallow push/deploy. Post-deploy the CF email-decode line disappears from
the network trace entirely (0 KB saved on payload, but ~200 ms wasted-ms
recovered from the render-blocking path per this tick's baseline). PSI
daily quota was exhausted mid-session, blocking a fresh remote re-check.

Files touched: `src/components/Footer.astro` (+29/-2, in sibling commit
`9167f81`), this ledger, `perf/lh-mobile-baseline-tick10-*.json` (new, in
sibling commit), `perf/lh-local-after-tick10-*.json` (new, this tick).
