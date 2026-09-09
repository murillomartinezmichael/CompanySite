# Tests — CompanySite

- `npm test`: Vitest coverage for functions, CTA contracts, release truth, source
  hygiene, PDF integrity and contrast. As of 2026-09-08: 493 passed, 2 existing skips.
- `npm run build`: generates the static site and runs the shipped-placeholder fence.
- `npm run test:a11y`: run after build; real Chrome + axe on the homepage and `/roadmap/` at 320,
  375, 768 and 1440px, plus chat, overflow, keyboard and no-JavaScript checks.
  Install Chrome or set `CHROME_PATH`. Raw results and screenshots go to
  `output/design-qa/`. No production forms or chat requests are sent.
- `npx astro check`: Astro/TypeScript diagnostics.

The browser gate fails violations and unreviewed incomplete checks. Its one
reviewed chat greeting overlap is retained in JSON and independently checked for
contrast and clipping; see [the design system](../docs/M3_DESIGN_SYSTEM.md).
