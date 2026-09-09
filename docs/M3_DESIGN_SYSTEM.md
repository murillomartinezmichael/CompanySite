# M3MM design system

Version 1 · researched and verified 2026-09-08 · implementation: CompanySite homepage.

Roadmap adoption, 2026-09-08: `/roadmap` now uses these same color and type tokens,
solid page background, readable sentence-case metadata and outlined form controls.
Its ordered timeline and release data remain intact; statuses remain visible text.
The browser gate now covers both routes at all four widths, with route-prefixed
roadmap screenshots in `output/design-qa/`. Release/signup copy distinguishes target
dates and update requests from guaranteed scheduling or automated subscriptions.

This is M3MM's brand system, not Google's Material 3. The public name is **M3MM**;
the meaning is **Modernize. Mobilize. Multiply.** Use the supplied three-fold
`public/mark-light.png` on dark surfaces. Never reconstruct the mark from text.

## Context and design decision

Read before implementation: fleet rules and project inventory, CompanySite's
AGENTS/CLAUDE, README, BRD, TODO, homepage, layout, header, footer, chat, roadmap
data, Tailwind configuration and regression tests; Big7's AGENTS/CLAUDE and
homepage; ResumeSite's CLAUDE, homepage composition, tokens and accessibility runner.

The current implementation supersedes older docs calling the root a single-page
sales funnel. The root is a company headquarters; `/websites` is the sales floor.
Release status comes from `src/config/roadmap.ts`: currently one released hub,
four testing previews, Aries next, and Big7 later pending photography. Styling
must never promote a preview to a release or invent delivery dates or results.

The design plan keeps six core roles: navy ground, navy surface, pale text,
secondary text, muted metadata, teal action. It uses the existing self-hosted
Space Grotesk and Inter. Left-aligned company identity leads; the release summary
supports it; department links lead into the released work, testing and queue.

```text
Wide:   logo / primary navigation / review
        company statement       | release overview
        four department links
        released work
        testing explanation     | previews
        roadmap explanation     | ordered queue
        company close / footer

Narrow: logo / review
        visible primary navigation
        statement / actions / release overview
        department links / released work / previews / queue / footer
```

Plan critique: the existing terminal labels, oversized padded counter, numbered
department tiles and accented half-headline made the hub resemble a generic
status dashboard. The implementation removes that decoration, restores sentence
case, reduces the counter, and makes the supplied logo and company statement the
visual anchor. Department choices are unordered; queue order remains meaningful.
Solid backgrounds make the color contract measurable. No new fonts or animation
library are needed.

## Research translated into rules

| Source | Applied decision |
| --- | --- |
| [W3C contrast minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) | All approved text pairs clear 4.5:1, even headings. Do not rely on the large-text exception to rescue weak metadata. |
| [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Verify a 320 CSS-pixel viewport. Stack the layout and wrap long names without hiding descriptions or navigation. |
| [W3C focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | Preserve the skip link and a visible keyboard outline; invisible sticky controls cannot receive focus. |
| [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | 24px is the WCAG 2.2 AA minimum subject to exceptions; use 44px for standalone navigation and 48px for primary actions in this system. |
| [Atlassian design tokens](https://atlassian.design/tokens/design-tokens) and [typography](https://atlassian.design/foundations/typography/) | Keep named roles and typography values in one configuration. Small text is secondary, not the default reading size. These inform implementation discipline, not M3MM's visual identity. |

## Color tokens and approved combinations

`tailwind.config.mjs` is the implementation source. The homepage's `--hq-*`
variables resolve with Tailwind `theme()`; do not add literal colors in page CSS.
The historic `clay` identifier now means teal and is retained for compatibility.

| Token | Value | Role |
| --- | --- | --- |
| `ink.DEFAULT` | `#0D0E14` | Page ground; text on filled accent buttons |
| `ink.soft` | `#161A24` | Department tiles, release overview, roadmap surface |
| `ink.panel` | `#1D212C` | Testing panel; hover surface |
| `ink.line` | `#262B38` | Decorative dividers only; never the sole control boundary |
| `ink.outline` | `#82879A` | Identifiable outlined controls |
| `bone.DEFAULT` | `#EDEFF3` | Headings and primary text |
| `bone.dim` | `#B7BBC7` | Paragraphs and descriptions |
| `bone.muted` | `#82879A` | Secondary labels at full opacity |
| `clay.DEFAULT` | `#4FB8C7` | Links, focus outline, primary fill |
| `clay.glow` | `#8FD9E3` | Filled-action hover; release emphasis |
| `clay.deep` | `#2E7A85` | Legacy decorative tone; **not approved for homepage text or control boundaries** |

Measured relative-luminance ratios, foreground against background:

| Foreground | Ground | Soft surface | Panel |
| --- | ---: | ---: | ---: |
| Primary text | 16.735 | 15.109 | 13.966 |
| Secondary text | 10.042 | 9.066 | 8.381 |
| Muted text / outline | 5.396 | 4.871 | 4.503 |
| Accent / focus | 8.269 | 7.465 | 6.901 |
| Highlight | 12.112 | 10.935 | 10.108 |

Ground text on accent fill: **8.269:1**; on hover fill: **12.112:1**.
All 17 approved text pairs pass AA's 4.5:1 requirement. Control boundaries and
focus outlines exceed 3:1 on all three surfaces. The muted-on-panel pair has
little margin: do not reduce opacity, brighten its background, or round a failing
ratio up. Decorative separators are not approved as text or essential boundaries.
Other combinations require a fresh measurement; this is not a claim that every
possible palette permutation is accessible.

Method: normalize sRGB channels to 0–1; linearize at 0.04045; use luminance
weights 0.2126/0.7152/0.0722; divide `(lighter + .05)` by `(darker + .05)`.
Tests compare unrounded values in `tests/build/muted-text-contrast.test.ts`.

## Typography, spacing and layout

Space Grotesk carries headings and the brand; Inter carries body, labels and
controls. Use only actual available font weights (display 300–700, body 400–600).
Keep normal sentence case. Reserve tabular numerals for counts, dates and order.

| Role / token | Size at a 16px root | Line height | Weight |
| --- | --- | --- | --- |
| `hq-hero` | fluid 40–72px (`clamp(2.5rem,5.5vw,4.5rem)`) | 1.04 | 500 |
| `hq-section` | fluid 32–48px | 1.12 | 500 |
| `hq-title` | 24px | 1.25 | 500 |
| `hq-lede` | 18px | 1.65 | 400 |
| Body / actions | 16px | body 1.65; action 1.5 | 400 / 600 |
| `hq-small` | 14px | 1.6 | 400 / 600 |
| `hq-label` | 13px | 1.5 | 400 / 500 |

The overview count is a single 64px display numeral, not a reusable heading.
Titles use -0.025em tracking; the hero uses -0.035em. Body lines cap at 65ch;
hero prose caps at 56ch. Font loading stays same-origin with `font-display: swap`.

Use the existing Tailwind spacing steps: 4, 8, 12, 16, 24, 32, 48 and 64px.
`spacing.hq-section` is a fluid 48–80px section inset. The page container remains
1152px maximum with 20px mobile and 32px larger-screen gutters. At 980px, hero,
ledger and roadmap stack and departments become two columns; at 640px,
departments and previews become one column. Content wraps instead of clipping.
Control radius is 6px; grouped panels use 12px; department tiles remain square.

## Component contract

- **Header:** the supplied mark, primary links and review action stay visible.
  Navigation wraps into a second row on narrow screens; no JavaScript menu dependency.
- **Hero:** one h1 and one concise explanation. Primary action targets Released;
  secondary action opens the roadmap. No decorative headline accent or timed entrance.
- **Department tile:** one full-card anchor with heading, explanation and destination
  label. Hover changes surface; keyboard uses the global outline. Do not nest controls.
- **Release ledger:** an ordered list backed by roadmap data. Text says Released;
  a colored dot is redundant. Each external action has a specific accessible name.
- **Testing panel:** a labeled section with testing text on each item. Approved
  accent replaces the old low-contrast deep teal. A reachable URL is not a release.
- **Roadmap:** an ordered list; dates, year and status remain text. Descriptions
  remain available at mobile width. Never invent a launch promise to fill a row.
- **Buttons and links:** native anchors navigate; buttons perform actions. All CTAs
  retain `data-cta` and their existing intent. Filled actions use ground text;
  outlined actions use `ink.outline`. Inline links are underlined. Do not show a
  decorative border as though it were an accessible input boundary.
- **Focus and motion:** global 2px accent outline with 3px offset. Interaction
  transitions last 150ms; reduced-motion disables homepage transitions and smooth
  scrolling. Sticky review uses `visibility: hidden` until available, and belongs
  to a named Quick contact landmark. This also repairs its shared-layout behavior.
- **Forms/chat:** retain associated labels, named icon controls, live feedback and
  existing request behavior. This homepage pass does not redesign intake or change
  lead, payment, tracking or chat APIs. Reuse the existing widget.
- **Footer:** keep policies, accessibility and contact reachable. The shared footer
  retains its existing styling with homepage bottom clearance for fixed controls;
  it is included in homepage browser verification.

## Related sites: share discipline, preserve the buyer's context

**2026-09-09 adoption update:** CompanySite now uses Astro 7.3.2 and Tailwind 3.
The structure pass extends `hq-section` spacing to shared sales sections and
public page wrappers, `hq-hero` to the sales/campaign/receipt headings, and the
existing panel/control/outline contract to shared UI. Every page has visible
primary navigation without JavaScript. Footer clearance applies site-wide.
SectionNav and RoadmapTimeline follow these tokens; no new accent is introduced.
The table and dated verification below describe the original September 8 pass.
Current evidence and remaining legacy type/radius inventory are in
`STRUCTURE_AUDIT_2026-09-09.md` and `STRUCTURE_VERIFICATION_2026-09-09.md`.
The subsequent Astro migration is complete; remaining dependency advisories are
the separately recorded Vitest/SVGO patch gate in `../PENDING_MANUAL.md`.

| Site | Existing implementation | Adaptation boundary / next work |
| --- | --- | --- |
| CompanySite | Astro 5, Tailwind 3; headquarters plus `/websites` sales department | This pass applies the system to `/`. Preserve the complete sales funnel and its anchors. Other pages keep their existing display tokens. |
| Big7Construction | Static HTML, inline CSS and shared `big7.js`; commercial and residential buyer paths | Keep its construction typography, client palette and two-lane chooser. Port semantic roles, type hierarchy and measured contrast when that site is upgraded. Real jobsite photos and business contact data remain prerequisites; do not copy the M3MM teal brand or introduce a framework. |
| ResumeSite | Astro 4 and Tailwind; Space Grotesk/Inter with signal blue | Keep recruiter-focused experience and proof, its source resume data and exact owner PDF. Reuse accessible scale and spacing principles; audit blue pairs in that site's context before adoption. |

Big7 and ResumeSite were read for context, not edited or certified by this pass.
This document is not evidence that the entire GitHub directory has been upgraded.

## Verification and handoff

Run from CompanySite:

```sh
npm test
npm run build
npm run test:a11y
npx astro check
```

The browser runner adapts ResumeSite's existing local static-server/Chrome pattern.
It requires Chrome (or `CHROME_PATH`), uses local built output, and blocks outbound
requests. Only local tracking requests are stubbed; no lead or chat is submitted.
It asserts the actual homepage heading before auditing, so a directory listing
cannot produce a false pass. Evidence and viewport screenshots are written to
ignored `output/design-qa/`, including `axe-home.json`.

2026-09-08 results: **493 passed, 2 existing skips**; **13 pages built**; placeholder
fence clean. Axe-core **4.13.0**: **0 violations and 0 incomplete checks on the
closed-chat homepage** at 320, 375, 768 and 1440px. No horizontal overflow or
browser errors. Astro check: **0 errors, 0 warnings, 0 hints**. Skip navigation, focus outline, reduced motion and 375px navigation
without JavaScript passed. Hero, departments, releases, roadmap, footer and chat
screenshots were captured for review.

Open chat also has **0 violations**. Axe flags its greeting's wrapped inline link
as a partial-overlap contrast item. Screenshots show a readable, unclipped message;
the runner retains the raw incomplete result and independently checks its bounds
and computed contrast: **8.38:1 text, 6.90:1 link**. Only this specific reviewed
node is accepted; other incomplete results and every violation fail the gate.
Automated results do not replace assistive-technology user testing or certify the
rest of the fleet.

The dependency audit still reports the existing Astro major-version debt (one
high and one low package finding). No forced major upgrade was bundled into this
design change. Follow the existing Astro migration task in TODO.md.

Prepared locally on `design/m3-system-2026-09-08`. Production deployment remains
a separate owner-approved step; no release status was changed.
