# Payment fence recovery — 2026-09-12

The repository upload command builds, tests and rescans before invoking local
Wrangler. Fleet Pages uploads additionally reject `--no-build` and missing
build commands (87 offline deployment tests). Neither is release approval.

Checkout and the scanner share URL parsing. Query parameters work; test-mode
paths, userinfo, noncanonical paths, fragments, unapproved hosts and key material
are rejected. Encoded key values are rejected and redacted. The old 10–64
character heuristic is removed: an id's shape cannot establish a real payment.
The verified-host list currently contains only `buy.stripe.com`; custom hosts
require an explicit reviewed addition after verifying the Stripe setup.

Stripe documents [tracking/query parameters](https://docs.stripe.com/payment-links/url-parameters)
and [custom payment domains](https://docs.stripe.com/payments/checkout/custom-domains).
Sources checked September 12. No provider API or account was accessed.

Scanning now covers source maps, additional source/config formats and
extensionless text; it decodes common JSON, HTML and percent encodings without
executing code. It refuses symlinks/junctions and non-regular files, streams
directory enumeration and limits text to 8 MiB per file, 64 MiB total, 20,000
entries and depth 32. Limit violations stop the build.

Verification: isolated tracked-source builds produced 15 pages with checkout
disabled and with a synthetic parameterized checkout URL. Each full suite passed
592 tests with two conditional skips (the opposite checkout state). The enabled
branch was actually exercised. Existing installed dependencies were reused;
local environment files were not copied. Independent review found an encoded-key
gap, which was fixed and re-reviewed clean. No actual upload was attempted.

Remaining boundaries: this is a conservative text fence, so source comments or
examples can trigger findings. Arbitrary runtime construction and files produced
after scanning are not proven safe. Binary content is outside the text policy.
These limits must not be represented as complete secret/runtime analysis.
Before release, Michael must verify the actual Stripe account, active status,
live mode, currency and $100 deposit amount, any custom hostname, and the Pages
build configuration. No payment-link variable or provider settings were changed.
