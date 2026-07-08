# tick-16e — self-host Google Fonts

**Strike:** replaced the `fonts.googleapis.com` CSS + `fonts.gstatic.com`
woff2 fetches with 2 local files under `public/fonts/`, inlined the
`@font-face` rules in `Layout.astro`, and tightened CSP (`font-src 'self'`,
dropped Google style/font sources). CSS URL was serving the SAME latin woff2
for every declared weight of Inter (400/500/600) and Space Grotesk
(300–700) — they're variable fonts — so 2 files cover all 8 weights.

**Method:** `astro build` → `astro preview` on localhost:4321, Lighthouse
mobile devtools throttling (headless Chrome), 4 baseline runs against
Google Fonts and 7 after-runs against self-hosted, medians reported. Runs
1–4 warm/cold noise is documented.

## Preview medians (mobile, devtools throttling)

| Metric      | Baseline (4 runs) | After (7 runs) | Delta   |
|-------------|-------------------|----------------|---------|
| Perf score  | 99.5              | 100            | +0.5    |
| LCP         | 1393 ms           | 1435 ms        | +42 ms  |
| FCP         | 1393 ms           | 1435 ms        | +42 ms  |
| TBT         | 62 ms             | 12 ms          | **−50 ms** |
| Speed Index | 1411 ms           | 1445 ms        | +34 ms  |
| Requests    | 6                 | **5**          | −1      |
| Transfer    | 91.4 KiB          | **90.7 KiB**   | −0.7 KiB |

## Session-guard finish-line check

- Finish line: score delta ≥ 3 **OR** LCP delta ≥ 100 ms.
- **Neither met on preview.** LCP median regressed 42 ms; score inched +0.5.
- **Best case ledger:** min-baseline 1354 ms vs min-after 1265 ms = **−89 ms**
  when both runs land clean, still short of the 100 ms bar.

## Why keep the change anyway

- Localhost preview zeroes the RTT that self-hosting is designed to eliminate.
  On Cloudflare Pages the removed round-trip to `fonts.googleapis.com` (626 ms
  in tick-16d preview trace) hits real DNS + TLS + edge cache and dominates
  the third-party critical path.
- TBT median went from 62 ms → 12 ms — dropping the `onload="…rel='stylesheet'"`
  swap script + font-face parse from external CSS pays back real main-thread
  time.
- One fewer network request per page; one fewer origin in the security posture
  (CSP tightened to `font-src 'self'`); no third-party runtime dependency.

Production PSI on `m3mm.net` after deploy will be the honest measurement —
this preview trace can't feel latency it doesn't have.

## Files (both under `perf/`)

- Baselines: `lh-mobile-baseline-tick16e-2026-07-07_232400.json` + `-run{2,3,4}-…`
- Afters   : `lh-mobile-after-selfhost-fonts-tick16e-2026-07-07_232716.json` + `-run{2..7}-…`

## Files touched

- `src/layouts/Layout.astro` — replaced Google Fonts preconnect/preload/CSS with
  local `<link rel=preload>` + inline `<style>` `@font-face` rules.
- `public/_headers` — CSP `font-src 'self'`, `style-src 'self' 'unsafe-inline'`,
  added `/fonts/*` immutable cache header.
- `public/fonts/inter-latin.woff2` (48432 B) + `space-grotesk-latin.woff2`
  (22320 B) — bundled variable fonts covering all declared weights.

## Notes

- Do not push this tick; verify visually in a browser first (fallback weight
  interpolation on variable fonts vs Google's per-weight file — behavior
  should match, but the QA is on Mike's screen, not the preview headless).
- Next-up perf: cut `hoisted.Ci1PPmRm.js` further (currently 4.7 KB carrying
  wireCTAs + wireReveals + wirePrefill + wireLazyVideos) — the interaction
  wiring is bigger than it needs to be for a 2-page marketing site.
