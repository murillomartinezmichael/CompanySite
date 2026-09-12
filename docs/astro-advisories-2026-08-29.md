# The 8 open `astro` advisories, measured against this site

**Date:** 2026-08-29 · **Astro:** 5.18.2 · **Verdict: none of the 8 reach m3mm.net.**

`npm audit` reports `astro <=7.0.9` with 8 advisories and offers exactly one
fix: `npm audit fix --force` → **astro@7.2.9**, a two-major jump on the rung-1
live site. Before accepting a breaking upgrade under time pressure, each
advisory was checked against what this codebase actually does.

| Advisory | Requires | This site | Reaches us? |
|---|---|---|---|
| GHSA-j687-52p2-xcff — XSS in `define:vars` | a `define:vars` directive | **0 uses** in `src/` | No |
| GHSA-xr5h-phrj-8vxv — server island param replay | `server:defer` islands | **0 uses** | No |
| GHSA-jrpj-wcv7-9fh9 — XSS via spread prop names | `{...spread}` on an element | **0 uses** | No |
| GHSA-f48w-9m4c-m7f5 — XSS in `renderHTMLElement` spread | same | **0 uses** | No |
| GHSA-7pw4-f3q4-r2p2 — XSS via `transition:*` on hydrated islands | Astro `transition:` directives | **0 uses** — all 7 `transition:` hits are CSS properties | No |
| GHSA-4g3v-8h47-v7g6 — XSS via View Transition animation props | same | **0 uses** | No |
| GHSA-2pvr-wf23-7pc7 — Host header SSRF in prerendered error page | a running server | `output: 'static'`, no adapter | No |
| GHSA-8hv8-536x-4wqp — XSS via unescaped slot name | attacker-controlled slot names | 26 `slot=` uses, all authored constants | No |

Every one needs either SSR or an attacker-controlled value reaching a
directive. This is a fully static build of authored content deployed to
Cloudflare Pages.

## What this does and does not mean

**Does:** the astro 5 → 7 upgrade is a maintenance decision — cost, breakage
risk, time — not a security emergency. It should be scheduled deliberately, not
forced by a red `npm audit` on a Saturday.

**Does not:** mean the audit is wrong or should be silenced. The advisories are
real; they simply describe code paths this site does not use. The moment this
site gains SSR, an adapter, server islands, or `define:vars`, this table is void
and the upgrade becomes urgent.

**Re-check this table** whenever `astro.config.mjs` gains an `adapter`,
`output` stops being `'static'`, or any of the zero-use features above appear.

## What was fixed instead

`sharp` 0.34.5 → 0.35.4 (high, libvips CVEs) and `esbuild` 0.27.7 → 0.28.2 via
scoped `overrides` — commit `baa7aec`. Build output was byte-identical across
all 55 files and 21 images, and the suite held at 485 passed.
