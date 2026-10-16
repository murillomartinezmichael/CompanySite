# Public project development roadmap

Canonical public route: `/roadmap`. Discovery route: `/roadmaps`. Related directory: `/projects`.

**Source of truth:** `src/config/roadmap.ts`, currently documenting 21 tracked launches. Do not make a second competing list of software release statuses.

Statuses:
- `released`: M3MM officially declared a release.
- `testing`: a preview may be reachable, but is not released.
- `next`: next official intended launch.
- `upcoming`: a planned item, not an assertion of development progress.

The timeline's published quarters and dates are targets and may be stale; publishing a date does not prove an actual launch. Change the source ledger only after verifying the latest status.

Projects have stable detail links under `/projects/<slug>`. New project entries should be added to the existing source ledger and checked for slug collisions. Do not conflate project progress with infrastructure procurement or completion.
