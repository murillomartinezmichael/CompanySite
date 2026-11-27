# Offline recovery verification and activation checkpoint

## Release boundary — 2026-10-21

The public redesign is merged in PR #40 at `c290183dcf0ea6150f3489f0fb6fdb13af664b39` and deployed. Historical candidate-only statements in the earlier runbooks do not describe the current public release. Private finance activation is separate and remains gated. This recovery change does not deploy a service, install a key, import records or grant access.

## What this change provides

The preparation command now prints the original recovery context and a non-secret SHA-256 fingerprint of its random 256-bit key. Retain those independently from the encrypted envelope. The new verification command decrypts an existing envelope in memory, compares its key with that independently retained fingerprint, and prints only a non-secret check receipt. It reuses `services/shared/recovery-envelope.ts`; it does not introduce another cryptographic format or implementation.

### Prepare on the authorized machine

From a trusted checkout with the project's locked dependencies installed, run in a local interactive terminal:

```text
node scripts/prepare-finance-recovery.mjs --recovery-directory <existing absolute recovery directory outside source checkouts>
```

Verify the actual recovery destination and separate passphrase custody before confirming the prompt. Input the passphrase only at the hidden terminal prompt. The command will refuse to overwrite an existing envelope. Retain the emitted original context and key fingerprint in a separate trusted record; neither is a raw key or password. The command does not install the production secret.

### Verify on the independent recovery device

Use a separately obtained trusted checkout, the existing dependencies, the retained encrypted envelope, the original context and fingerprint, and access to the separately held passphrase. Run:

```text
node scripts/verify-finance-recovery.mjs --envelope <absolute path ending .recovery-envelope.json> --context <original m3-companysite-finance:UUID context> --fingerprint <original 64-character key fingerprint>
```

The passphrase must be entered at the hidden local terminal prompt. Do not put it in chat, arguments, environment variables, scripts, redirected input or a plain-text file. Do not trust a context/fingerprint supplied only alongside an untrusted replacement envelope.

A successful receipt has `result: verified`, the original context, key fingerprint, encrypted-file SHA-256, creation/check times, `independentCustody: not_assessed` and `productionActivated: false`. It contains no decrypted key or envelope ciphertext. The command does not modify the envelope. Review the result against the original record and keep a non-secret receipt in the approved private operational log.

Success proves that this file can recover the expected key with the supplied passphrase. It does **not** prove a second physical device was used, reliable independent custody exists, the key has been installed correctly, or the finance database can be restored. Perform and record those checks separately before real-data activation. JavaScript string clearing is best-effort, not a guarantee of complete memory erasure; use a trusted, unrecorded local terminal and operating system.

Earlier envelopes without a separately retained trusted fingerprint are not retrospectively certified by this command. Do not invent a fingerprint, print a raw key or replace an established production key to make a test pass.

## Verification in this checkpoint

- `npm run test:recovery`: 19 native Node regression cases passed in an isolated Linux environment against the exact deployed recovery-crypto blob `918054eb3d33f69cb41e7dafe4b815fcabd3047c`.
- Six additional synthetic Linux pseudo-terminal checks passed: preparation, successful verification, wrong passphrase, wrong fingerprint, tampered metadata and cancellation. Input was hidden; no production material was used.
- Syntax checks passed for the preparation command, verification command and helper.
- The existing CI job now runs the native recovery tests after its existing Vitest tests. No new workflow, dependency, model, service or schedule is added. `npm test` and its existing argument forwarding are unchanged.
- These isolated results do not replace the full-site build/test/browser CI on the final commit, native Windows terminal acceptance, independent review or a real second-device recovery exercise.

## Fresh production checks — 2026-10-21

At 22:23 UTC, sixteen read-only requests across the custom domain and Pages hostname verified that private page, encoded-path, state, readiness, export, backup and media paths still deny access with HTTP 503 and `Cache-Control: no-store`, including forged owner hints. This is expected while authentication is unconfigured; it is not proof that genuine owner login works.

The first public probe incorrectly required immediate HTTP 200 and flagged five HTTP 308 responses. At 22:26 UTC, a corrected same-origin, bounded-redirect probe verified all six primary public destinations: Home returns 200 directly; Services, Projects, Roadmaps, About and Contact redirect to their trailing-slash paths and then return 200. No site code was changed to accommodate a test mistake.

Read-only database inspection found both finance application tables empty, with their schema and audit triggers present. No rows were written. The R2 API still returned dashboard-enrollment-required. Existing CLI permissions did not establish Access administration. No credentials or private account records are recorded here.

## Remaining manual/configuration gates — no repeat generic approval

| Gate | Required evidence before activation |
| --- | --- |
| Owner identity | Authorized Access administration, actual application/audience/immutable owner mapping and a narrow session-read credential in approved hosting secrets; successful genuine-owner, non-owner, expired/revoked and unavailable-provider tests. |
| Recovery custody | Actual independent destination and separate passphrase custody; original context/fingerprint retained independently; successful second-device verification, secure secret installation and empty-store backup/restore acceptance. |
| Private media | Account-side R2 enrollment with its actual billing terms resolved, private bucket binding and real-host object authorization tests. No enrollment or charge was accepted in this checkpoint. |
| Source records | Dated authoritative inputs, exact holdings and contribution/ownership reconciliation. Available chat-tool access is not a deployable website API. Unknown-age balances must not be represented as current verified observations. |
| Daily refresh | A supported, authorized read-only feed and verified existing valuation scheduler; one end-to-end refresh receipt and retry/failure acceptance. The discovered general nightly sync was not repurposed, and no second controller was created. |
| Local Git writes | Windows Defender Controlled Folder Access explicitly blocked Git writes in protected local directories. Local writes were stopped; no protection or ACL was weakened. Review the intended trusted Git installation and its security policy through the authorized workstation workflow before resuming local integration. |

Existing project ownership, other PRs, the normal checkout and retained investor source material remain unchanged. The shared root manual tracker and browser Cockpit log were not edited in this checkpoint; this document is not a claim that those separate records were synchronized.
