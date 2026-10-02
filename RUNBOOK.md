# CompanySite — Runbook

**Last updated:** 2026-09-18
**Owner:** Michael Martinez (murillomartinezmichael@gmail.com)
**Project shape:** Astro static site + Cloudflare Pages Functions. Rebuilt 2026-07-05 from the previous single-file HTML (preserved at `legacy/2026-cyberpunk-index.html`).

---

## Quick reference

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Run locally | `npm run dev` → http://localhost:4321 |
| Build | `npm run build` → `dist/` |
| Preview built site | `npm run preview` |
| Deploy | `git push origin main` — Cloudflare Pages auto-deploys |
| Smoke prod | `curl -I https://m3mm.net` → expect 200 |
| Tail prod logs | Cloudflare dashboard → Pages → CompanySite → Deployments → tail |

---

## 1. Local development

```bash
cd CompanySite
npm install
npm run dev
# open http://localhost:4321
```

Astro hot-reloads on file save. Content collections (case studies) also hot-reload.

Functions (`functions/api/*.ts`) are not exercised by `astro dev`. To exercise them
locally, either:
- Run against `npm run preview` after `npm run build` (functions still won't run
  under Astro's preview server; use wrangler for that), or
- Use `npx wrangler pages dev dist --compatibility-date=2024-11-01` after building.

For iteration, the form's fetch to `/api/lead` returns a network error in `dev`
mode — that's expected. Client-side error handling shows a graceful fallback.

---

## 2. Environment variables

| Var | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | For real emails | Bearer token for Resend. Without it, email is skipped; successful intake then requires acceptance by Cockpit or n8n. |
| `LEAD_TO` | No | Recipient of intake notifications. Defaults to `murillomartinezmichael@gmail.com`. |
| `LEAD_FROM` | No | Sender address. Must be a verified sender in Resend. Defaults to Resend's sandbox address. |
| `COCKPIT_INGEST_URL` | Optional delivery channel | CockpitCloud ingestion endpoint. Every validated lead POSTs a `kind:"lead"` card. Unset or malformed URLs skip this channel; another operator channel must accept the inquiry for success. |
| `COCKPIT_INGEST_TOKEN` | No | Bearer token added as `Authorization: Bearer <token>` when POSTing to `COCKPIT_INGEST_URL`. Omit for open ingest endpoints. Only sent when the URL var is also set. |
| `N8N_LEAD_WEBHOOK_URL` | Optional delivery channel | n8n lead webhook. An accepted request can preserve intake when operator email or Cockpit fails. Unset or malformed URLs skip this channel. |
| `N8N_LEAD_WEBHOOK_SECRET` | If the webhook requires it | Sent as `X-M3-Webhook-Secret`; configure the matching receiver authentication. |

Set these in Cloudflare Pages → Settings → Environment variables. No `.env` file
is needed for the static build itself.

**Delivery acceptance** — `/api/lead` succeeds only after operator email,
Cockpit or n8n returns a 2xx response. The visitor acknowledgment is sent only
after such acceptance; its own failure does not reject an already accepted
inquiry. If all operator channels skip/fail, JSON and native forms receive
`503 {"ok":false,"error":"delivery_unavailable"}` with no receipt redirect.
The existing JS form shows its manual-email fallback and retains entered data.
Native form errors remain JSON, as with validation failures. Honeypot responses
remain silent success. Summary logs are diagnostic, not inquiry storage.

This proves provider acceptance, not eventual email delivery or downstream
workflow persistence. There is no durable retry queue, and ambiguous provider
timeouts can still require operator reconciliation before retrying.

**Delivery destinations** — email, Cockpit and n8n requests never follow HTTP
redirects. A redirect is a failed channel, even when its destination would return
200; a login or landing page cannot establish intake acceptance. Configure the
final API/webhook endpoint directly. Other direct-success channels may still
accept the inquiry. The visitor acknowledgment also rejects redirects without
turning an already accepted inquiry into failure. Redirect locations, credentials
and response bodies are not added to delivery diagnostics.

**Provider resources** — the delivery senders use only response status and
cancel unread response bodies on success and failure. Cancellation is best
effort and is not awaited: a stalled or rejected cleanup must not change an
accepted inquiry into failure. Regression coverage includes open streams,
cleanup rejection/stalls and bodyless responses for all three senders.
This follows [Cloudflare's response-body guidance](https://developers.cloudflare.com/workers/platform/limits/#simultaneous-open-connections).
It is a resource cleanup fix, not a measured production throughput claim.

**CockpitCloud fleet bond** — each validated inquiry becomes a compact JSON
card (`source`, `kind`, `name`, `next_step`, `link`, `link_label`). Contact and
inquiry text are included in `next_step`, subject to its existing length cap.
The generated lead ID is logged and sent to n8n; it is not in the Cockpit card
body, so this sender alone does not prove Cockpit deduplication. Delivery and
failure coverage: `tests/functions/cockpit-sink.test.ts` and
`tests/functions/lead-delivery.test.ts`. No provider credentials are needed for
these synthetic tests.

---

## 3. Deploy

### 3.1 First-time deploy (Mike-hands-only, ~5 min)

For a new Pages project only, this one-time setup creates the project and runs
the checked upload command. For the existing project, use section 3.2.

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite

# 1. Auth (browser flow — opens dashboard consent)
npx wrangler login

# 2. Install the locked dependencies
npm ci

# 3. Create the Pages project (choose "None" for framework preset, "dist" as build output)
npx wrangler pages project create m3-companysite --production-branch main

# 4. Build, test, rescan, then upload (this IS the production deploy)
npm run deploy -- --branch main

# 5. Dashboard follow-up (browser, 2 min):
#    - Cloudflare → Pages → m3-companysite → Settings → Environment variables
#      Add: RESEND_API_KEY   (production)
#      Optional: LEAD_TO, LEAD_FROM
#    - Custom domains → Set up a custom domain → m3mm.net
#      (Cloudflare guides the DNS; if the zone is already on Cloudflare it's
#      one click.)
```

### 3.2 Subsequent deploys (~90s)

Once the Pages project exists there are two paths:

**Path A — auto-deploy via GitHub (preferred once wired).** Push to `main`.
Cloudflare Pages sees the push, runs `npm ci && npm run build`, uploads
`dist/` and mounts `functions/` at the edge.

**Path B — checked direct upload.** Use the repository command after the
existing release approval. It always builds, tests and rescans before upload:

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite
npm run deploy -- --branch main
```

Use `--branch review-name` for a preview target. No branch is inferred, extra
Wrangler arguments are not forwarded, and the project/output are fixed to
`m3-companysite`/`dist`. A failed build, test or rescan stops before Wrangler;
an upload failure returns failure. `make deploy BRANCH=main` is the same path.
Do not substitute a raw upload of an old `dist/`; it bypasses the local gates.
The wrapper does not log in or create accounts/projects automatically.

### 3.3 Post-deploy smoke (any path)

```bash
curl -sSI https://m3mm.net | head -1
# HTTP/2 200

curl -sS https://m3mm.net | grep -c "Websites that"
# 1 — headline still present

curl -sS -X POST https://m3mm.net/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke","email":"smoke@example.com","businessType":"test","frustration":"local smoke test that is at least ten chars"}'
# {"ok":true}

# /start checkout state — MUST match src/config/offers.ts's checkoutReady:
curl -sSL https://m3mm.net/start | grep -c 'data-cta="start-pay-deposit"'
# 1 once a live Payment Link is deployed; 0 while checkout is gated
curl -sSL https://m3mm.net/start | grep -c 'Checkout opening soon'
# 0 once live; 1 while gated
curl -sSL https://m3mm.net/start | grep -c 'REPLACE_AFTER_SIGN_IN'
# 0 ALWAYS — a non-zero here means the placeholder shipped; roll back (§ 4)
```

### 3.4 Pre-deploy readiness (this runs every time before you paste)

```bash
cd C:/Users/Michael/Documents/GitHub/CompanySite
npm run build           # expect Astro's build summary, then
                        # "check-shipped-placeholders: clean" — build FIRST: the
                        # test suite asserts the built dist/. The build FAILS if a
                        # placeholder (dead Stripe link, REPLACE marker, placeholder
                        # analytics id, example.com contact target) reaches either
                        # shipped surface — dist/ or functions/. That fence also
                        # guards the Cloudflare Pages build, which never runs
                        # npm test.
npm test                # all active tests must pass; two intentional skips cover
                        # the dormant live-Stripe-link branches, source + built-HTML;
                        # they activate, and the gated branches skip, once a real link lands
ls -la dist/index.html dist/audit/index.html dist/_headers dist/_redirects
# 4 files present; if any is missing, do NOT deploy.
```

This section is the local readiness check. The direct-deploy command reruns
build/tests and the scanner itself, so these checks cannot be replaced by a
stale earlier pass. Git-integrated Pages builds must retain `npm run build`
as their configured command; this repository does not change dashboard settings.
The fleet deployment tool rejects `--no-build` and missing build commands for
Pages uploads. Use `npm run deploy` for direct uploads with tests and rescan.
Windows batch regressions additionally skip on other OSes.

---

## 4. Rollback

Cloudflare Pages retains every deployment. Roll back from the dashboard in one
click. Or:

```bash
git revert <bad-sha>
git push origin main
# Cloudflare redeploys the reverted state in ~90s
```

Zero DB, zero state — rollback is always safe.

---

## 5. Debug

### 5.1 Locally

- `npm run dev` gives you Astro's dev server. Hot reload on file save.
- Case study not showing? Check `src/content/caseStudies/*.md` frontmatter matches
  the schema in `src/content/config.ts`.
- Form 404 in dev? Expected — `/api/lead` is a Cloudflare function, not served by
  Astro dev. Test via `wrangler pages dev dist` or in production.

### 5.2 Prod logs

Cloudflare dashboard → Pages → CompanySite → **Functions** → tail. Accepted
intake emits `lead_received`; all operator channels skipped/failed emits
`lead_delivery_failed`. Both include per-channel results and a summary, not the
full contact details/message. Do not treat logs as a recovery store. Every CTA
fires a `cta` log line.

### 5.3 Common failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Form submits but no email arrives | `RESEND_API_KEY` unset OR sender not verified | Check Cloudflare env; verify sender in Resend |
| Form returns `503 delivery_unavailable` | No operator channel accepted the inquiry | Inspect `lead_delivery_failed` channel results and provider configuration; use manual contact while delivery is unavailable. No receipt email is sent by this route. |
| CSP violation in browser console | New third-party script/font added | Update `public/_headers` CSP directive |
| Case study renders "coming soon" | `public/videos/<slug>-scroll.mp4` missing | Drop the MP4 + `<slug>-poster.jpg` in `public/videos/` |
| Rate limit 429 in dev testing | Same-IP rate limit hit (5/60s) | Wait 60s or bump `RATE_MAX` in `functions/api/lead.ts` |
| Build fails on `content:*` type | Frontmatter drift from schema | `npm run astro sync` regenerates types |

---

## 6. Content editing rules

- **Design tokens in `tailwind.config.mjs`** — don't inline hex.
- **Every CTA needs `data-cta`** — the global tracker hooks into it.
- **Adding a case study = one `.md` file** in `src/content/caseStudies/` + one
  MP4 + one poster JPG in `public/videos/`.
- **From-pricing on Services is intentional** — the 2026-07-05 rebrief overrode
  the prior quote-only stance.

---

## 7. Secrets

Only `RESEND_API_KEY` matters, and it lives only in Cloudflare Pages env — never
committed. Rotate every 90 days per `docs/SECURITY_STANDARDS.md`.

---

## 8. Useful one-liners

```bash
# Count case studies
ls src/content/caseStudies/*.md | wc -l

# Verify all CTAs have data-cta
grep -RE 'class="[^"]*btn-(primary|ghost)"' src/ | grep -cv 'data-cta'
# Expect 0

# Check bundled CSS size
du -h dist/_astro/*.css
```

---

## Cross-refs

- **Repo map:** `../PROJECT_GLOSSARY.md`
- **Live URL manifest:** `../STATUS.md`
- **CTA + intake standard:** `../docs/CONVERSION_STANDARDS.md`
- **Hosting choice:** `../docs/HOSTING_STANDARDS.md`
- **Legacy single-file site:** `legacy/2026-cyberpunk-index.html`

## Unified Cockpit inbox candidate — 2026-09-25 (local only)

This isolated branch is a candidate for one Cockpit product, not a deployed merger.
The existing release candidate remains unchanged at 2ee04be. Keep the new mode
unconfigured until the receiver, authentication lifecycle and release gates pass.

- `COCKPIT_LEAD_INBOX_URL` is opt-in: exact HTTPS `/v1/leads/ingest`, without query,
  fragment or URL credentials. Undefined preserves the existing delivery path;
  defined-but-invalid fails closed. `COCKPIT_INGEST_TOKEN` is mandatory in this mode.
  The current receiver uses expiring owner JWTs. An approved server credential,
  least-privilege/lifetime/rotation plan and ownership proof are activation gates;
  no credential was read, created or installed here.
- The receiver stores the entire validated inquiry and 11 context fields before
  email/workflow attempts. A 200/201 must echo the complete stored record with the
  receiver's 32-hex identifier and timestamp. Headers alone are insufficient.
  Reads are bounded to 64KiB and six seconds including the response body; redirects
  are not followed. Storage failure returns503; reused key with changed data409.
- Both JavaScript forms retain random retry keys, SHA-256 payload fingerprints
  and uncertain/accepted status in sessionStorage; no inquiry body is stored.
  Reloading the same tab with the same details reuses the key. Changed details
  require explicit separate-inquiry confirmation; earlier unresolved identities
  remain available for A→B→A recovery. The map holds at most16 references without
  silent eviction. Closing the tab or clearing storage can lose this recovery.
  Accepted submissions cannot silently send again. The backend prefixes keys
  with `companysite:`. Legacy delivery does not gain durable server deduplication.
- Native no-JavaScript inbox submissions first receive a no-store confirmation
  page with a hidden retry UUID and escaped original details. This first response
  sends nothing to the receiver. Confirm/retry posts retain the UUID; conflicts
  require review rather than a replacement key. Closing/starting over loses this
  reference. Only confirmed storage redirects303. The confirmation's same-origin
  referrer policy preserves native Origin checks without cross-origin disclosure.
- Lead-only allowed-origin CORS preflight permits Idempotency-Key. Existing
  origin/method policy remains; chat and other routes do not inherit that grant.
- `company=m3mm` and `source=companysite` are server controlled. The display-only
  projectType uses64 Unicode code points; full businessType/source/URL/timing/
  referral/intent/UTMs remain in context. Existing field validation limits remain.
  No raw IP enters the inbox payload. Context is untrusted metadata, not commands.
- `COCKPIT_NOTIFICATION_CHANNELS` selects the durable role plan: absent means
  `acknowledgment_email,operator_email`; an empty string means storage only.
  An explicit comma-separated plan may also include `workflow`. Duplicate,
  unknown or empty members fail closed. This mode requires matching role receipts
  and unique job IDs from the receiver, including on replay.
- Both new receipts and replays return after durable storage confirmation. Inbox
  mode performs no inline email, old Cockpit event-card or n8n dispatch. The
  receiver's separate default-disabled worker owns processing. Queue acceptance
  does not mean mail delivery; failed/uncertain jobs remain visible in the inbox.
- n8n remains optional; this change does not replace existing deployments with
  Flowforge or configure any outward route. No local boards or accounts moved.

Earlier September25 verification:170 selected receiver/worker tests;336 selected CompanySite
tests and zero scoped helper/test TypeScript diagnostics. Job600eb6 proves six
actual Python pending/accepted/replay responses across two email/all-three plans
against the compiled current adapter. Independent source review closes the
receiver/worker findings; earlier receipt-ID/Unicode corrections remain intact.
24 existing loopback-server redirect cases were blocked
by the deny-listen boundary and excluded from the final selected run; no guard was
weakened. Full Astro/Cloudflare build and native browser/live delivery remain unrun.

Before activation: verify receiver schema and backup/restore; if a pre-context
lead_receipts table exists, migrate context_json and existing hash semantics under
an approved plan. Prove legacy ownership without guessing. Rehearse the actual
historical-schema restore under a separate approved scope; verify appropriate credentials, production runtime/browser checks,
retention/deletion and exact operator/ack/workflow destinations. Michael approves
configuration, one synthetic outward inquiry and deployment separately. No send or
activation occurred. Keep the existing CompanySite release owner.

September26 checkpoint supersedes those local test counts:286 backend tests with
two Windows symlink skips establish synthetic audited reconciliation/restore;
358 selected producer tests and scoped strict inline-form/test types pass. Intake
uses the endpoint's actual validator and limits before sending or allocating a
retry key. Native required/type checks are enabled; editing clears stale transport
errors while preserving pending-send feedback. Source review closes the finding.
The actual-source component fixture passes34 native Chrome scenarios at1366/390,
including field messages/focus, correction, retry identity, success redirect and
no-JS required/type/minlength constraints. Default props only; simplified fixture
CSS does not prove deployed layout, whole-site accessibility or CSP. Browser
requests are intercepted; these checks do not prove live notification delivery.

The September26 guarded-build attempt stopped after its two setup corrections;
it remains historical failure evidence. October2's separate native qualification
now passes the actual resume/build15pages/output fence,956 tests with2 Windows
skips,46-file Astro check with0 diagnostics and12 compiled-workerd fixture cases.
The15 lifecycle source files match the earlier reviewed browser/worker return.
Current environment:Node22.23.2 meets the declared >=22.12 range; .node-version
still names22.23.1, so this is not an exact-patch claim. Subsequent dependency
integration must rerun affected checks and record its actual lock/runtime.
These tests use synthetic/intercepted transports. Prior compiled browser checks
do not establish deployed behavior, real delivery or the actual backup/cutover.
