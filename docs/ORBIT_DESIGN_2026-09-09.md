# M3MM orbit refinement — September 9, 2026

Michael's feedback: the previous version looks cool, but the desired standard
is clean, professional, futuristic design with fluid animation comparable in
craft to the galaxy animation he associates with Astra. This is an aesthetic
reference, not a claim that we have inspected or reproduced that interface.

## Plan before implementation

Retain the owner-approved black, blue and lime tokens and immutable original
logo. Move from angular stacked plates to a luminous particle field with fine
orbital filaments, depth, slow rotation and gentle pointer response. Blue leads
the artwork, lime appears as an occasional light trail and primary action color.
Text stays on solid surfaces. No image or video download, new framework, or
animation dependency is needed.

Space Grotesk remains the display face; Inter handles interface labels and body.
Reduce terminal-like label styling, loosen the main container, and create a
two-column department directory with stronger reading hierarchy. Preserve sales
CTA-first mobile order, the release strip, truthful status separation, form
behavior and all page routes.

Wide: statement/actions | luminous field; compact release facts; department
directory; released work; testing; queue. Narrow: statement/actions first, a
bounded visual, then the same sequence. Avoid background animation behind copy.

Critique: a generic rotating sphere alone would repeat the problem of a visual
unrelated to the company. Three interwoven streams echo Modernize, Mobilize,
Multiply without redrawing the logo. Structure does the practical work: clear
company doors, visible price actions, and accessible filters. The surrounding
interface becomes quieter so the focal motion can carry the identity.

## Rendering and quality contract

- Deterministic geometry, static SVG fallback, canvas enhancement.
- Particle count and pixel density bounded on mobile; render at up to 30fps.
- No animation frame scheduled when paused, offscreen or in a hidden tab.
- OS reduced motion overrides manual enable; preference survives navigation.
- Pointer response only on fine-pointer devices; never moves text or controls.
- Canvas failure leaves a meaningful decorative static fallback, not a blank box.
- Verify changing pixels during motion, identical pixels during pause, no-JS
  fallback, keyboard interaction and all routes at the four existing widths.

## Fleet application

The company-wide standard is quality, not identical artwork. Adopt legible
structure, deliberate typography, purposeful motion, honest content and measured
mobile behavior. Product-specific rollout and non-changes must be stated
explicitly; this implementation begins with CompanySite.

## Roadmap findings → evidence → fix → priority

| Finding | Evidence before this refinement | Implemented fix | Priority |
| --- | --- | --- | --- |
| The next launch lacks a clear focal point | Launch facts precede a long sequence of equally weighted timeline rows | Source-derived Aries spotlight with moving release path and jump to its details | P1 |
| Twenty-one expanded rows make the queue hard to scan | All descriptions compete with the title, date and release status | Native details: released/next open initially; testing/planned expand on demand | P1 |
| Group navigation loses context down the desktop page | Quarter jumps live only above the list | Sticky desktop directory; wrapping native mobile links | P1 |
| Filtering changes a large list abruptly | Existing controls hide/show rows immediately | Brief staggered transitions, rapid-input cancellation and reduced-motion bypass | P2 |
| Status, timing and category need a consistent hierarchy | Previous timeline shares little visual alignment with the new shell | Date column, status/category line, build title and indented detail body | P2 |

No page or roadmap entry was removed. The 21-entry source, release states,
dates, descriptions, service pricing and form endpoints remain unchanged.
Expand/collapse and filters add no progress percentages or new capability claims.

The first 375/1440 screenshot review confirmed clean text surfaces, a bounded
focal graphic and stacked mobile reading order. Final checks and reviewed
screenshots are recorded in `ORBIT_VERIFICATION_2026-09-09.md`.
