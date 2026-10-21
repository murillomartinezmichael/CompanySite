# Approved activation work — current checkpoint

Owner approval for the existing CompanySite project remains in effect. This checkpoint progresses the same candidate and existing project ownership; it does not establish production authentication or import real records.

## Completed in this checkpoint

| Track | Implemented or verified | Live boundary |
|---|---|---|
| Owner authentication | Added a configured Cloudflare Access signing-key/session adapter. It restricts issuer and API destinations, verifies exact session/application evidence and returns no records when evidence is missing. Synthetic provider cases are tested. | Actual Access application, immutable owner subject, app audience, authoritative session nonce mapping and a scoped API credential still need real-provider acceptance. No public policy or login configuration was changed. |
| Encryption and recovery | Added portable encrypted recovery-key envelopes and an operator-only interactive preparation command. Wrong passwords, altered metadata/ciphertext and invalid KDF inputs are rejected. | No production key was generated or installed. A verified independent recovery destination and separately held passphrase must exist first. |
| Private media | Added independently authorized downloads and byte-range reads backed by a private bucket binding and registered private object IDs. Active content types and unregistered objects are denied. Local R2 reads are tested. | The actual account returns that R2 must be enabled in the dashboard. No enrollment, bucket, new charge or real-media upload was made. |
| Finance source reconciliation | Existing read-only account data was consulted without persisting personal balances or identities into source. Older provider observations were not substituted for newer user-confirmed source snapshots. | A supplied source snapshot has an arithmetic discrepancy; exact holdings, timestamps and unresolved ownership remain evidence questions. Refresh completion is not inferred from a request receipt. |
| Daily updates | Existing read-only refresh and stale/gap/error handling remain tested. The machine's available scheduled-task names were checked. | Only a general nightly synchronization task was identified, not a verified finance valuation job. It was not changed. No feed, bank connection or new schedule was enabled. |
| Existing website work | Reconciled the pinned PR #38 content into the latest owner-requested architecture, preserving six infrastructure areas, six phases, twelve milestones and old destinations through redirects. | The original PR and source checkout are untouched. The candidate has one /about page, not duplicate routes. |
| Integration | Prepared a clean review branch from the current remote main and copied only reviewed deltas; tests are rerun in that exact checkout. | No merge or production deployment is implied. Real identity, storage/key custody, source and rollback checks remain release gates. |

## Exact owner-only actions that cannot be inferred

**Access configuration:** Sign in to the authorized Cloudflare Zero Trust administration context, configure or identify the actual private application, keep the allow policy owner-only, and make the required narrowly scoped Access session-read credential available through the approved hosting secret mechanism. Do not paste credentials or JWTs into chat. The provider adapter must be tested against a genuine owner session and a revoked session before it is accepted. Application identity nonce and active-session nonce mapping are intentionally fail-closed until verified against actual provider responses.

**Recovery custody:** Choose an independently recoverable storage destination and keep its passphrase separately. From a local terminal, run `node scripts/prepare-finance-recovery.mjs --recovery-directory <existing absolute recovery directory>`. The command refuses noninteractive input, masks the passphrase and stores only an encrypted envelope. It does not upload a key or activate the app. A second-device restore and secure production secret installation remain required. A different folder on the same disk is not an independent backup.

**Media enrollment:** The actual R2 API returned dashboard-enablement-required. Review any enrollment/payment terms in the account before enabling it. The present approval does not select unspecified new costs. Once enrollment and a private bucket exist, verify owner/object boundaries on the real host before uploading the retained original media.

**Read-only source/scheduler:** Identify the supported source and the existing authorized scheduler, verify source timestamps, licensing/cost and account scope, then test one read-only refresh end to end. A tool connection available in this conversation is not automatically a deployable website API. Do not modify an unrelated nightly synchronization task or create a second controller to claim this gate is complete.

## Privacy and source custody

No real balances, statements, account IDs, investor identities, provider credentials or recovery passphrases are included in this source document. Tests use synthetic fixtures. The original investor catalog/media remain retained, not republished. Both provider and media service configurations have no public routes and no configured live bindings. Original release status and project ownership remain authoritative.

## References for actual-provider acceptance

- Cloudflare Access JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- Application JWT identity fields: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/
- Exact active session API: https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/users/subresources/active_sessions/methods/get/
- Active session application membership: https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/users/subresources/active_sessions/methods/list/
- Worker secret management: https://developers.cloudflare.com/workers/configuration/secrets/

These references define integration expectations. Synthetic tests do not prove the user's live configuration, and a signature alone is not treated as a revocation check.
