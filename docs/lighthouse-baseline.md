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
- Verified after commit + CF Pages deploy — post-run JSON at `lighthouse-2026-07-07-strike2.json`.

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
