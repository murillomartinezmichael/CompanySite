# CompanySite merged inquiry candidate

Owner: Codex /root. Source merge b18aa2c26f72a5b71eb6d9a572bfa295b8970acc joins reviewed inquiry commit ebceca0 and origin/main ae8362d. Git resolved the merge without conflicts; the lockfile exactly matches the reviewed semantic three-way merge and preserves unrelated local patch versions.

Post-merge acceptance uses the exact installed lock: Node 22.23.2, Astro 7.3.2, Vitest 4.1.11, Wrangler 4.131.1 and Puppeteer 25.10.0. All 956 native tests pass, with two Windows skips; 61 test files pass. The 15-page build/output fence and 46-file Astro check pass with zero diagnostics. Twelve actual compiled-workerd scenarios pass. Two compiled inquiry payloads pass through Cockpit 16092e6's real JWT/ASGI/SQLite implementation on Python 3.12.14, producing two receipts/four recoverable jobs. Its responses pass eight compiled producer checks; ten receiver controls pass with zero violations. This is file-linked acceptance, not a simultaneous browser-to-production transaction or provider delivery.

The dependency preflight caught a shared node_modules junction before npm ran. Its directory entry was preserved under ignored output/dependency-backup-20261002; the shared target was untouched. This candidate now has independent exact-lock dependencies. Installation used an empty temporary npm/profile environment, public registry and disabled lifecycle scripts. One nonfatal optional-package cleanup warning is retained in the local log.

The unchanged lifecycle sources retain earlier independent and browser evidence. No new browser or independent worker run is claimed. Node meets the engines range but differs from .node-version 22.23.1. Existing compile compatibility warnings remain; production nodejs_compat is unverified. Legacy delivery behavior is unchanged, and the new inbox route remains opt-in/unconfigured.

Next integration step: commit this evidence and fast-forward the unoccupied local main after verifying ancestry. Remaining release gates M02-M06/A30/A33 cover actual credential lifecycle, approved destinations, backup custody/history/schema/retention, one-sender cutover and exact outward test/production validation. No push, deployment, real send or account action occurred. The private dirty PENDING_MANUAL and primary marketing/UI edits remain held unchanged. CHECKPOINTED does not mean exhausted or released.

Receipts and synthetic proofs are committed with this packet. Raw logs remain ignored/local with hashes in TASK_RETURN.json. Earlier pre-merge evidence remains historical and unchanged.
