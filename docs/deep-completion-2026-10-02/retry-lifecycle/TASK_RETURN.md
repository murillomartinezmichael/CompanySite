# CompanySite — reload and native retry lifecycle

**M3MM-STD-DELIVERY-001 · 2026-10-02 · CHECKPOINTED.** Local implementation is ready for the existing integrator's review. This is not CompanySite release completion or n8n migration acceptance.

Execution: Codex `/root/companysite_retry_lifecycle`. Integration/claim owner: Codex `/root`. Worktree: `C:/Users/Michael/Documents/GitHub/.worktrees/companysite-unified-inquiry-2026-09-24`; base HEAD `2ee04be1e2c4038ed147daaab2a76f838e5a93f0` plus preserved prior dirty candidate. Exact branch, current file hashes and pre-edit provenance are in `TASK_RETURN.json`.

## Actual result

Both existing forms now retain a bounded map of SHA-256 payload fingerprints, random retry UUIDs and uncertain/accepted status in `sessionStorage`. No raw names, addresses, message text or attribution values are stored there. Same details reuse their identity after reload; earlier A→B→A identities survive deliberate edits/reverts. A novel changed payload requires a clearly labeled separate-inquiry button and confirmation. The button sends nothing. A confirmed identical request is suppressed after reload unless the visitor deliberately starts another inquiry.

Preparation verifies storage before sending. Unavailable, corrupt, replaced or over-capacity state fails closed without silently generating replacement identities. The 16-entry limit never evicts unresolved attempts. After explicit application acceptance, storage failure keeps the current form accepted/disabled and says the inquiry was confirmed; it never becomes “nothing was sent.” Existing native validation, shared validation, sending/accepted locks, explicit JSON receipt checks, input-error correction and the current Cockpit inbox route remain.

Native forms in configured inbox mode first receive an escaped, no-store confirmation page with a hidden UUID and a fixed same-origin form action. **This first step has zero receiver effects.** Confirmation POST uses that UUID; uncertain results return the same fields and identity for deliberate retry, success redirects through the existing allowlist, and content conflict offers no blind retry. UUIDs identify a public submission and are not authentication. JSON inbox requests now require a valid key; missing keys return428, invalid/contradictory keys400. Existing validation, body limits, origin/rate checks and authenticated receiver remain in force. No new database, D1 binding, mode, delivery owner or fallback was introduced.

Cross-origin callers on the existing allowlist can send the required `Idempotency-Key` to `/api/lead`. The shared CORS helper defaults remain unchanged for other routes; only lead opts into this header. No new origin, wildcard, credential grant or unknown header was allowed.

## Files and usable outputs

`retry-lifecycle.incremental.patch` is an incremental **review artifact against the pre-task dirty candidate**, already applied in this worktree. Do not apply it again or apply the old A33 patch on top. It is not a complete application. Existing `functions/_lib/cockpit-inbox.ts`, prior root repairs and other dirty work remain prerequisites. `git apply --check --reverse` passes against the current candidate.

Fifteen source/test files changed in this slice: three existing form/helper files; `functions/api/lead.ts`; new `functions/_lib/inquiry-confirmation.ts`; `functions/_lib/cors.ts`; six focused tests; and three runtime/browser checks. `TASK_RETURN.json` lists every exact path/hash. Pre-edit byte snapshots were captured for the initial six changed existing files and later CORS files; the roadmap test was copied before its edit. The pre-existing runtime-check file's complete source was read, but its byte hash was not captured before editing: its patch baseline is reconstructed by reversing the exact owned native-check hunk, explicitly labeled in JSON.

`evidence/` contains the full Vitest JSON/log, compiled-browser source hashes and scenario receipts, compiled-worker receipt/log, CORS negative-control and corrected browser receipts, prior full-site axe result and two inspected mobile screenshots. These files and the source changes are local and uncommitted; no remote persistence is claimed.

## Verification

| Current check | Result and scope |
|---|---|
| `npm run build` | 15 pages built; shipped-placeholder fence clean. |
| `npm run astro -- check` |46 files, zero errors/warnings/hints. Final changes after this check were error copy and Functions/CORS/tests, not Astro typing structure. |
| `npm test -- --silent=true --reporter=default --reporter=json --outputFile=output/retry-lifecycle/vitest-results.json` | **956 pass, two existing skips,61 files;34 new regressions** over parent baseline. Full report retained. |
| `node node_modules/wrangler/bin/wrangler.js pages functions build functions --outdir=output/runtime` with metrics disabled | Actual Pages worker compiles. Existing SDK `node:fs`/`node:path` warnings remain. |
| `node scripts/check-inbox-runtime.mjs` |12 actual compiled-worker scenarios pass with every outward fetch intercepted. |
| `node scripts/check-inquiry-retry.mjs` |10 Chrome/compiled-form/actual Pages scenarios pass: both forms at375/1440; loss/reload/retry, deliberate changed/reverted payload, accepted resubmit suppression/new inquiry, native no-JS Unicode/escaped fields and stable confirmation identity, and blocked storage before/after acceptance. |
| `node scripts/check-inquiry-cors.mjs` | Actual Chrome OPTIONS→POST acceptance, same-key replay retains one synthetic inquiry, unknown Authorization header denied. Pre-correction `--expect-blocked` reproduced the defect with zero receiver calls. |
| `node scripts/axe-home.mjs` |60 static page×viewport combinations clean, keyboard/reduced-motion/no-JS navigation checks and four prior form retry scenarios pass. This run preceded final uncertainty-copy clarification; refreshed lifecycle browser evidence binds the final source. Native confirmation is not included in the60 static-page axe count. |
| `git diff --check` and reverse patch check | Clean. |

No package installation, credential read, provider call, real inquiry, activation, commit, push or deployment occurred. Local workerd uses the installed-supported `2026-08-27` date and `nodejs_compat`; these are fixture settings, not production changes. Browser receiver state is a synthetic map returning the current receipt contract; it does not prove actual CockpitCloud database transactions, retention or email delivery.

Two concrete problems were found and corrected: native confirmation under A33's `no-referrer` policy made Chrome send `Origin:null`, which the existing gate correctly refused403; `same-origin` preserves that gate without cross-origin referrer disclosure. Independent review then found the required key could not pass the existing cross-origin preflight; a lead-only header opt-in closes that compatibility gap. One obsolete inline-error source regex was adapted to the helper wiring and actual contact fallback; functional error tests remain.

Independent read-only review by `/root/siteguide_consistency_review` checked browser/source hashes, exercised isolated helper invariants and18 native confirmation safety assertions, and found the CORS issue above. Its final re-review closed that finding after17 isolated CORS/source-wiring checks and verified the exact corrected source hashes recorded in JSON. It reported no other blocking finding within this bounded review. These were returned review/tool receipts, not a separate app integration rerun; parent integration acceptance remains.

## Genuine limits and exact continuation

Session storage is tab-scoped and can be cleared. On a fresh reload after state is lost, the browser cannot identify an earlier attempt. No contact/message payload is retained, so the visitor must restore exact details; fingerprints are not a recovery copy. Native retry protection covers resubmitting the confirmation POST, not starting over from a fresh form or losing the confirmation page. The UI describes these limits. The default legacy route has no new durable server-side dedupe guarantee merely because a client supplies these keys.

The next useful agent work is **Codex `/root` integration review**, not a new user chore: verify source hashes and the incremental patch, ingest the independent review, and reconcile this producer with the existing CockpitCloud owner/current schema, receipt/jobs, restore and migration contract. Then update canonical CompanySite/root tracking and A30/A33 using exact evidence. Source-based engineering and approved offline receiver work can continue; this local slice does not close that work.

Existing owner gates remain unchanged: **M02** destination/capacity/spend decision after measured evidence; **M03** private custody/export scope; **M04** account owner connections; **M05** exact harmless payload/channels/destinations and bounded send approval after native acceptance; **M06** exact production cutover/old sender retirement after restore, final delta and one writer/sender proof. No credentials are requested. This slice adds no new manual action and does not duplicate those gates.

Root owns shared TODO/SESSION_GOAL/PENDING_MANUAL updates and the existing `.claims/CompanySite.lock`. This specialist wrote only the assigned candidate source/tests and this return package, preserving unrelated work. The parent should retain the source and evidence as CHECKPOINTED until integration/review and remaining receiver work are proved; release remains unverified.
