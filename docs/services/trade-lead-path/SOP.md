# M³ Trade Lead-Path Machine — Internal SOP

Source scope: `the-grind/fleet-research/future-project-scopes/04-m3-trade-lead-path-machine.md`.
This SOP packages what already ships across CompanySite, SiteAudit, and the n8n Lead OS into one
repeatable delivery flow for trade businesses (outdoor living, construction, home services). It is
an **ops playbook**, not new software — every step below cites the file or tool that already exists.

Audience: Michael, running this solo. If a future agent is told to "run the trade lead-path SOP,"
this is the entire policy — don't invent numbers or steps not written here.

---

## 0. What's real today vs. what's new

| Piece | Status |
|---|---|
| Free video teardown (mini-audit + TikTok script) | **Real.** `SiteAudit/` — `sitebot audit <url>` produces a 3-bullet DM + TikTok script via the 30-point scorecard. |
| Fixed-price build tiers | **Real.** CompanySite's existing offer ladder (see § 2). No new pricing invented here. |
| `/for/{trade}` landing pages | **Real.** `CompanySite/src/pages/for/` already has `construction.astro`, `home-services.astro`, `outdoor-living.astro`. |
| `/audit` intake page | **Real.** `CompanySite/src/pages/audit.astro`. |
| n8n Lead OS (triage, hot-lead alert, 48h nudge) | **Real.** `CompanySite/n8n/m3-lead-os.json` + `CompanySite/n8n/README.md`. Dark-launch safe — works with or without `N8N_LEAD_WEBHOOK_URL` set. |
| SiteAudit Definition-of-Done grading (A-/green checks) | **Real** as a scoring mechanism (`SiteAudit/siteaudit/scorecard.py`, 30-point rubric). Using it as a contractual "delivery gate" for client builds is a **new usage**, not a new tool. |
| Monthly monitoring retainer ($199–$499/mo) | **New / unvalidated.** No subscription billing, no recurring SiteAudit cron, no client portal exists yet. Treat as an experiment to pitch, not a shipped product — see § 5. |
| `/start` Stripe checkout flow | **Out of scope for this SOP** — being built in a separate, parallel session. Do not reference a live payment link until that work ships; use the manual Payment Link process in § 3 until then. |

---

## 1. The journey (as it runs today)

TikTok/IG video → `/for/{trade}` or `/audit` bio link → teardown delivered (DM, <24h SLA) →
quote conversation → client picks a tier → build → SiteAudit grade ≥ A- before handoff →
n8n lead triage enabled on the new site → optional monitor retainer pitch.

---

## 2. Fixed-price build tiers (existing ladder — do not invent new numbers)

Pulled verbatim from `CompanySite/CLAUDE.md` and `CompanySite/README.md` — this is the live
public ladder, not a trade-specific price list:

| Tier | Price posture | Best fit |
|---|---|---|
| Basic starter / refresh | from **$500** | simple credibility site, one-page refresh, quick lead capture |
| Business site package | **$1,000–$2,000** | small to corporate-style local/regional company site — proof, intake, services, deployment |
| Premium custom | **quote-only over $2,000** | Aries/Big7-caliber rebuilds, larger content, integrations, portals, payments, automation |

20% down, nonrefundable — already the fleet's stated refund policy (scope doc § 20–21). Do not
change this without Michael's sign-off; it's a business-terms decision, not a docs decision.

---

## 3. Step-by-step delivery

### Step 1 — Teardown (SLA: <24h from request)

1. Get the URL from a DM, `/audit` form submission, or a live find during content research.
2. Run: `cd SiteAudit && ./run.sh audit <url> --business "<trade type>"` (or `make audit URL=... BUSINESS=...`).
3. Copy the 3-bullet mini-audit into the DM reply. Copy the TikTok script into `CONTENT.md` /
   the content queue if it's usable.
4. **Never fabricate a finding.** If a check returns `unknown — check couldn't run`, say so in the
   DM. This is a SiteAudit non-negotiable (`SiteAudit/CLAUDE.md`) and it applies to the client
   conversation too — do not smooth over an unknown into a claim.
5. Log the teardown as delivered (manual checkbox for now — see § 6 Observability).

### Step 2 — Quote conversation

1. Match the prospect's need to a tier from § 2. Do not quote a number outside that ladder.
2. Anything Aries/Big7-caliber (portals, payments, custom integrations, heavy content) is
   quote-only — scope it like a real project, not a fixed SKU.
3. State the timeline expectation from § 4 up front.
4. Take the 20% deposit (nonrefundable) before work starts. Until the CompanySite `/start` Stripe
   flow ships, use a manual Stripe Payment Link per client (scope doc § 25, § 37 — "Payment Link
   for $500" is the first experiment to run).

### Step 3 — Build

1. Build using CompanySite's own conventions as the reference: mobile-first (375px first —
   `CompanySite/CLAUDE.md` rule), `data-cta` on every CTA, case-study pattern from
   `src/content/caseStudies/`.
2. Reuse `/for/{trade}` landing patterns already in the repo for trade-specific pages rather than
   building a new template per client.
3. Fleet a11y baseline applies (LAW #11) — this is non-negotiable on every delivered site.

### Step 4 — Definition of Done gate

1. Run `sitebot check <client-url>` (or `make check URL=...`) against the delivered site.
2. Delivery bar: **SiteAudit grade ≥ A-**, or every check in the four categories (Lead Capture,
   Trust, Speed, Findability) green/passing where technically applicable to that site.
3. If a check can't pass for a structural reason (e.g., client refuses a phone number on site),
   document the exception in the client handoff notes — don't silently ship a failing grade.

### Step 5 — n8n lead triage handoff

1. Import `CompanySite/n8n/m3-lead-os.json` into the client's n8n instance (or a shared M³ n8n
   instance if the client doesn't run their own — decide per engagement, not assumed).
2. Follow `CompanySite/n8n/README.md` setup: webhook path, shared secret, alert channel wiring
   (email/Discord/Slack/Sheets — client's existing tools, don't force a new one on them).
3. Smoke test per the README's curl example before calling this step done.
4. This step is **dark-launch safe** — if the client isn't ready for n8n yet, the site's existing
   Resend lead email keeps working with n8n unset. Never block handoff on n8n being wired.

### Step 6 — Optional monitor retainer pitch (new, unvalidated — see § 5)

Only pitch this after at least one full build cycle proves the delivery flow. Do not promise
recurring monitoring as if a shipped subscription product exists yet.

---

## 4. Timeline expectations (to state to the client)

- Teardown: within 24 hours of request.
- Build: per tier, scoped at quote time — do not promise a fleet-wide fixed build timeline;
  set it per project during the quote conversation (scope doc has no fixed day-count for build,
  only for the teardown SLA — don't invent one here).
- Deposit: 20%, nonrefundable, due before build starts.

---

## 5. Monitor retainer — explicitly unvalidated

The scope doc proposes $199–$499/mo SiteAudit monitoring (§ 34) and a rush-teardown add-on
($149, § 34). **Neither exists as a billed product today.** Before pitching either:

- No recurring billing is wired (no Stripe subscription, no invoicing automation for this).
- No scheduled/cron re-audit exists — `sitebot diff` supports comparing two manual snapshots,
  not an automated recurring one.
- Monthly report PDF is explicitly manual-OK per the scope doc (§ 17) — don't promise automation
  that isn't built.

If Michael wants to pilot this, treat it as **one manual retainer client** first (scope doc § 47 —
"3 monitor clients" is a 90-day goal, not a day-one offering), tracked by hand, before building
any recurring infrastructure. This is a Law #5 (open stack) call: prove the manual version earns
before automating it.

---

## 6. Observability (manual for now)

- Teardown delivered: track by hand (spreadsheet or Cockpit) until volume justifies automation.
- n8n execution stats: visible in the n8n instance itself once Step 5 is wired.
- SiteAudit history: `sitebot diff` between two `--json` snapshots shows what moved.

---

## 7. Non-goals (explicit, from scope doc § 18)

- Do not run client ad campaigns as part of this offer.
- Do not build a full CRM.
- Do not staff or promise a call center.

## 8. Guardrails carried over from fleet LAWS

- LAW #6 (never fake it): no fabricated reviews, phone numbers, or client testimonials — ever,
  on any teardown, offer sheet, or case study.
- LAW #9 (rights-clean only): only use client-provided or licensed assets in delivered sites and
  in any teardown/TikTok content made from their site.
- LAW #11 (accessibility): every delivered site meets the WCAG 2.1 AA baseline — retrofit on
  discovery, don't ask permission.
- Brand: always "M³" in any client-facing copy generated from this SOP — never "Offload Labs."

## 9. Manual gates this SOP generates

- Filming teardown videos / trade-specific TikTok content — Michael only.
- Client calls and quote conversations — Michael only.
- Stripe Payment Link creation per client (until `/start` checkout ships) — Michael only.
- GBP (Google Business Profile) claims mentioned in the wider scope doc — out of this SOP's
  scope entirely; not addressed here.
