# M3MM design system

Version 2 · September 9, 2026 · all CompanySite pages.

Michael explicitly requested neon green, blue and black with animation inspired
by his 2021 Polaris Scrambler XP 1000 S. This supersedes Version 1's restrained
teal-only and no-neon rules. The archived legacy site remains read-only; this is
an Astro implementation of the new direction. See `DESIGN_DIRECTION_2026-09-09.md`
for the plan, critique and prioritized findings, and DECISIONS.md for authority.

## Identity and content

The written brand is **M3MM**. **Modernize. Mobilize. Multiply.** keeps its order.
`public/official-logo.png` is the exact user-supplied original, including its
white background. SHA-256:
`27c7c0c1a8c069e4ea38c87a41c7a6d1523d00ebbde4c5e9eb6637372ec24e97`.
Display the complete square at its original aspect ratio. No filters, clipping,
recoloring, tracing, animation or generated variants. Favicon, touch icon and social sharing metadata use
that same original file. Retired sharing art is no longer referenced. KineticTrack is separate decorative artwork, not a logo.

Claims, service prices, client proof, referral terms and release status are
unchanged. `src/config/roadmap.ts` remains the authority for all 21 tracked builds.
Testing must always be labeled in words. Planned dates are targets, not promises.
The home remains a company hub; `/websites` remains its complete sales department.

## Tokens

All literal palette values live in `tailwind.config.mjs`; CSS uses `theme()`.

| Role | Token | Use |
| --- | --- | --- |
| Black | ink.DEFAULT | Page, form fields, text on accent fills |
| Graphite | ink.soft / ink.panel | Reading surfaces and grouped content |
| White / silver | bone.DEFAULT / dim / muted | Primary, body and metadata text |
| Lime | clay.DEFAULT / glow | Primary actions, released/next state, focus |
| Blue | electric.DEFAULT / glow | Wayfinding, testing, supporting artwork |
| Boundaries | ink.outline | Visible controls |
| Dividers | ink.line | Decorative separators, not control boundaries |
| Deep colors | clay.deep / electric.deep | Decoration only, never small text |

`clay` is a compatibility identifier for lime. All three text roles and both
bright accent families must exceed 4.5:1 on all three ink surfaces. Ground text
on either bright accent fill must exceed 4.5:1. Essential boundaries exceed 3:1.
Automated calculations live in `tests/build/muted-text-contrast.test.ts`; browser
axe tests measure rendered pages as well. Do not reduce text opacity casually.

## Type and layout

Self-hosted Space Grotesk for display; Inter for body and controls. Keep sentence
case, left alignment, readable paragraph lengths (65–70ch maximum). Metadata
uses `hq-label` or `hq-small`; no extra font downloads. The hero is fluid 40–80px,
section headings 32–48px. Use `hq-title`, `hq-lede` and the shared type scale.

`container-page`: 1152px maximum, 20px mobile/32px larger gutters. Section rhythm
uses `spacing.hq-section` (48–80px). Controls use a 3px radius; grouped surfaces
8px. Standalone targets are at least 44px tall, primary buttons at least 48px.
The homepage sculpture may expand on desktop, but prose and primary actions
remain first in mobile reading order. At 320px every page must reflow.

## Component contracts

- Header: same four visible destinations everywhere, current-page indication,
  review action, complete original logo. Wrapping navigation needs no script.
- Breadcrumb: each secondary page uses Layout's existing breadcrumb data for
  visible navigation as well as structured data. Receipt pages stay noindex.
- Home: statement and sculpture, compact release facts, department directory,
  Released ledger, Testing previews, roadmap queue, company close.
- Sales: Hero → TwoDoor → Proof → Services → FAQ → Intake. Section jumps help
  returning buyers reach proof/pricing/form; preserve all existing anchors.
- Roadmap: release explanation, status overview, quarter jumps, optional status
  filters, quarter timelines, follow form. Filters hide only matching views;
  no-JS readers get all builds. Quarter jumps reset filters before navigation.
- Forms: solid reading surfaces, persistent labels, visible borders and focus.
  Preserve validation, error messages, endpoint and receipt destinations.
- Footer: two-column directory on mobile, three on desktop, full email row,
  brand and motion control. Keep content clear of floating chat/review controls.

## Motion and accessibility

Decorative animation is concentrated in the dimensional track artwork. The
artwork is hidden from assistive technology, static without JavaScript, stopped
outside the viewport and paused by a persistent user control. OS reduced motion
always overrides the enabled preference. The control is hidden when JS is off.
No flashing, glitch effects, pointer trails, scroll hijacking or auto-scrolling.
Reading content is immediately visible; `.reveal` no longer hides content.

Keep skip navigation, native keyboard interaction, visible focus, form labels,
WCAG AA contrast, reduced motion and native no-JS navigation. Filters expose
pressed state and announce the number of shown builds. Do not infer release
status from color alone. All CTA links/buttons need `data-cta`.

## Verification

Build including placeholder fence, Vitest, all-route axe at 320/375/768/1440,
canonicals, and actual visual review. Inspect home, roadmap and sales screenshots
at 375 and 1440; inspect other page types too. Exercise motion pause/persistence,
OS override, status filters and quarter-reset behavior in a browser. No external
forms, analytics or production APIs may be contacted in local QA.
