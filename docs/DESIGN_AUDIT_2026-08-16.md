# Design Audit — CompanySite (m3mm.net) — 2026-08-16

**BUYER VERDICT: The money path (home → `/start` → intake) looks worth $500–$2,000 and I'd hire this person. `/roadmap` and `/hub` are the opposite — they contradict the portfolio's proof, ship a visible `it\'s` typo, use a meme font, and their only CTA dumps the buyer on raw JSON. Today they subtract credibility rather than adding it.**

Audit scope: read-only. No source edits, no branch switch, no commit, no form submission. Branch `fix/checkout-placeholder-fence` untouched.

## Method (LAW #6 — what was actually verified)

Every contrast number and 375px result below is **measured from the rendered page**, not computed from source.

- Served from the already-running preview on `localhost:4321` (reused, not killed).
- Chrome extension `tabs_context_mcp` failed twice ("No group with id"). Fell back to **puppeteer-core driving Google Chrome** (`C:/Program Files/Google/Chrome/Application/chrome.exe`) — the sanctioned fallback. No Opera. No `switch_browser`/`select_browser` call.
- 375×812 with `isMobile: true` device emulation. An earlier pass using raw `chrome --headless --window-size=375` produced *false* overflow on every page — Windows headless enforces a ~500px minimum window width and the screenshot is cropped from it. Those results were discarded.
- Contrast measured by walking the live DOM, resolving each text node's computed `color` against its nearest opaque ancestor background, compositing alpha, and applying WCAG 1.4.3 thresholds (4.5:1 normal, 3:1 large ≥24px or ≥18.66px bold).
- `/api/lead` behavior established by **reading `functions/api/lead.ts`**, never by POSTing. No lead row was created.

---

## `/roadmap` + `/hub` — dedicated section

### The credibility call: the page has not decided what it is

`/roadmap` publicly commits to 21 drops, one every two weeks, Sep 1 2026 → Jun 8 2027. Judged as a promise a stranger will hold him to, it fails — but *which* way it fails depends on a question the page never answers.

The lede says: *"Each drop is code that **already runs**. No vaporware."* The timeline then renders **19 of 21 entries as red "UPCOMING"** with "Notify me" buttons. Those two statements are incompatible, and they're visible in the same screenful.

**Reading A — it's a build schedule.** Then it is not credible. LAW #10 gives real build windows of Fri 8:20–9:10am, Sat morning, Sat afternoon, Sun afternoon ≈ **13 hrs/week ≈ 26 hrs per drop**. The list asks for, in 26 hours each: `PersonalPortal` ("six .NET 9 Blazor micro-portals ... sharing one design system"), `CockpitCloud` (hosted multi-user SaaS), `AIMA` (RAG SaaS for regulated industries), `LearnMicroservices` (long-form course *plus* reference-implementation repo). Each is a multi-month effort. A technical buyer prices that instantly and discounts everything else on the page.

**Reading B — it's a release schedule for code that already exists.** Several entries *are* real fleet tools today (PhotoPicker, HandoffKit, SiteGuide). But then the `upcoming` statuses, red pips, and "Notify me" CTAs are all wrong, and it collides head-on with the home page (below).

**Call: pick one, then make the data match the copy.** Reading B is the honest and stronger pitch — "ten months of receipts, already built" beats "I will build 21 products in my spare time." It is also the only reading that survives contact with the portfolio.

### The claim that breaks it: home and roadmap contradict each other

This is the most expensive finding in the audit.

| Surface | Says |
|---|---|
| `src/components/Hero.astro:89–98` | "**12.** Client sites shipped, every one still live." · Aries "Sold at handoff · first quote request 3 days after launch" · Big 7 "Build + Repair lanes live at big7construction.com" |
| `src/config/roadmap.ts` → `/roadmap`, `/hub` | **1 live.** `AriesOutdoorLiving` = `next`, ships **SEP 15 2026**. `Big7Construction` = `upcoming`, ships **OCT 27 2026**. |

The home page sells Aries and Big7 as delivered, paid, live proof. The roadmap lists both as unshipped future work. A buyer who opens both concludes the case studies are inflated — which poisons the single strongest asset on the site. Fix the roadmap data, not the case studies.

### The first checkable claim on the page is false

`src/pages/roadmap.astro:133` — *"Dates target Mondays."*

**All 21 dates are Tuesdays.** Verified: 2026-09-01 Tue, 2026-09-15 Tue, 2026-09-29 Tue … 2027-06-08 Tue (cadence is a clean +14d throughout, so the cadence claim itself is sound). On a page whose entire pitch is "public receipts, checkable promises," the very first verifiable statement doesn't survive a glance at a calendar. Either shift every date −1 day or change the word to "Tuesdays."

### The only CTA on `/roadmap` is broken

`src/pages/roadmap.astro:88` posts a native `<form action="/api/lead" method="POST">`.

- The only submit handler in the codebase is `src/components/Intake.astro:283`, scoped to the intake form. Neither new page loads it — `dist/roadmap/index.html` and `dist/hub/index.html` contain **zero** `preventDefault`.
- `functions/api/lead.ts` accepts urlencoded (line 140, the documented no-JS fallback) but **never redirects** — `isForm` appears only in the content-type gate at lines 140–141, and every reply returns through `jsonResponse()`.

Net: submitting navigates the buyer to `/api/lead` and shows raw `{"ok":true,...}`. That violates `CONVERSION_STANDARDS.md § 1` "no dead-end CTAs" — the rule the Layout and Header already bend over backwards to honor elsewhere. Not verified by submitting (would create a live n8n row); established from source.

### Design-system fork

`tailwind.config.mjs:1–22` documents the v4 "CONFIDENT STUDIO" reset in unusually explicit terms: the cyberpunk/neon theme was **deliberately removed** because *"a gamer/anime aesthetic answers a different question than the one this page needs to answer,"* and the buyer is a contractor deciding whether to trust this person with their company's public face.

`/roadmap` and `/hub` reintroduce exactly that: `--red: #ff2d3d`, `--green: #22ff66`, `--amber: #ffb020`, fixed scanline overlay, pulsing LED pips, all-mono body copy. Two visits, two companies.

Three concrete problems beyond the aesthetic split:

1. **`Impact` is the display face** (`roadmap.astro:176,208,223,306,315,398`; `hub.astro:136,173,267,293`). Impact is the image-macro/meme font. It also does not exist on Android or most Linux, so those buyers get `Arial Black` or generic sans and the pages render differently per device. The rest of the site self-hosts Space Grotesk as one variable woff2 precisely to avoid that.
2. **~40 hardcoded hexes** across the two files. Project `CLAUDE.md` Rules: *"Design tokens live in `tailwind.config.mjs`. Do not hardcode hex outside there."*
3. `roadmap.astro:176` falls back to `var(--tw-font-display, sans-serif)` — Tailwind emits no such variable, so it is always the `sans-serif` fallback. Dead code.

### Visible typo shipping to production

`src/pages/hub.astro:40` → `dist/hub/index.html` renders literally:

> Every M³ product and tool, in one place. Green means it\'s live right now

An escaped apostrophe inside an Astro template literal that didn't need escaping. It is in the first sentence of the page, at 17px. On a portfolio page for a web-design business this reads as carelessness more than any subtle design flaw does.

### Nobody can find either page

Neither `/roadmap` nor `/hub` is linked from `Header.astro`, `Footer.astro`, or the home page. The only inbound links are the two pages pointing at each other. Both are in `sitemap.xml`, so they're indexable but unreachable by browsing. Both render `<Header minimal={true} />`, which drops the primary nav entirely — a visitor landing from a TikTok link gets no route back into the offer except the "Free review" button.

That cuts both ways: the contradiction above only fires for buyers who find these pages, but the roadmap also can't do the credibility work it was built for.

---

## Findings

| # | Sev | File:line | Issue | Fix |
|---|---|---|---|---|
| 1 | **Blocker** | `src/pages/roadmap.astro:88` | Only CTA on the page dead-ends on raw JSON — no submit handler, endpoint never redirects | Add a fetch handler mirroring `Intake.astro:283`, or return `303 → /thanks` for `isForm` in `functions/api/lead.ts` |
| 2 | **Blocker** | `src/config/roadmap.ts` vs `src/components/Hero.astro:89–98` | Home sells Aries/Big7 as shipped + live; roadmap lists both as unshipped. Makes case studies look fabricated | Set Aries + Big7 `status:'live'` with real ship dates; reconcile `LAUNCH_STATS.live` against the "12 shipped" claim |
| 3 | **High** | `src/pages/roadmap.astro:133` | "Dates target Mondays" — all 21 dates are Tuesdays | Shift dates −1d, or change the word |
| 4 | **High** | `roadmap.astro:44–49` + `src/config/roadmap.ts` | "Each drop is code that already runs. No vaporware" vs 19/21 rendered "UPCOMING" | Decide build-schedule vs release-schedule; make copy and statuses agree |
| 5 | **High** | `src/pages/hub.astro:40` | `it\'s` ships literally to production HTML | Unescape the apostrophe |
| 6 | **High** | `roadmap.astro:141–442`, `hub.astro:103–339` | Design-system fork — reintroduces the neon/cyberpunk direction v4 explicitly removed; ~40 hardcoded hexes | Re-skin both onto `clay`/`ink`/`bone` tokens; keep green/amber **only** as status semaphores |
| 7 | **High** | `roadmap.astro:176,208,223,306,315,398`; `hub.astro:136,173,267,293` | `Impact` as display face — meme font; absent on Android/Linux → per-device rendering drift | Use the already-loaded Space Grotesk |
| 8 | **A11y** | `roadmap.astro:412` `.fine`, `hub.astro:263` `.tile-date` | **2.37:1** — WCAG 1.4.3 fail | Raise `--ink-mute` to ≥ `#8a8a99` |
| 9 | **A11y** | `roadmap.astro:425`, `hub.astro:327` `.foot-note` | **2.62:1** — WCAG 1.4.3 fail | Same |
| 10 | **A11y** | `src/components/Intake.astro` (step numbers `.text-clay/60`) | **3.51:1** at 11px/500 — WCAG 1.4.3 fail. Present on `/`, `/start`, `/audit`, all `/for/*` | Drop the `/60` opacity → `text-clay` = 7.47:1 |
| 11 | Medium | `Header.astro`, `Footer.astro` | `/roadmap` + `/hub` are orphans — zero inbound links | Add to footer nav |
| 12 | Medium | `roadmap.astro:28`, `hub.astro:24` | `minimal={true}` strips primary nav; TikTok landers have no route into the offer | Use the full header |
| 13 | Low | `roadmap.astro:176` | `var(--tw-font-display, …)` — variable Tailwind never emits | Remove |
| 14 | Low | `roadmap.astro:270,283`, `hub.astro` `--line: #24242f` | Card borders at **1.14–1.26:1** — structure is invisible. Decorative, so not an AA failure | Lighten to ~`#3a3a48` |
| 15 | Low | `TwoDoor.astro:38`, `Footer.astro:45`, `Services.astro:195` etc. | `target="_blank"` with no "opens in new tab" cue — WCAG 3.2.5 (**AAA**, not AA) | Optional |

---

## LAW #11 a11y matrix — measured across all 11 pages

Legend: PASS = verified in the rendered DOM.

| Page | `lang` | Skip link (valid target) | single `<main>` | exactly one `h1` | img `alt` | inputs labeled | icon-only ARIA | `/accessibility` linked | reduced-motion | `:focus-visible` |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | PASS | PASS | PASS | PASS | 4/4 | PASS | PASS | PASS | PASS | PASS |
| `/roadmap` | PASS | PASS | PASS | PASS | 2/2 | PASS | PASS | PASS | PASS | PASS |
| `/hub` | PASS | PASS | PASS | PASS | 2/2 | PASS | PASS | PASS | PASS | PASS |
| `/start` | PASS | PASS | PASS | PASS | 3/3 | PASS | PASS | PASS | PASS | PASS |
| `/start/thanks` | PASS | PASS | PASS | PASS | 2/2 | PASS | PASS | PASS | PASS | PASS |
| `/audit` | PASS | PASS | PASS | PASS | 3/3 | PASS | PASS | PASS | PASS | PASS |
| `/thanks` | PASS | PASS | PASS | PASS | 2/2 | PASS | PASS | PASS | PASS | PASS |
| `/for/construction` | PASS | PASS | PASS | PASS | 3/3 | PASS | PASS | PASS | PASS | PASS |
| `/for/outdoor-living` | PASS | PASS | PASS | PASS | 3/3 | PASS | PASS | PASS | PASS | PASS |
| `/for/home-services` | PASS | PASS | PASS | PASS | 3/3 | PASS | PASS | PASS | PASS | PASS |
| `/accessibility` | PASS | PASS | PASS | PASS | 2/2 | PASS | PASS | PASS | PASS | PASS |

**Structural LAW #11 baseline is clean on all 11 pages, including the two new ones.** Zero controls lacking an accessible name site-wide (an earlier flag on the `/` SiteGuide link was a false positive from `innerText` on a not-yet-painted element — retracted). Heading order is well-formed on both new pages (`h1` → `h2` quarter/tile → `h3` drop). The `/roadmap` honeypot is correctly `aria-hidden` + `tabindex="-1"` and its 24px height is therefore not a real target-size issue. Both new pages correctly gate scanlines, LED pulse, and tile transforms behind `prefers-reduced-motion: reduce`.

**The only LAW #11 violations are contrast (1.4.3).** They are findings 8–10.

---

## Measured contrast (rendered DOM, WCAG 1.4.3)

### Failures

| Ratio | Need | Element | fg → bg | Size/weight | Pages |
|---|---|---|---|---|---|
| **2.37:1** | 4.5 | `.fine`, `.tile-date` | `#55555f` → `#191922` | 12px/400, 10px/400 | `/roadmap`, `/hub` |
| **2.62:1** | 4.5 | `.foot-note` | `#55555f` → `#0D0E14` | 12px/400 | `/roadmap`, `/hub` |
| **3.51:1** | 4.5 | `.text-clay/60` step numbers | `rgba(79,184,199,.6)` → `#161A24` | 11px/500 | `/`, `/start`, `/audit`, `/for/*` |

Root cause of the two worst: `--ink-mute: #55555f`, declared identically at `roadmap.astro:151` and `hub.astro:112`.

### Passing (established palette — for reference)

| Ratio | Pair |
|---|---|
| 16.74:1 | `bone #EDEFF3` on `ink #0D0E14` |
| 14.30:1 | `#e8e8ee` on `--card #191922` |
| 12.93:1 | `--green #22ff66` on `--card` |
| 10.04:1 | `bone.dim #B7BBC7` on `ink` |
| 9.54:1 | `--amber #ffb020` on `--card` |
| 8.27:1 | `clay #4FB8C7` on `ink` · and `ink` on `clay` (button) |
| 5.69:1 | `#000` on `--red` (signup button) |
| 5.40:1 | `bone.muted #82879A` on `ink` |
| 5.22:1 | `--red #ff2d3d` on `ink` |
| 4.87:1 | `bone.muted` on `ink.soft #161A24` |
| 4.73:1 | `--red` on `--card` |
| 4.50:1 | `bone.muted` on `ink.panel #1D212C` — exactly at threshold, no margin |

`clay.deep #2E7A85` on `ink` = **3.89:1** — fine for borders/large text, would fail as body copy. Not currently used as body copy.

---

## 375px mobile pass

**Zero horizontal overflow on all 11 pages** (`documentElement.scrollWidth === 375` everywhere). Verified under real device emulation.

- Both new pages collapse correctly: `.item` goes `110px 1fr` → `1fr` at ≤640px, timeline rail reflows, `.date` switches from right-border to bottom-border. `/hub` tiles go single-column via `auto-fill minmax(280px, 1fr)`.
- Tap targets: primary CTAs are 38–43px tall; `LAUNCH`/`NOTIFY ME` are 38×92. Header logo is 36×36. All clear WCAG 2.2 AA (2.5.8, 24px); none reach the 44px AAA bar. Inline text links are exempt. **No AA failure.**
- Sticky mobile CTA behaves correctly on the new pages — routes to `/audit#intake` rather than a dead `#intake`.
- `/hub` at 375px is a long single-column scroll of 21 near-identical tiles with no filter or jump-nav. Functional, tedious.

---

## Fleet personality test

Root `CLAUDE.md`: *direct, competitive, high-signal, visually confident, money-path-focused* — and explicitly **not** bland SaaS filler or generic AI polish.

**Home, `/start`, `/audit`, `/for/*`: passes, clearly.** "Websites that get you customers." / "Tell me what's broken. I'll tell you what to fix." / "2 MIN · NO SALES CALL" / "One engineer scopes it, ships it, hands it off — no agency middlemen." That is a voice, and it's his. `/start` is the best page on the site: the price ladder is legible in under five seconds ($500 full, $100 down, $400 balance, 20% down), and the "checkout isn't wired up yet — the offer stands exactly as listed" panel converts a missing feature into a trust signal. Honest and disarming.

**`/roadmap` and `/hub`: fails, in an unexpected direction.** Not bland — *overcorrected*. Scanlines, pulsing LEDs, Impact, and a red/green/amber semaphore is video-game HUD, not a studio that charges $2,000 to build a contractor's public face. It signals "hobbyist dashboard." The copy voice is right ("No vaporware, no waitlists that never resolve" is genuinely good); the visual layer is answering a different question, which is the exact diagnosis `tailwind.config.mjs` already wrote down about the theme it replaced.

**Offer legibility in 5 seconds:** home passes — hero, "from $500", two-door split, `12` shipped stat, all above or near the fold. Pricing is honest and findable in three places (`/start`, `#services`, JSON-LD `hasOfferCatalog`).

**Case-study proof:** Big7 lands — real screenshot, real problem/outcome, live URL, descriptive `imageAlt`. Aries is the flagship and is the weaker of the two: its 1.3MB `aries-scroll-v2.mp4` is lazy-mounted, and until it plays the slot is a near-black rectangle (`aries-poster.jpg` is only 8KB and very dark). The best proof on the site opens as an empty box. Worth a brighter poster frame.

---

## Prioritized fix list

### A11y-mandatory (LAW #11 — retrofit on discovery, do not defer)

1. **`--ink-mute: #55555f` → `#8a8a99`** in `roadmap.astro:151` and `hub.astro:112`. Clears 2.37:1 and 2.62:1 in one edit; `#8a8a99` already measures 5.13:1 on `--card` and 5.67:1 on ground. *(findings 8, 9)*
2. **Drop the `/60` opacity on Intake step numbers** — `text-clay/60` → `text-clay`, 3.51:1 → 7.47:1. Touches `/`, `/start`, `/audit`, `/for/*`. *(finding 10)*

That is the complete AA remediation. Everything else already passes.

### Money-path-mandatory (not a11y, but costs leads or trust)

3. **Fix the `/roadmap` form dead-end** — finding 1. Cheapest correct fix: return `303 → /thanks` when `isForm` in `functions/api/lead.ts`, which also hardens the documented no-JS path for *every* form on the site. Money-path change → per root `CLAUDE.md`, gets a Codex second opinion before it ships.
4. **Reconcile roadmap statuses with the case studies** — finding 2. Highest-value edit in this document; it's a data change in `src/config/roadmap.ts`, not a redesign.
5. **"Mondays" → "Tuesdays"** — finding 3. One word.
6. **Unescape `it\'s`** — finding 5. One character.
7. **Resolve the "already runs" vs 19 × "UPCOMING" contradiction** — finding 4.

### Design-discretionary (real, but Michael's call)

8. Re-skin `/roadmap` + `/hub` onto `clay`/`ink`/`bone`; keep green/amber strictly as status semaphores. *(finding 6)*
9. Replace `Impact` with Space Grotesk. *(finding 7)* — cheap, and removes the per-device rendering drift.
10. Link both pages from the footer; use the full header. *(findings 11, 12)*
11. Brighter `aries-poster.jpg` so the flagship case study doesn't open as a black box.
12. Lighten `--line` to ~`#3a3a48`. *(finding 14)*
13. Remove the dead `--tw-font-display` fallback. *(finding 13)*

**If only three things get done:** #1 and #2 (the entire AA debt, ~2 lines), then #4 (the contradiction that makes the proof look fake).

---

*Audit performed read-only against the `fix/checkout-placeholder-fence` build. No source file modified, no branch switched, no commit, no deploy, no lead submitted, preview server left running.*

---

# Remediation pass — 2026-08-17 (branch `design/a11y-2026-08-17`)

## Fixed

### 1. Contrast — findings 8, 9, 10 (the complete AA debt)

`--ink-mute` raised **`#55555f` → `#8a8a99`** in `src/pages/roadmap.astro` and
`src/pages/hub.astro`. Verified rendered in Chrome against **every** background
the token actually paints text on, not just the two the audit named:

| Element | fg → bg | Before | After | Need |
|---|---|---|---|---|
| `.fine` (roadmap) | `#55555f` → `#191922` (`--card`) | **2.37:1** | **5.13:1** | 4.5 |
| `.tile-date` (hub) | `#55555f` → `#191922` | **2.37:1** | **5.13:1** | 4.5 |
| `.foot-note` (both) | `#55555f` → `#0D0E14` (ground) | **2.62:1** | **5.67:1** | 4.5 |
| Intake step numbers `01`–`05` | `#387986` → `#161A24` | **3.52:1** | **7.47:1** (`#4FB8C7`) | 4.5 |

`#8a8a99` verified, adopted. It is **the dimmest grey this palette can carry**:
the binding constraint is `--card #191922`, which needs L ≥ 0.2208 for 4.5:1.
`#8a8a99` sits at L = 0.2588 (5.13:1); one step down, `#808090` (L = 0.2204),
measures **4.49:1** and fails. That is why `--ink-mute` now equals `--ink-dim` — the two
tokens are kept separate for intent, not because a compliant gap exists between
them. The remaining hierarchy is carried by size (12px/10px vs 14px), which was
already true.

Intake step numbers: `text-clay/60` → `text-clay` on all five labels
(`Intake.astro` 127/139/154/177/192). The `optional` labels next to them use
`text-bone-muted` at 4.87:1 and were left alone. `Hero.astro:42`'s `text-clay/60`
is an SVG underline, not text — untouched.

Full-page rescan in Chrome after the change: **0 contrast failures** across `/`,
`/roadmap`, `/hub`, `/start`, `/audit`, `/for/construction`, `/thanks`.
Pinned by `tests/build/muted-text-contrast.test.ts`.

### 2. `it\'s` — finding 5

`hub.astro:40` unescaped. The apostrophe sat in HTML template text, where Astro
has nothing to escape; the backslash rendered literally. (Note the same
`\'` **is** correct inside the `<script>` blocks — that is JS string escaping,
and `Intake.astro:341` relies on it. Only the markup one was wrong.)

### 3. `/roadmap` signup dead-end — finding 1

The audit found no submit handler and no redirect. A second, worse defect sat
underneath it: the endpoint requires `frustration` with a 10-character floor
(`functions/_lib/validate.ts:99–100`), and the form's only free-text box was
optional with no minimum. **The form could not have produced a successful lead
at all** — a bare email submit answered `400 {"error":"validation"}`, rendered
as raw JSON. Both halves are fixed:

- **`roadmap.astro`** — the form gets an id, a `submit` handler mirroring
  `Intake.astro:283` (JSON POST → `/thanks`, `role="status"` live region on
  failure with the manual-email escape hatch), and a hidden `frustration`
  default so a JS-less native POST is still a complete lead. The visible box is
  renamed `topics` and folded into the note field by the handler, which also
  clears the 10-char floor. `novalidate` removed so the browser enforces the
  email field on both paths.
- **`functions/api/lead.ts`** — successful **urlencoded** submits now answer
  **`303 → /thanks`** instead of JSON, which hardens the documented no-JS path
  for every form on the site, not just this one. The destination is a
  hard-coded same-site constant, never read from the request, so the route
  cannot become an open redirect. JSON callers are byte-identical to before.
  The honeypot's silent success redirects too, so bots cannot distinguish it.

**Verified without submitting anything.** `/api/lead` was exercised in-process
by vitest with an empty `env` (Resend / n8n / Cockpit sinks all no-op), and the
browser path was driven in real Chrome with `/api/lead` intercepted at the
network layer — the request never left the browser. Confirmed: status region
reveals, payload is
`{"frustration":"Roadmap subscriber wants: AIMA", …}`, navigation lands on
`/thanks` rendering "Got it. Reply within 24 hours." **No production lead row
was created.**

Method note: `functions/api/lead.ts` keeps `params.get('referredBy')` verbatim —
`tests/build/referral-program.test.ts:59` pins that exact string, so the
urlencoded parser was deliberately left alone.

New tests: `tests/functions/lead-form-redirect.test.ts` (6),
`tests/build/roadmap-signup.test.ts` (6), `tests/build/muted-text-contrast.test.ts` (4).
Suite **431 → 447 passed / 2 skipped / 449**, 35 files. `npm run build` clean,
placeholder fence clean.

## Deferred — needs Michael's factual answer, not an agent's guess

### D1. Roadmap vs. home page: which is lying about Aries and Big7? **(decide first)**

Exact contradiction, both live on `m3mm.net` today:

| Surface | Aries Outdoor Living | Big 7 Construction | Headline count |
|---|---|---|---|
| `src/components/Hero.astro:88–102` | "Sold at handoff · first quote request 3 days after launch." | "Build + Repair lanes live at big7construction.com." | "**12.** Client sites shipped, every one still live." |
| `src/config/roadmap.ts:54` / `:83` → `/roadmap`, `/hub` | `status: 'next'`, ships **SEP 15 2026** | `status: 'upcoming'`, ships **OCT 27 2026**, and carries **no `url`** | `LAUNCH_STATS.live` = **1** (1 live / 1 next / 19 upcoming) |

`functions/api/lead.ts:298–299` also puts both in the automated reply to every
lead, phrased as completed work.

**Recommendation: the roadmap data is the wrong one.** Root `MONEY_LADDER.md:14`
records Aries V1 as "client-owned V1 is **live+sold**" with V2 as the
client-approved rebuild in progress, and rung 3 tracks Big7 as a live client
reference (PR #12 open against a redirect-parity branch, not an unbuilt site).
The concrete edit would be `status: 'live'` on both entries with their real ship
dates and `url: 'https://big7construction.com'` added, then `LAUNCH_STATS.live`
reconciled against the "12 shipped" claim — the roadmap counts *drops*, the hero
counts *client sites*, and the two numbers are not the same quantity, so
whichever way this lands the page should say which it is counting.

**Not changed here.** These are published claims about paying clients' delivered
work; correcting them in the wrong direction misrepresents a client either way.
Michael's call.

### D2. "Code that already runs" vs. 19 × red UPCOMING

`roadmap.astro:44–49` promises *"Each drop is code that already runs. No
vaporware."* `src/config/roadmap.ts` renders **19 of 21** entries as red
`UPCOMING` with "Notify me" buttons, in the same screenful. Depends entirely on
D1: if the roadmap is a *release* schedule for existing code, most statuses are
wrong; if it is a *build* schedule, the lede is wrong. One of the two has to
give. See the "credibility call" section above for the full reasoning.

### D3. "Dates target Mondays" — all 21 dates are Tuesdays

`roadmap.astro:133`. Re-verified 2026-08-17 against `src/config/roadmap.ts`:
every ISO date from `2026-09-01` to `2027-06-08` is a Tuesday, on a clean +14d
cadence. Two mutually exclusive fixes and no way to tell which was meant:

- **The word is wrong** → change "Mondays" to "Tuesdays". Zero schedule impact.
- **The dates are wrong** → shift all 21 by −1 day. Changes the first ship date
  to Mon 2026-08-31, which is *before* the roadmap's own launch month framing
  and moves a date that is now two weeks out.

Left as-is. Flagged, not guessed.
