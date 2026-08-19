# Shipped-source hygiene

**Status:** Active
**Date:** 2026-08-08
**Guarded by:** `tests/build/shipped-source-hygiene.test.ts`

## Why this file exists

Everything a browser downloads from `m3mm.net` is public: the page HTML, the
comments inside it, the body of every `is:inline` `<script>`/`<style>` (Astro
copies those through verbatim), and every file under `public/`. A comment that
explains *our* reasoning to *us* explains it to a prospect reading View Source
and to a competitor reading it on purpose.

The bar is **not** "is it a comment." Technical comments earn their place and
stay: a11y math, browser workarounds, JSON-LD rationale, layout landmarks
(`<!-- Media -->`, `<!-- Copy -->`). The bar is:

> **Does a customer or competitor learn something internal?**

Three things always fail that bar and are now blocked by test:

1. **Internal doc and rule references** — `CONVERSION_STANDARDS.md § 4`,
   `DECISIONS.md`, `PENDING_MANUAL`, `LAW #6`. These advertise that a private
   rulebook exists and name its sections.
2. **Repo-internal paths and session bookkeeping** — `src/lib/prefill.ts`,
   `public/_headers`, `perf/lh-mobile-baseline-tick10-*.json`, `tick-16e`,
   `perf strike #5`, `opportunity #11`. These map our tree, our security
   config, and our working process for anyone who wants it.
3. **Funnel and pricing strategy stated about the reader** — "keeps low-budget
   visitors from bouncing," "cheapest lead source (zero CAC)," "downshift."
   A visitor should read the offer, not the segmentation logic being applied
   to them.

Reasoning does not get deleted; it moves here or into the commit message.

## Relocated reasoning

### Self-hosted fonts (`src/layouts/Layout.astro`)

Google Fonts CSS and both preconnects were dropped in favour of two
self-hosted variable `woff2` files (Inter 400/500/600, Space Grotesk 300–700,
latin subset). One variable file covers every declared weight, so two files
replace eight. Serving them same-origin removes the `fonts.googleapis.com`
CSS round trip — measured at **626 ms** in the preview trace that motivated the
change — plus both the `gstatic` and `googleapis` handshakes. JetBrains Mono
was dropped at the same time; `font-mono` falls back to `ui-monospace`.

### Email hydration (`Footer.astro`, `accessibility.astro`, `thanks.astro`)

A raw `mailto:` in server HTML trips Cloudflare's Email Address Obfuscation,
which injects a render-blocking `cdn-cgi` email-decode script into the LCP
critical chain — roughly **200 ms**, confirmed in the Lighthouse mobile
baseline captured under `perf/` (`render-blocking-insight`). Splitting the
address into user/host constants and hydrating on load keeps the address out
of the HTML source. Footer was fixed first; `/thanks` and `/accessibility`
were the same regression closed later. Without JS every one of these links
falls through to `/audit#intake`, so the CTA is never a dead end.

### Case-study proof blocks (`Hero.astro`, `audit.astro`, `thanks.astro`, `TradeLanding.astro`)

Every proof surface renders the same named client outcomes, sourced from the
case-study content collection — never hand-typed into the page. The rule is
"no invented numbers": if a figure is not in the collection it does not ship.
`/audit` is the cold-traffic entry point (visitors there never saw the
homepage Hero), `/thanks` reinforces during the reply wait, and the `/for/*`
trade pages filter the same set to their vertical. Consistency across all four
is deliberate — a prospect who bounces between them must not see different
numbers.

### Two-door chooser and the sub-$500 path (`TwoDoor.astro`, `Services.astro`, `audit.astro`)

Traffic forks under the Hero: custom build (from $500) versus the SiteGuide
template store (under $500). The commercial reason is that a wrong-budget
visitor otherwise bounces instead of routing, and a $0-budget `/audit` visitor
whose review concludes "you need a real site" still leaves with a path to
`/demos`. That reasoning is ours. The page states the two offers and their
prices, and says nothing about which bucket it thinks the reader is in.

### UTM and referral capture (`Intake.astro`)

The hidden `utm_*` inputs travel with the lead POST so the admin email and log
show which video sourced it; the prefill helper in `src/lib/` populates them
from `window.location.search` on load, and unset params stay empty and
validate cleanly. The referral field (added 2026-08-03) is optional, last, and
deliberately quiet so it adds zero friction to the required path; `?ref=<name>`
prefills it so a past client's share credits them without the visitor typing.
The referral block on `/thanks` is placed where the visitor is warmest — it is
the lowest-cost lead source on the site.

### Honeypot (`Intake.astro`)

The intake carries a visually hidden decoy field that real users never fill.
It is no longer labelled as a honeypot in shipped HTML: a comment naming the
trap field tells a scraper exactly which input to skip, which is the whole
value of the trap. The field is asserted by the validation tests.

### SiteGuide widget embed (`Layout.astro`)

The AI guide widget on this site is the same product M3MM sells to clients,
running live as our own proof point. Its per-site config lives in the
SiteGuide repo (`sites/companysite.json`, which is where this origin is
allowlisted), and the CSP allowance for the widget origin lives in this repo's
`public/_headers`. The widget deliberately carries no `[data-cta]` attribute,
because `wireCTAs()` only wires elements with that attribute — its own
open/close/send interactions are intentionally untracked here.

### Sticky mobile CTA (`Layout.astro`)

Mobile-only, hidden on `/audit` (the visitor is already in the intake), fades
in after 260 px of scroll so it does not compete with the Hero CTA, and hides
again when the intake is within one viewport of the top. Desktop is covered by
the Header nav.

### `public/videos/` assets

Scroll loops are `~5 MB` each, H.264, no audio, 1280×720, muted/autoplay/loop
friendly. Filenames are read from the case-study content collection's
frontmatter; a missing file falls back to a "coming soon" tile so the site
never breaks on an unshipped video.

## Adding a comment to a shipped surface

Ask: would I be comfortable if a competitor screenshotted this? If the answer
is no, the reasoning belongs here or in the commit message, and the shipped
comment keeps only the technical fact a future maintainer needs.
