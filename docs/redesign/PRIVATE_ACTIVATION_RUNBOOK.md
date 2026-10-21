<!-- APPROVED-DB-PREP-20261020 -->
## Approved setup progress — 2026-10-20

The owner approved the current project scope. A separate Cloudflare D1 database named `m3-companysite-finance` now exists with the reviewed schema and verified empty application tables. It is not bound to a deployed app, contains no financial records and does not yet have verified production key custody/recovery. Actual owner authentication, real-data acceptance, scheduler/source configuration and conflict-aware release verification remain required. See `APPROVED_ACTIVATION_STATUS.md` and the approval receipts. Historical approval-pending statements below are superseded for this bounded scope only.
<!-- /APPROVED-DB-PREP-20261020 -->

# Private workspace activation and remaining gates

This is an isolated CompanySite implementation candidate. It is not a production deployment, permission grant or authorization to import real records. The normal CompanySite checkout and existing project owners remain unchanged.

## Implemented and locally exercised

The application has owner-only checks at private HTML, API, export and private-store boundaries. The verifier checks an RS256 signature, expected issuer and application audience, exact owner subject, session times and a separately approved session-status response. A valid signature alone is not accepted as proof that a session remains active. Browser role/email hints do not grant access.

The private store uses encrypted JSON in a local D1-compatible database during tests. It binds encryption authentication data to owner and revision. An optimistic revision comparison prevents concurrent writes from silently replacing one another. The encrypted state update and its private audit receipt are in one SQLite transaction. Idempotency receipts survive process/database restart. Backups contain ciphertext, not the encryption key. Recovery is limited to an independently empty store and requires separate approval.

The application supports source-state preview and explicit initial import; dated account and metal-value observations; complete reconciled brokerage snapshots; contribution and repayment attribution; immutable replace/void corrections; goal updates; encrypted backup export; and private operational catalog/workstream imports. Unknown values remain null. Ambiguous historical corrections suppress affected totals until reviewed. Recorded repayments are not automatically subtracted from a reported debt balance that may already include them.

Private project imports preserve source ownership, status, next actions and media references. They do not declare a release. Media playback/download remains disabled until an independently authorized private media store and object access checks are verified. The original investor-preview catalog and media remain preserved; they have not been migrated or republished.

## Hosting configuration that is still missing

1. **Approved owner identity integration.** Configure the actual identity provider, expected issuer, application audience and immutable owner subject. Implement/bind the approved public-key source and authoritative session-status source. The latter must confirm the exact token hash and subject with fresh evidence, including revocation handling. No production provider or login policy was created in this work.
2. **Approved private persistence and key custody.** Create or select an authorized private database, approve migration, protect its credentials and recovery key, and verify backup/restore in that environment. No remote database or production key was created here. Secrets belong in the hosting secret store, never in chat, git or a source-state file.
3. **Real-record acceptance.** After identity and storage checks pass, reconcile the latest owner-confirmed records and explicitly approve initial import. Do not substitute older account-provider snapshots for newer confirmed source observations. Resolve exact securities, quantities, dates, ownership and provisional metal type/weight before claiming complete valuations.
4. **Read-only source and scheduler.** Select an approved source and verify its price definitions, source timestamps, account coverage, cost and permission scope. Only then connect the existing scheduler. No new account connection, paid data subscription, cron job or automated refresh has been enabled. Read-only processing code is not evidence that a daily job ran.
5. **Integration and release approval.** Compare candidate files with the current source checkout and reconcile other-agent changes before applying deltas. Commit, merge, push, preview publication and production deployment remain separate owner approvals.

## Service boundaries and flags

The owner verifier requires `OWNER_AUTH_APPROVED`, `OWNER_ISSUER`, `OWNER_AUDIENCE`, `OWNER_SUBJECT`, `OWNER_KEYS` and `OWNER_SESSION_STATUS`. The source of keys is configured, not selected from a token-supplied URL. Test keys are generated in memory and are not production credentials.

Pages and the private store both validate the owner session. They require their configured `OWNER_AUTH`, `OWNER_SUBJECT`, `OWNER_AUTH_ISSUER` and `OWNER_AUTH_AUDIENCE` bindings/settings. The store additionally requires `FINANCE_DB`, `FINANCE_ENCRYPTION_KEY` and `FINANCE_STORE_APPROVED`. A malformed key cannot make an empty store appear ready.

`FINANCE_IMPORT_APPROVED` is required at both the Pages and store layers for initial or private operations imports. `FINANCE_REFRESH_APPROVED` is independently required at both layers for refresh; its store also requires `FINANCE_SOURCE` and `FINANCE_SOURCE_NAME`. `FINANCE_RESTORE_APPROVED` is required at both layers for restore. Direct requests cannot bypass these gates by ignoring a disabled button.

Both service configurations have no routes, disabled `workers_dev` and preview URLs, and disabled observability. Local `deploy --dry-run` is compilation only; it must not be confused with permission to run a live deployment.

## Required live acceptance before real import

Exercise the actual approved provider and hosting configuration: signed owner, anonymous user, non-owner, investor, expired token, wrong audience, altered token, revoked session, unavailable session service, alternate/preview hostname, direct API, encoded path and download. Verify private responses are not cached and that no content or tokens enter logs or analytics.

Exercise the approved database separately: correct and incorrect key, owner isolation, simultaneous duplicate writes, distinct concurrent writes, lost response and retry, stale revision conflict, audit failure rollback, database restart, encrypted backup, tamper detection, independent empty-store restore and preservation of idempotency receipts. Test the source/state capacity bounds. Current defaults are deliberately bounded, not unlimited archival storage.

## How to update money records

For a transaction, supply account, effective date, exact verified asset/security identity, exact quantity, transaction amount, separate fees, funding contributor and a dated receipt reference. Use the same request identity when retrying an uncertain save. Do not clear the form to disguise an uncertain request as a new transaction.

A correction names the latest record in the original chain and explicitly replaces or voids it. A replacement also names the corrected transaction type. Original evidence is retained. A correction without an explicit action remains unresolved and does not silently alter accounting totals.

After a brokerage purchase, record the activity, then import a new complete source snapshot. That snapshot includes securities, crypto, cash, margin, net equity, deficit warning, exact holdings, unit-price dates, source and timestamp. The gross-minus-margin equation must reconcile when its inputs are available. A deficit is not deducted twice. Older snapshots remain in history and cannot reset newer holdings. A net-equity-only observation does not silently rewrite the separate holdings snapshot.

For silver, record historical troy ounces and the dated USD-per-troy-ounce spot observation. ETF/futures/retail/dealer prices are not accepted as spot. The estimated metal value must reconcile, and provisional coin identity or weight remains provisional. Dealer buyback and retail premiums require separate dated sources.

For private operations, use `OperationsRecords` from `src/lib/finance/operations.ts`. The import carries a source reference, source date, exact project owners/statuses and separately sourced workstream estimates. Unknown costs stay null. Use private object identifiers for media, not public URLs or raw disk paths. Preview the file without saving, type `IMPORT PRIVATE OPERATIONS`, and submit against the current revision. A stale revision is rejected rather than overwriting newer work.

## Verification commands

Run from the isolated candidate directory:

```text
node scripts/finance-phase2-run.cjs build
node scripts/finance-phase2-run.cjs all-tests
node scripts/finance-phase2-run.cjs service-types
node scripts/finance-phase2-run.cjs types
node scripts/finance-phase2-run.cjs browser
node scripts/finance-phase2-run.cjs runtime
node scripts/finance-phase2-run.cjs bundle-auth
node scripts/finance-phase2-run.cjs bundle-store
```

Exact receipts are under `output/redesign/continuation-20261020`. The resumption report distinguishes historical evidence from freshly rerun results. Browser finance tests use synthetic records only, actual cryptographic verification code, the Pages facade, the private store implementation and a local D1 emulator. Their session-status provider is synthetic—not the user's live identity provider.

## Reference guidance reviewed

- Cloudflare Access: validate the JWT signature, issuer and application audience: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- Cloudflare D1 binding API and transaction behavior: https://developers.cloudflare.com/d1/worker-api/d1-database/
- Cloudflare service bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/
- OWASP authorization: deny by default, check each request and protect static/private resources: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

These references inform the implementation. They do not certify this application or replace actual-provider acceptance and independent security review.
