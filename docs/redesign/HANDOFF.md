<!-- ACTIVATION-WORK-CURRENT -->
## Current approved activation checkpoint

Read `ACTIVATION_WORK_STATUS.md` and `PR38_RECONCILIATION.md`. The provider/media adapters and encrypted-recovery preparation are implemented; live identity, R2 enrollment, production key custody and an authorized valuation source/scheduler remain unverified. The six-area infrastructure reconciliation replaces duplicate high-level stages with the retained detailed readiness ledger. A clean source review branch is being verified separately; the original checkout and PR38 are unchanged. No real records or keys have been imported.
<!-- /ACTIVATION-WORK-CURRENT -->

<!-- APPROVED-DB-PREP-20261020 -->
## Approved setup progress — 2026-10-20

The owner approved the current project scope. A separate Cloudflare D1 database named `m3-companysite-finance` now exists with the reviewed schema and verified empty application tables. It is not bound to a deployed app, contains no financial records and does not yet have verified production key custody/recovery. Actual owner authentication, real-data acceptance, scheduler/source configuration and conflict-aware release verification remain required. See `APPROVED_ACTIVATION_STATUS.md` and the approval receipts. Historical approval-pending statements below are superseded for this bounded scope only.
<!-- /APPROVED-DB-PREP-20261020 -->

<!-- OWNER-APPROVAL-20261020 -->
## Owner approval received

The owner approved proceeding with the current CompanySite activation and release scope on 2026-10-20. See `docs/redesign/OWNER_APPROVAL_2026-10-20.md`. Repeated approval is no longer the blocker for that scope; required credentials, concrete configuration details, source facts and technical verification still are. Preserve owner-only access and existing no-trading/no-unspecified-spending boundaries.
<!-- /OWNER-APPROVAL-20261020 -->

<!-- PRIVATE-CONTINUATION-20261020 -->
## Latest continuation

Start with `output/redesign/CONTINUATION_REVIEW.html`, `docs/redesign/CONTINUATION_CHECKLIST.md` and `PRIVATE_ACTIVATION_RUNBOOK.md`. The private backend, encrypted storage, complete holdings snapshots, corrections and operational imports are now implemented and tested locally. The older handoff below describes the earlier interface-only checkpoint; its production/import/deployment gates remain in force. No real records were imported.
<!-- /PRIVATE-CONTINUATION-20261020 -->

# CompanySite agent handoff

## Start here

Open output/redesign/DELIVERY.html for the old-to-new map, before/after screenshots and the page-by-page completion table. Exact evidence is under output/redesign/before and output/redesign/after. This is an isolated local source candidate, not a deployment.

Candidate: C:\Users\Michael\Documents\AIWorkbench-Sandboxes\CompanySite-Redesign-20261019

Source baseline: murillomartinezmichael/CompanySite, commit d00397fe2b3ba738a2018601759e52d790f7bdb4.

## Integration boundaries

The normal CompanySite checkout, its current branch, other worktrees, project ownership, authentication permissions and deployment configuration have not been integrated or changed. Do not overwrite another agent's files or assume main still equals the baseline. Inspect current ownership and changes, compare the manifest's old/new hashes, and reconcile overlapping edits before any approved integration. No merge, push, deployment or investor access is authorized by this packet.

The candidate's node_modules directory is a local junction to the existing installation. The change packet deliberately omits node_modules, font files, private records and the full historical investor catalog. Apply only reviewed deltas to the existing app after authorization; do not treat the packet as a stand-alone production distribution.

## Preserve the existing work

The public release registry still contains all 21 approved entries with their existing owners and statuses. The 43-entry historical investor catalog, media and planning source remain in investor-preview/ but are excluded from the public build. Their approved private import is pending; they were not deleted or silently relabeled public. Baseline manual work is retained in PENDING_MANUAL.md. Lead submission, retry/idempotency, checkout readiness, referral and payment policies remain covered by the original regression suite.

## Re-run verification

Run commands from the candidate directory.

- node scripts/redesign-run.cjs after-build
- node scripts/redesign-run.cjs after-test
- node scripts/redesign-run.cjs after-types
- node scripts/redesign-browser-after.mjs
- node scripts/redesign-worker-check.cjs

The browser harness runs only on loopback, blocks external requests and injects synthetic records from tests/redesign/fixtures.mjs through a local in-memory test server. It is NOT an authentication bypass in the application. The separate local Pages runtime check verifies that the actual middleware denies access when the approved identity and storage bindings are missing. The installed runtime supports compatibility date 2026-08-27; no SDK upgrade or production compatibility change was made.

## Real finance data remains blocked

The owner's latest conversation supplies corrected starting records and supersedes older guesses. Do not place those real values in code, fixtures, comments, commits, screenshots, logs or public exports. Import only into an approved private store after the owner identity adapter and persistence have passed their actual-provider acceptance tests. Refer to PRIVATE_DATA_CONTRACT.md. Investor access remains disabled.

## Recording a future purchase

Supply the brokerage/asset account, effective transaction date, exact verified symbol or coin identity, exact quantity, total transaction amount, separate fees, contributor who funded it and a dated receipt/source reference. Preserve the request ID for retries. A correction references the original activity ID. Record a verified account observation separately after reconciliation; do not infer a new official balance merely from the purchase entry. Never execute a trade or transfer through this interface.

## Remaining gates

Owner sign-in/provider verification; approved private storage with atomic duplicate enforcement and recovery tests; private record/catalog import and source reconciliation; exact security/metal verification where needed; approved read-only daily source and existing scheduler integration; final owner review and separate integration/deployment approval. Until those gates pass, real import, daily refresh and production deployment must stay marked incomplete.
