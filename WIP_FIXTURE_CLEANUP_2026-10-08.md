# Inquiry browser fixture cleanup

Owner: Codex /root. Status: CHECKPOINTED; source patch uncommitted.

Changed only `scripts/check-inquiry-retry.mjs`: startup now falls inside cleanup handling; worker readiness is awaited before Chrome launches; browser, worker and server each receive a cleanup attempt; original failure and cleanup errors remain visible together. Inquiry application code is unchanged.

Seven offline lifecycle cases pass, covering listener/worker/browser startup refusal, successful closure, multiple cleanup failures and preservation of the original failure. Syntax and scoped whitespace checks pass. Root evidence: `../../docs/fleet-deep-completion-2026-10-02/companysite/browser-current/CLEANUP_RETURN.json`, `cleanup.patch`, `cleanup.test.cjs`, `cleanup-final.tap`.

No native rerun after workerd Access denied. Earlier process cleanup remains unverified because process inspection was denied. An authorized local runtime owner must inspect only fixture-associated children and establish supported workerd execution before another run. Mocked lifecycle proof does not close that gate.

Next integration review: compare the exact source hash from CLEANUP_RETURN.json, preserve all unrelated edits/staging, run the existing required hooks in an authorized runtime and commit only the reviewed owned source/tracking paths. Current session Git metadata remains read-only. Do not bypass hooks, install dependencies, expand permissions or push/deploy. Use fresh evidence output for a future real run; retain the original failed copied fixture and logs unchanged.

## Integration review — 2026-10-08
The earlier read-only Git/process-access limitations above are historical. Current source SHA256039517ad67bcb60a76057fe5393a9cc9f9297a79d207bd0e18832e691058d36c matches the seven-pass receipt; focused whitespace check passes. Reviewed startup and all-settled cleanup paths. Existing pre-commit hook is absent; no hooks bypassed. Later exact-packet process inspection succeeded with no matching children. Actual workerd still fails before browser assertions; no release qualification claimed. Commit scope: this owned handoff and the cleanup script only; private PENDING_MANUAL remains excluded/unread. No push or deployment.
