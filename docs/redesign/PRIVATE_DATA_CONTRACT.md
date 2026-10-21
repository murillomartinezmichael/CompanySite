<!-- PRIVATE-CONTINUATION-20261020 -->
## Continuation status

The verifier and encrypted private-store implementations now exist under `services/`, with synthetic cryptographic, local D1, recovery, concurrency and browser acceptance. Production identity/key/session bindings, database approval, real-record import and daily scheduling remain unconfigured. Read `PRIVATE_ACTIVATION_RUNBOOK.md` and `CONTINUATION_CHECKLIST.md` for the current acceptance boundaries.
<!-- /PRIVATE-CONTINUATION-20261020 -->

# Private Finance & Investments — activation contract

Status: interface and application boundary implemented; real records not imported. No identity service, store, account connection, investor access or daily task is activated by these files.

## Owner authentication

The existing site has no end-user authentication. Production therefore fails closed with HTTP 503 for the entire workspace and old investor route family. The integration accepts only an approved **server-side service binding** called OWNER_AUTH. It does not trust browser role headers, email assertions, query flags, a hidden menu, or a frontend session switch.

The approved identity service must verify its actual identity-provider signature, issuer, audience, expiry and revocation requirements before returning authenticated, subject, issuer, audience and expiresAt. OWNER_SUBJECT is one exact immutable owner subject, not an email domain or an investor group. OWNER_AUTH_ISSUER and OWNER_AUTH_AUDIENCE are required. Only session material is sent to the service binding; no private finance request body is forwarded for identity checks. Auth failures never log tokens or account data.

Deployment approval must include actual provider-session tests: anonymous, expired, revoked, non-owner, investor, owner, alternate host, encoded route, direct API and download. Unit tests of a synthetic service binding are not evidence that this live provider setup exists.

## Private persistence

FINANCE_STORE must be an explicitly approved private service binding. FINANCE_STORE_APPROVED is absent by default. The store accepts /state and /activity on its internal service boundary; no arbitrary URL is accepted. It must independently validate the owner subject and enforce single-owner tenancy. Data stays out of git, static assets, client analytics, public logs and screenshots.

Activity writes must be atomic and idempotent: a unique request ID plus a canonical fingerprint of account/date/type/identity/quantity/amount/fees/contributor/source/correction. Repeating the same request returns its original receipt. Reusing its key with different content is a conflict. Corrections are additional records referencing their original entry; they do not silently edit history. Validate on both sides of the binding before a real import.

All amounts are integer cents. Shares and weights are exact decimal strings. Unit prices are not position totals. Cash, securities, crypto, margin, net equity and deficit warnings are separate. A deficit is not deducted again from reported equity. Brokerages, retirement/HSA accounts, CDs, metal inventory and repayment obligations are distinct records. Ownership is unresolved until documented; investor assets never become personal net worth by default.

## Import and sources

Import current user-confirmed records only after authentication and private persistence are accepted. The corrections in the owner's latest prompt are the authority for that import; do not copy that prompt's real balances or identities into this repository. Reconcile each screenshot independently. Do not substitute an unfamiliar symbol or guess a truncated quantity.

Record a purchase with: account, effective date, verified asset/security identity, exact quantity, total transaction amount, separate fees, funding contributor, dated receipt/source reference and an idempotency key. Attach the actual receipt only to the approved private store. Activity recording is bookkeeping, never trading or transfer execution.

Store immutable observations with timestamp, price date, source, user-confirmation status and value. Preserve multiple observations of one account as observations—not separate accounts. Do not overwrite newer confirmed information with older provider values. Flag inconsistent snapshots for review.

Actual charts use each dated account observation. Missing values show gaps. A single point is not a trend. Deposits and withdrawals remain separate from gains. Performance is unavailable until both endpoints and cash-flow coverage are reconciled. Any fixed-current-holdings historical comparison must be labeled hypothetical and is not enabled by this implementation.

A metal series must identify its dated spot source; spot-based estimated metal value is not dealer proceeds. Dealer buyback and retail premiums use separate observations. ETF/futures proxies are not accepted as silver spot. The Canadian type/weight verification gate must survive import.

## Scheduled refresh

No scheduler is created or enabled. The existing scheduler may call an approved private refresh adapter only after source licensing/cost, read-only access, persistence, ownership and authentication have been accepted. Verify last-success time, source/price date, holiday behavior, stale quotes, missing observations and errors. Never synthesize zero prices or completed refreshes. No paid feed or new bank connection is authorized.

## Budget boundaries

Monthly plans separate owner/investor contributions, proposed debt repayments and actual paid ledger entries. Unknown goals and dates remain null. A reported obligation is not the same as margin, account equity, market loss or a transfer. Unresolved family obligations remain unresolved. Proposed schedules do not count as paid or affordable. Affordability requires actual income, unpaid commitments and debt-payment reconciliation.
