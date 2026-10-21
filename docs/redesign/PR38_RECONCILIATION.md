# PR #38 reconciliation

Reviewed pinned head `575a2e5470d13c9f39c73b84a2dbb2918a7ccab9`. The existing PR branch, normal checkout and project owners remain unchanged. This is an isolated candidate reconciliation, not a merge.

| PR38 content | Destination / decision |
|---|---|
| Six primary tabs | Keep the latest owner-requested Home / Services / Projects / Roadmaps / About / Contact structure. Do not reintroduce Environment/Business into the top-level menu. |
| 21 public project entries and detail pages | Preserve the authoritative registry and candidate detail pages; retain the prior resume slug through a redirect. |
| Environment areas | Preserve all six area records at /roadmaps/infrastructure/[area], in the same visual system. |
| Infrastructure phases and milestones | Preserve all six phases and twelve planning milestones without changing their status; expose detailed dependencies in disclosure sections. |
| /environment and /roadmaps/environment | Redirect to /roadmaps/infrastructure. Individual area aliases preserve their destination. |
| /business | Consolidate company strategy into /about, services into /services and products into /projects; keep investor records private. Redirect /business to /about. |
| About page collision | Keep exactly one /about page, src/pages/about.astro. Do not add the competing about/index.astro. |
| Investor showcase references | Do not restore public investor data. Retain the original catalog for approved encrypted import. |
| Navigation styles and tests | Keep the unified candidate design and its actual-route tests, supplemented with alias/content-preservation checks. |

No original work was discarded or relabeled shipped. The untouched source branch and retained PR snapshot remain evidence for later conflict-aware integration.
