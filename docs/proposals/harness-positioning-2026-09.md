# Proposal — should m3mm.net say anything about the harness?

**Status:** PROPOSAL. Nothing here is applied. No site source, copy, component, config, or route was touched.
**Date:** 2026-09-03 · **Author:** Claude (drafting options) · **Decision owner:** Michael — brand and positioning are his call.
**Constraint this was written under:** LAW #6 (never fake it). Every claim below traces to a file in the repo or to a command run on 2026-09-03. Nothing is invented — no metrics, no testimonials, no client names beyond ones already published on the site.

---

## 1. What is demonstrably true today

Verified by reading the files and running two commands this session.

| Claim you could make | Evidence | Verified how |
|---|---|---|
| A resumable 8-step build pipeline for client sites exists and runs | `scripts/harness/lead_to_launch.py`, `scripts/harness/steps/s1_intake.py` … `s8_payment.py` (2,050 lines incl. `core.py`) | `python lead_to_launch.py run demo-check --lead fixtures/lead-demo.json --dry-run` printed all 8 steps |
| Four of the eight steps are **hard human stops** — tier, quote, preview, payment | same; `GATE` flags in `steps/s2`, `s3`, `s7`, `s8` | dry-run output marks `(GATE)` on 2, 3, 7, 8 |
| A security regression suite guards it | `scripts/harness/tests_security.py` | `python -m pytest tests_security.py -q` → **21 passed in 0.10s**, offline |
| Per-step test suites exist too | `tests_brain.py`, `tests_scaffold.py`, `tests_assets.py`, `tests_preview.py`, `tests_widget_handoff.py` | files present; not re-run this session |
| The pipeline was reviewed adversarially before ship | `docs/harness/lead-to-launch.md` § "Security review — CONVERGED TO SHIP": 10 read-only Codex rounds, finding trend 7→4→3→8→…→0, R10 zero in-model findings | documented in-repo; **self-run**, not a third-party audit |
| The pattern is generalized and reusable | `docs/harness/PATTERN.md` + `scripts/harness/new_harness.py` (scaffolds orchestrator, contract, steps, gates, state, tests for a new harness) | read |
| A revenue-gate screen and a repo kill-list exist | `scripts/harness/money_gate.py` + `money_gates.yaml`; `scripts/harness/kill_list.py` | read; both read-only/advisory |
| Cheap/private text work routes to a local LAN LLM box | `scripts/m3.py` → `http://100.93.184.98:11434`, tailnet-only | read |
| The live site already runs an AI assistant, honestly gated | `CompanySite/functions/api/chat.ts` (Claude-backed, rate-limited, origin-allowlisted, returns 503 rather than a fake reply with no key), wired at `src/layouts/Layout.astro:273` | read |
| Every intake is scored, alerted, and auto-replied | `CompanySite/n8n/m3-lead-os.json`, `functions/_lib/n8n-sink.ts`, `functions/api/lead.ts` | read; live status per `MONEY_LADDER.md` 2026-07-19 |
| Two real client sites are shipped and already published on the site | `src/content/caseStudies/aries.md`, `big7.md` | read — **both predate the harness** |

**Present but uncommitted** (working-tree only as of this writing, so treat as weaker evidence and re-check before citing): `docs/harness/AUTOMATION.md` (how to wire the money gate into every session), `scripts/harness/mcp_server.py` (read-only MCP server exposing the harnesses as tools), `scripts/harness/lead_source.py`.

### Equally true, and it constrains everything below

- **The harness has never carried a real lead to a paid delivery.** `docs/harness/lead-to-launch.md` says so itself ("Money proof comes on the first **real** lead"). Step 8 has never run in production.
- **Checkout is not live.** `offers.ts` → `checkoutReady === false`; `PUBLIC_STRIPE_PAYMENT_LINK` unset (`money_gates.yaml` rung 1, `RELEASES.yaml` 2026-08-19 "blocked"). `/start` gates to the free review.
- **There is no timing baseline.** No before/after, no measured turnaround, no hours-saved figure anywhere in the repo.
- **Nobody outside the fleet has seen or used it.** Zero client exposure, therefore zero client feedback.

That table plus these four lines is the *entire* pool of material any site copy may draw on today.

---

## 2. Positioning options

### Option A — Process, on the existing offer ("you see it working before you pay the balance")

- **Pitch:** *Same $500–$2k custom site, one engineer — built on a pipeline with fixed checkpoints, so you approve the scope, the quote, and a working preview before the balance is due.*
- **Targets:** the existing rung-1 buyer. No new audience, no new product.
- **Where it lives:** `/websites` — a short band or an added `Faq.astro` entry, and one line in `Services.astro` cards 01/02. Nothing new gets built.
- **What it needs to be honest:** at least **one real lead run through gate 7** with the artifacts kept, before any speed or reliability language appears. Describe the *checkpoints* (true today) and not the *speed* (unmeasured). If a turnaround number is ever used, it must come from timestamps on real runs, not an estimate.
- **Risk of saying it too early:** a speed claim with no baseline is fabricated data, and the first slow build turns it into a liability. It also invites "so a bot builds it?" — which cuts against the strongest asset already on the page ("one engineer scopes it, ships it, hands it off").

### Option B — Automation as a service line (extend the quote-only tier)

- **Pitch:** *Beyond websites: gated, resumable automation pipelines for a business process that eats your week — the same discipline I run my own shop on.*
- **Targets:** existing small-business clients with a repetitive internal process; higher ticket, longer sales cycle.
- **Where it lives:** `Services.astro` card 04 ("Premium custom company build", quote-only over $2k) already lists *"Forms, analytics, automations, or backend pieces."* The honest version is a sharpened bullet there — **not** a new `/automation` page.
- **What it needs to be honest:** either one delivered automation for a paying client, or explicit framing as *"proven in-house, first client engagement priced as discovery."* Anything else implies a delivery record that does not exist.
- **Risk of saying it too early:** it sells capability with zero client instances; discovery-heavy work has the longest cash cycle in the ladder, which is backwards while rung 1 is still blocked on a dashboard click; and it adds a second buying decision to a page whose whole job is one decision (free review → scoped site).

### Option C — Engineering proof, no offer change

- **Pitch:** *Here is the machine that builds these sites* — an internal-tooling milestone on the roadmap/ledger, stated as fact, sold as nothing.
- **Targets:** prospects doing credibility diligence before submitting the intake, and employers reading `/resume`.
- **Where it lives:** `src/config/roadmap.ts` (`DROPS`, `status: 'released'` or `'testing'`, `category: 'Product'`) which both `/` and `/roadmap` render, plus a `RELEASES.yaml` entry. Optionally one line on `/resume`.
- **What it needs to be honest:** label it **internal tooling, not a product**; state only the row-1 facts (8 steps, 4 human gates, 21 passing security regression tests, adversarial review rounds run in-house). Say "reviewed in-house," never "audited."
- **Risk of saying it too early:** lowest of the three, but not zero. To a non-technical buyer "10 adversarial review rounds" can read as a security claim, and any automation talk on a company hub can be misread as "your site is machine-generated." Mitigation is framing: internal tooling, human gates named explicitly.

---

## 3. Recommendation

**Do C now. Hold A until one real lead has run through gate 7. Do not do B until a paid non-website automation exists.**

Reasoning, tied to the ladder:

1. **Rung 1 is not blocked on positioning.** `MONEY_LADDER.md` and `money_gates.yaml` agree the blocker is one Mike-only dashboard click — the live Stripe link and the Cloudflare var. No copy change converts more revenue than closing that gate. Any positioning work that competes with it for attention is a rung-1 distraction under LAW #2.
2. **An automation pitch muddies rung 1.** The rung-1 offer is legible precisely because it is one ladder: $500 basic / $1–2k bounded / quote-only over $2k, one engineer, no retainer. B forks the funnel into a second, slower-cash sale before the fast-cash one can even take a payment.
3. **C costs almost nothing and manufactures the proof A needs.** A roadmap entry is a data edit, it is true today, and it starts the artifact trail (dated ledger entry, then a first real run) that later makes A's stronger claim provable instead of asserted.
4. **A is the real prize, just not yet.** "You approve scope, quote, and a live preview before the balance is due" is a genuine differentiator against agencies — and it is already how the harness is built. It only needs one real run to stop being a forward-looking statement.

**Sequence:** close the Stripe gate → run one real lead to gate 7 → publish C → then draft A from what that run actually measured.

---

## 4. Do NOT say yet

Every line here is either untrue or unprovable from the repo as of 2026-09-03.

- **Any speed number.** "48-hour sites", "sites in days", "10x faster", "same-week launch". No measured baseline exists.
- **"Fully automated" / "AI builds your site while you sleep."** False by design — 4 of 8 steps are hard human stops, and step 8 has never run in production.
- **Any harness outcome metric.** Clients served, hours saved, cost cut, ROI, conversion lift. Zero paid deliveries have gone through it.
- **Testimonials or quotes about the automation.** None exist. Do not write one "for illustration."
- **"Audited", "penetration-tested", "security-certified", "SOC 2", "enterprise-grade", "99.9% uptime".** The review was a self-run read-only Codex loop plus 21 in-repo tests. Say "reviewed in-house" and cite the test count, or say nothing.
- **Plural-team language.** "Our team", "our AI agents", "our engineers", "AI-powered agency". One engineer — and the page's current trust position depends on that being literal.
- **Naming Aries or Big7 as harness-built.** Both shipped before the harness existed. Reusing them as automation proof would be a false attribution on a live case study.
- **Anything implying checkout or instant purchase for automation work.** `checkoutReady === false`; the site cannot take a payment for anything right now.
- **Client-data privacy guarantees based on the local LLM box.** `scripts/m3.py` is a developer routing tool; no committed policy governs client data through it. A privacy promise needs a written policy first.
- **"Proven" / "battle-tested" applied to the pipeline.** It is tested and reviewed. It is not proven until a real lead becomes a paid delivery.

---

## 5. Exact next step if an option is approved

**If C is approved (recommended):**

1. Add one entry to `CompanySite/src/config/roadmap.ts` → `DROPS` array, `category: 'Product'`, status per the file's own rule (`'testing'` until Michael declares a public release — a reachable thing is not a release). Blurb drawn only from § 1 row 1.
2. Add the matching entry to `CompanySite/RELEASES.yaml` (`kind:`, `title:`, `notes:`, `public:` set by Michael).
3. No other file. `/` and `/roadmap` both render from `DROPS`, so no component, layout, or route edit is needed.

**If A is approved:** the edit is `src/components/Faq.astro` (one new Q/A) and one line in the card 01/02 `body` strings in `src/components/Services.astro`. Gate it behind one completed real run.

**If B is approved:** the edit is a single bullet in the `custom-builds` card in `src/components/Services.astro`. Nothing else — no new page, no new route.

**In every case:** Michael reviews the exact wording before it is committed, and `npm run build` must be green (the placeholder fence in `scripts/check-shipped-placeholders.mjs` runs on build) before any deploy. No deploy happens on an agent's judgment — production is a LAW #7 surface.
