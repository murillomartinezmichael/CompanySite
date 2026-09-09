# Tests — CompanySite

- `npm test`: Vitest coverage for functions, CTA contracts, release truth, source
  hygiene, PDF integrity and contrast. As of 2026-09-09: 506 passed, 2 existing skips.
- `npm run build`: generates the static site and runs the shipped-placeholder fence.
- `npm run test:a11y`: run after build; real Chrome + axe on `/`, `/roadmap/`,
  `/websites/` and `/compare/website-options/` at 320,
  375, 768 and 1440px, plus chat, overflow, keyboard and no-JavaScript checks.
  Install Chrome or set `CHROME_PATH`. Raw results and screenshots go to
  `output/design-qa/`. No production forms or chat requests are sent.
- `npx astro check`: Astro/TypeScript diagnostics.

The browser gate fails violations and unreviewed incomplete checks. Its one
reviewed chat greeting overlap is retained in JSON and independently checked for
contrast and clipping; see [the design system](../docs/M3_DESIGN_SYSTEM.md).

The Aries preview has no audio (verified with ffprobe on 2026-09-09), and its
adjacent case-study text describes the work. The runner records axe's caption
review, requiring the exact reviewed asset SHA-256 plus its accessible name and
description before accepting that incomplete result. Changing the video requires
a new review. No violations are suppressed. CI runs the browser gate after the
build/tests and uploads its evidence, including on failure.
