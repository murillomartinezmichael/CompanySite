# M3MM performance design — September 9, 2026

Michael's latest instruction replaces the earlier restrained teal/clay direction:
neon green, blue and black, with the mechanical character of his 2021 Polaris
Scrambler XP 1000 S. This is a visual reference, not a vehicle specification or
permission to use Polaris branding. Existing claims, prices and release states
remain the content authority. Local implementation only.

## Plan, reviewed before implementation

Palette: black ground, graphite surface, white text, readable silver secondary
text, electric lime actions, electric blue secondary navigation and testing.
Exact named values live only in `tailwind.config.mjs`. The old `clay` identifier
is retained as a compatibility alias for lime. Space Grotesk carries confident,
tighter display type; Inter keeps paragraphs and controls readable.

Wide home: identity and argument | dimensional animated track sculpture;
release overview strip; department directory; official release; testing;
roadmap queue; closing. Narrow: same reading order, compact sculpture, wrapping
navigation. All text is left aligned. Sales keeps its established conversion
order, with section navigation and a distinct visual proof column. Roadmap
keeps all 21 entries while adding status filters and a clearer next-launch
summary; all entries remain readable without JavaScript.

Critique: a lime token swap on the existing boxes would not fulfill this brief.
The distinguishing element will be a layered, angular track sculpture, using
blue sidewalls and lime rails to suggest mechanical motion. It is decorative,
separate from the immutable logo, and does not represent product capabilities.
Quiet reading surfaces surround it. Repeated scroll fades will be removed;
motion concentrates in the sculpture and direct interaction feedback.

## Findings → evidence → fix → priority

1. **Logo mismatch.** Header, footer, hero, intake and hub pages use
   `mark-light.png`; Michael supplied an immutable black-on-white PNG. Use an
   exact byte-for-byte public copy, without cropping, filters or effects. P0.
2. **Inconsistent navigation context.** Header changes its link set according
   to `minimal`; visitors lack a consistent route between departments. Use one
   wrapping primary navigation, current-page indication and visible breadcrumbs
   on secondary pages. Preserve local sales/roadmap jumps. P1.
3. **Home visual emphasis.** The largest object beside the statement is a
   padded release counter. Move facts into a compact status strip and use the
   primary visual space for the requested motion identity. P1.
4. **Roadmap scanning.** Twenty-one entries across quarters require a long
   sequential read. Add progressively enhanced, explicitly labeled status
   filters and a result count, preserving target-date language and no-JS order. P1.
5. **Sitewide rhythm.** Shared panels and actions have one uniform treatment;
   secondary pages need navigation and reading hierarchy. Introduce shared
   surface/action/intro rules, distinct sales and editorial layouts, and a
   better footer directory. P1.
6. **Motion and QA.** Existing reveal classes hide content until script runs;
   homepage QA misses the new roadmap receipt. Default content to visible,
   provide a persistent motion switch, honor reduced motion and pause sculpture
   outside the viewport; extend QA to all 15 routes. P0.

No pages will be deleted. The complete route/job/CTA/link map remains in
`STRUCTURE_AUDIT_2026-09-09.md`; `/roadmap/thanks` is an intentional noindex
form receipt, reached from the roadmap POST/JS success flow.

## Implementation result

All six findings above are implemented and verified locally. The final critique
kept the sales CTA ahead of artwork on mobile, exposed package actions at small
widths, and removed SVG/caption overlap. Retired sharing art was also found to
carry the wrong mark; active sharing metadata now uses the original PNG with
1024-square dimensions. Full output and limits: PERFORMANCE_VERIFICATION_2026-09-09.md.
