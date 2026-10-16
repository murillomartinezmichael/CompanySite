# Content inventory and migration map

Reviewed in the CompanySite Astro repository on 2026-10-16.

| Existing content | Action | Public destination |
| --- | --- | --- |
| Hub homepage, release ledger and testing previews | Retain; simplify department directory and roadmap entry points | `/` |
| 21-item official launch queue, filters, preview stage and subscriber form | Preserve intact, add link to other roadmap | `/roadmap` |
| Website sales, sector landing pages, audit, pricing and intake | Preserve independent conversion funnel | `/websites`, `/for/*`, `/audit`, `/start` |
| Investor showcase builder/output | Keep existing detailed experience; add concise entry page | `/investors/`, `/business` |
| Career/resume information | Keep route and downloads | `/resume`, linked via `/about` |
| Policy and accessibility library | Preserve and link contextually | `/policies`, `/accessibility` |
| Release records | Reuse as searchable public project directory with one page per item | `/projects`, `/projects/[slug]` |
| Proposed homelab/environment work | Create public-safe overview and six area guides | `/environment`, `/environment/[section]` |
| Infrastructure milestones | New distinct data model | `/roadmaps/environment` |
| Existing acknowledgement/receipt pages | Keep unchanged | `/thanks`, `/roadmap/thanks`, `/start/thanks` |

Not migrated: private devices, IP addresses, internal operational records, unverified cost numbers or projected financial performance. No existing public route is intentionally deleted.
