# M3MM design system

Version 2.1 · September 9, 2026 · all CompanySite pages.

Michael explicitly requested neon green, blue and black with animation inspired
by his 2021 Polaris Scrambler XP 1000 S. This supersedes Version 1's restrained
teal-only and no-neon rules. The archived legacy site remains read-only; this is
an Astro implementation of the new direction. See `DESIGN_DIRECTION_2026-09-09.md`
for the initial plan and findings. `ORBIT_DESIGN_2026-09-09.md` records the later
owner-directed professional/galaxy refinement and roadmap redesign; D-CS-012
is its decision receipt.

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
uses `hq-label` or `hq-small`; no extra font downloads. The hero is fluid 40–72px,
section headings 32–48px. Use `hq-title`, `hq-lede` and the shared type scale.

`container-page`: 1280px maximum, 20px mobile/32px larger gutters. Section rhythm
uses `spacing.hq-section` (48–80px). Controls use an 8px radius; grouped surfaces
16px. Standalone targets are at least 44px tall, primary buttons at least 48px.
The homepage particle field may expand on desktop, but prose and primary actions
remain first in mobile reading order. At 320px every page must reflow.

## Component contracts

- Header: same four visible destinations everywhere, current-page indication,
  review action, complete original logo. Wrapping navigation needs no script.
- Breadcrumb: each secondary page uses Layout's existing breadcrumb data for
  visible navigation as well as structured data. Receipt pages stay noindex.
- Home: statement and particle field, compact release facts, department directory,
  Released ledger, Testing previews, roadmap queue, company close.
- Sales: Hero → TwoDoor → Proof → Services → FAQ → Intake. Section jumps help
  returning buyers reach proof/pricing/form; preserve all existing anchors.
- Roadmap: release explanation and counts alongside a next-launch spotlight with
  a decorative animated release path. Desktop has a sticky release-group directory;
  mobile has wrapping jump links. Optional status filters precede grouped native
  build disclosures. Released and next builds start expanded; testing and planned
  builds expand on demand, including without JavaScript. Filter transitions are
  short, canceled on rapid input and disabled by motion preferences. Quarter jumps
  reset filters before navigation. The follow form closes the board.
- Forms: solid reading surfaces, persistent labels, visible borders and focus.
  Preserve validation, error messages, endpoint and receipt destinations.
- Footer: two-column directory on mobile, three on desktop, full email row,
  brand and motion control. Keep content clear of floating chat/review controls.

## Motion and accessibility

Decorative motion is concentrated in the orbital particle field and roadmap's
release path. `KineticTrack` retains its import contract while rendering a canvas
field with static SVG fallback; `ReleasePath` is a small decorative SVG. Neither
is the logo. Canvas rendering caps at 30fps and 1.5 DPR, with fewer mobile particles;
it stops when hidden, offscreen or paused. Artwork is hidden from assistive
technology, static without JavaScript and paused by a persistent user control. OS reduced motion
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
