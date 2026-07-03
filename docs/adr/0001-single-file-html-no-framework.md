# ADR-0001: Single-file HTML, embedded CSS, inline JS — no framework

**Status:** Accepted
**Date:** 2026-07-03
**Author:** Michael Martinez
**Deciders:** Michael Martinez

## Context

CompanySite (`mm3m.net`) is Michael's own Offload Labs marketing site. It has to do three things at once:

1. **Sell the shop.** Distinctive design that a reviewer / prospect remembers.
2. **Convert.** Real intake form. Tier pricing. Live quote builder. Interactive scoping wizard. FAQ. Bright-color health warning. Tabbed Build-Your-Own section.
3. **Deploy cheap and fast.** Railway free tier, nginx-static, no build pipeline. Any change is a git push.

The interactive features (scoper, quote builder, tab switcher, intent-CTA prefill) tempt a framework choice. React or Astro would give component reuse, a proper state model, easier testing. But every framework choice adds a build step, a node_modules directory, and a runtime bundle shipped to the visitor.

The site is Michael's *own* marketing surface — the constraint is that anyone reading `index.html` should be able to follow the whole thing without knowing React. It's also a portfolio piece: "I built a converting marketing site in one file with no framework" is more impressive than "I used Next.js like everyone else."

## Decision

We will ship CompanySite as **`index.html` — a single ~5000-line file with embedded `<style>` and inline `<script>` IIFEs** — served by `nginx:alpine` on Railway. No framework, no build step, no bundler.

## Alternatives considered

### Astro
- **Pro:** Component reuse across the sections. Type-safe content collections. Same shape as [`AriesOutdoorLiving-V2/`](../../../AriesOutdoorLiving-V2/) — consistency across the fleet.
- **Con:** Build step. `dist/` folder. Node dependency. The interactive features (quote builder, scoper) either need Astro Islands (client:load) or vanilla JS islands, at which point most of the "framework benefit" evaporates.
- **Why not:** The interactive features are the interesting content. Building them as vanilla JS IIFEs demonstrates the craft directly. Astro would hide it behind a framework abstraction.

### Next.js + React
- **Pro:** Standard hiring signal. React state model for interactive features. `useState` for the quote builder feels natural.
- **Con:** 100+ KB React bundle shipped for what is fundamentally content. Lighthouse Performance takes a hit. Overkill for a site that mostly renders static HTML.
- **Why not:** Same reasoning as Astro but stronger — Next.js is at the far end of "framework overhead" and this site is at the near end of "framework need."

### Framework-in-templates (Handlebars + gulp)
- **Pro:** Template reuse without full framework runtime.
- **Con:** Adds a build step (gulp/webpack), still no client-side framework, still shipping mostly static HTML.
- **Why not:** All of the cost, none of the interactive-feature win. If we're going to add a build step, we go all the way to a real framework.

## Consequences

### Positive
- **Zero JS shipped to visitor for hot paths.** The interactive IIFEs (quote builder, scoper, tab switcher, CTA prefill) are all vanilla JS totaling ~30 KB inline, no runtime dependency.
- **Any developer can read the source top-to-bottom** and understand the whole site in an hour. No React knowledge required.
- **`nginx:alpine` on Railway deploys in ~30 seconds.** Push to main, Railway rebuilds, live. No CI/CD wiring.
- **Portfolio piece.** The site itself argues for the "one engineer, custom code, no framework needed" positioning. It IS the pitch.
- **Portable.** Works from any static host (Cloudflare Pages, GitHub Pages, S3). Not locked to Railway.

### Negative / trade-offs accepted
- **File is long (~5000 lines).** Editors need to jump around via search. Not a problem for one file; would be a problem at ten.
- **No component library.** Every section is hand-styled. When we redesign the § headers, we edit every occurrence. Acceptable at this scale.
- **CSS + JS + HTML in one file** means larger initial payload than a split-and-cache approach. At CompanySite's traffic volume the difference is unmeasurable.
- **No type safety on the JS.** The intent CATALOG object could have a typo. Mitigated by all keys being referenced via `data-intent` attributes in HTML that a grep finds.

### Neutral
- **Escape hatch:** if the file passes the ~10000-line threshold or the interactive features grow to need shared state, the natural next step is Astro with the interactive parts as vanilla-JS islands, ported one section at a time.

## References

- [`CLAUDE.md`](../../CLAUDE.md) — enforcement rule: "No JS framework, no build step"
- [`../../index.html`](../../index.html) — the entire site
- [`../../Dockerfile`](../../Dockerfile) — `FROM nginx:alpine`
- Related standard: [`../../../docs/CONVERSION_STANDARDS.md`](../../../docs/CONVERSION_STANDARDS.md) — the every-CTA-converts pattern this site is the reference implementation of
- Sibling: [`../../../Big7Construction/CLAUDE.md`](../../../Big7Construction/CLAUDE.md) — same shape, simpler content
- Related: [`../../../SiteGuide/CLAUDE.md`](../../../SiteGuide/CLAUDE.md) — SiteGuide is the "framework-required" sibling (FastAPI backend), embedded into CompanySite via one `<script>` tag
