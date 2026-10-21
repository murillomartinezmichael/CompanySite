# CompanySite old-to-new content map

Baseline: `d00397fe2b3ba738a2018601759e52d790f7bdb4`. Inventory completed before implementation. This isolated candidate does not change another agent's checkout or deployment.

| Existing route | New destination | Preservation decision |
|---|---|---|
| /accessibility | /accessibility | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /audit | /audit (free-review entry) | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /compare/website-options | /compare/website-options | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /for/construction | /for/construction | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /for/home-services | /for/home-services | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /for/outdoor-living | /for/outdoor-living | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| / | / | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /investors/accessibility | /accessibility | Original generator, catalog, media and planning source retained; removed from public build. Private content import requires approved storage and owner authorization. |
| /investors | /workspace/investor-ledger; portfolio retained for approved private import | Original generator, catalog, media and planning source retained; removed from public build. Private content import requires approved storage and owner authorization. |
| /investors/infrastructure | /roadmaps/infrastructure (public summary); /workspace/operations/infrastructure (internal details) | Original generator, catalog, media and planning source retained; removed from public build. Private content import requires approved storage and owner authorization. |
| /policies | /policies | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /resume | /about and /resume | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /roadmap | /roadmap (Project Roadmap), /roadmaps (index) | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /roadmap/thanks | /roadmap/thanks | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /start | /start (existing checkout gate) | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /start/thanks | /start/thanks | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /thanks | /thanks | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |
| /websites | /websites (specialist service) | Existing content and working endpoints retained or consolidated; redesigned shared shell and page-specific hierarchy. |

## Feature mapping

- All 21 approved public release entries remain in `src/config/roadmap.ts`; the public Projects directory and individual detail pages reuse that record. No release-status changes.
- The 43-entry investor portfolio, captioned overviews, narrated demonstrations and associated qualifications remain under `investor-preview/`. They are not discarded or republished. Their safe import destination is the private operational catalog after content review.
- Hero-wide repeated release lists consolidate into Projects; Home shows a small selection and a clear service/contact path.
- Both roadmap tracks have their own public pages. Public infrastructure describes readiness stages, not network addresses, device identities, budgets or funding terms. Existing detailed build/operating-cost scenarios remain quarantined for the private Operations area.
- Sales tier prices, payment policy, refund boundaries, SiteGuide ownership, trade entry points and `/start` checkout gate are preserved.
- `/api/lead`, `/api/chat`, `/api/track`, inquiry idempotency, recovery, attribution and lead delivery logic remain intact. Browser tests intercept all external effects.
- Intake and roadmap signup reuse their original browser submission handlers and success paths.
- Resume data and the vendored PDF remain unchanged. Policy wording and accessibility contact are retained.
- Private finance has separate navigation, no analytics/chat, runtime-only data APIs, owner authorization at pages/API/download boundaries, and no real records in source or fixtures.

## Added routes

`/services`, `/projects`, `/projects/[slug]`, `/roadmaps`, `/roadmaps/infrastructure`, `/about`, `/contact`, and the owner-only `/workspace` views. Old `/websites` and `/roadmap` links continue to work.

## Approval gates

No real finance or investor records imported. No authentication provider, private store, paid feed, scheduled valuation, investor access, deployment, push or merge activated. Legacy internal content is preserved for review, not treated as newly approved public material.
