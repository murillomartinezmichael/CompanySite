# Light-mode label contrast repair — 2026-10-04

## Scope and source

Base: CompanySite `22b9c8dcec6667b9022735c7247b89895f46fcb2`.
CI run `37072938310`, job `111056341140`, built 15 pages and passed
616 tests (9 existing skips), but its browser gate failed 20 combinations:
`/websites/`, `/audit/`, `/thanks/`, `/for/home-services/`, and
`/for/outdoor-living/`, each at 320, 375, 768, and 1440 pixels.

Downloaded artifact `11256021583` matches the recorded SHA-256
`d2864fa0f5cae4cb3a90c937799cccd02d5572cb68096d35d2c94151ea00fef8`.
Its `axe-home.json` identifies every offending label as `text-clay/80`:
4.08:1 on the page ground and 4.27:1 on white cards. The previous token test
only covered fully opaque colors, so it passed while the browser gate failed.

## Repair

Dark colors and all markup remain unchanged. Deepen the light palette's clay
foreground and hover foreground so the existing 80%-opacity labels clear 4.5:1
on page, card, and alternate-panel surfaces. Preserve the same token roles and
CSS-variable machinery. No forms, API code, pricing, logo, dependencies,
release status, or existing PR #27 delivery work is changed.

The existing contrast test now covers alpha-composited foregrounds in both
themes and reproduces the two actual failing Chrome foreground colors.
Original full-opacity text, button, and control-boundary checks remain intact;
no accessibility exclusions or lowered thresholds are introduced.

## Pre-push evidence

Both baseline files were reconstructed from the pinned GitHub source and
matched their Git blob hashes before editing:

- `tailwind.config.mjs`: `15852ebffe324487f00a69fdf19383664c70492d`
- `tests/build/muted-text-contrast.test.ts`: `e1ba79319931dd4e24631e27f72a869fe40013b1`

An isolated Node 22.16.0 assertion check of the imported palette evaluated
68 actual token pairings. Before: three failing 80%-opacity light foregrounds
(4.0891, 4.2760, 3.8649), exit 1. After: all 68 pass, exit 0; the lowest light
label ratio is 4.6397. These are numeric checks, not a browser or Vitest run.
Node syntax checks pass for the configuration and the TypeScript test.

## Verification and release boundary

Run the existing CI build, unit tests, and browser gate on the PR candidate.
A shared palette change warrants the existing route/viewport browser matrix;
do not rerun unrelated fleet suites. Record the exact CI head, commands,
conclusions, and browser artifact in the PR before claiming verification.
Inspect the built artifact's changed flow and theme toggle without sending
real inquiries, model requests, analytics, emails, or payments.

No production deployment or provider configuration is authorized by this
repair. Production smoke is NOT RUN here; candidate evidence is not live
release evidence. Preserve independent review and the existing delivery,
content, payment, and owner gates. Rollback is a reviewed revert of this
bounded change, never a reset of other agents' work.
