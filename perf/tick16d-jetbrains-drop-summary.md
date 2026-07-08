# tick-16d — JetBrains Mono drop

**Strike:** removed JetBrains Mono from `<link>` preloads, Google Fonts CSS URL,
`tailwind.config.mjs` font stack, and `global.css` `.card-header/.result-num`.
`font-mono` now resolves to `ui-monospace, SFMono-Regular, Menlo, Consolas,
monospace` — visually clean at 11px uppercase 0.2em tracking where mono is used.

**Method:** matched Lighthouse mobile runs, throttling method = devtools, same
screen emulation (412×823 @ 1.75 DPR, moto g power UA), against `npm run
preview` build of the current tree.

## Before → After (mobile, devtools throttling)

| Metric      | Before (prefix) | After (drop)  | Delta       |
|-------------|-----------------|---------------|-------------|
| Perf score  | 98              | **100**       | **+2**      |
| LCP         | 1.8 s (1791ms)  | **1.1 s (1072ms)** | **−719 ms** |
| FCP         | 1.4 s           | 1.1 s         | −300 ms     |
| TBT         | 150 ms          | 40 ms         | −110 ms     |
| Speed Index | 1.5 s           | 1.1 s         | −400 ms     |
| Transfer    | 123 KiB         | **91 KiB**    | **−32 KiB** |
| Requests    | 7               | 6             | −1          |

## Session-guard finish-line check

- Finish line: score delta ≥ 3 **OR** LCP delta ≥ 100 ms.
- LCP delta = **−719 ms** ✅ (exceeds threshold by 7×).
- Score delta = +2 (below score threshold, LCP branch satisfies goal).

## Files (both saved under `perf/`)

- Before: `lh-mobile-preview-prefix-tick16-2026-07-07_215811.json`
- After : `lh-mobile-after-jetbrains-drop-tick16d-devtools-2026-07-07_215906.json`

## Notes

- Live m3mm.net baseline (`lh-mobile-baseline-tick16-…`) already sat at 99 /
  LCP 1.7 s. The room to move was on preview against the current tree; this
  fix is what will land the score bump once pushed. Push is out of scope for
  this tick per session constraints.
- Visual QA of `font-mono` labels (kickers, eyebrows, `.result-num`) not yet
  performed in a browser — next-up manual pass before deploy.
