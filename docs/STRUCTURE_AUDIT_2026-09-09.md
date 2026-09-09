# Structure audit — CompanySite — 2026-09-09

Scope: local source and rendered output at `6382105`, on
`codex/companysite-todo-2026-09-09`. Authority: M3_DESIGN_SYSTEM.md, then current
CLAUDE/AGENTS and recorded decisions. No external research or production traffic.
There are **14 page files**, not 13. No page is proposed for deletion.

## Page → job → primary action → incoming routes

Incoming links below were enumerated from the baseline built HTML, excluding
self-links. Header/footer links repeat across the site. Completion redirects
are distinguished from navigational links and sitemap discovery.

| Page | Job | Primary action | Who links to it before this pass |
| --- | --- | --- | --- |
| `/` | Company headquarters and release overview | See what's released → `#released` | Every other page through logo/footer |
| `/websites` | Complete custom-site offer, proof, pricing and intake | Free review → `#intake` | Home/roadmap testing entries; comparison, all trades, thanks |
| `/audit` | Campaign landing page for a free site review | Submit intake | Every other page via header/footer or review CTAs |
| `/start` | Basic-site offer and gated project intake | Free review while checkout unavailable; deposit when configured | `/websites` Basic service card |
| `/start/thanks` | Project-intake receipt and next step | Back home; referral form | No anchor inbound, intentionally noindex; `/start` Intake success redirect |
| `/thanks` | General free-review receipt and next steps | Case studies / referral / urgent email | No anchor inbound, intentionally noindex; general intake and roadmap success redirect |
| `/resume` | Career evidence and supplied PDF | Download PDF | Every other page through footer; homepage department |
| `/roadmap` | Full ordered release queue and update request | Open a listed build / request updates | Every other page through footer; homepage hero/department/queue |
| `/policies` | Company policy reference | Policy index / contact | Every other page through footer; homepage department |
| `/accessibility` | Accessibility statement and contact route | Contact about accessibility | Every other page through footer; policies |
| `/compare/website-options` | Compare purchase approaches before choosing | Request a review / see examples | `/websites` only |
| `/for/construction` | Construction-specific campaign and proof | Get my free teardown → `#intake` | **None**; sitemap or direct URL only |
| `/for/home-services` | Home-services-specific campaign and proof | Get my free teardown → `#intake` | **None**; sitemap or direct URL only |
| `/for/outdoor-living` | Outdoor-living-specific campaign and proof | Get my free teardown → `#intake` | **None**; sitemap or direct URL only |

Overlap is useful when the visitor's question differs: `/websites` answers what
M3MM offers, comparison answers which purchasing approach fits, and trade pages
match campaign context. Keep all four roles; add a small trade directory at the
sales page's proof boundary. Do not duplicate the full offer on comparison pages.
Keep both receipt pages: project onboarding differs from a free review. The
roadmap currently shares the free-review receipt; this is a content/flow mismatch
to record, not permission to change API routing or promise an automated subscription.

## Findings → evidence → fix → priority

| Finding | Baseline evidence | Proposed fix | Priority |
| --- | --- | --- | --- |
| Three trade pages are browsing orphans | HTML link inventory above; only sitemap exposes `/for/*` | Add tracked links using each existing trade-page label after Proof on `/websites` | P1 |
| Secondary-page navigation disappears; sales nav is hidden below 768px | Header.astro `!minimal` and `hidden … md:flex`; almost every secondary page passes minimal | Provide a compact secondary primary nav even on minimal pages, preserve contextual sales anchors, wrap all nav without JS | P1 |
| Roadmap is a long linear scroll with the update form after 21 entries | roadmap.astro quarter loop before `.signup`, no jump links | Add reusable section navigation to quarters and signup; retain complete ordered data | P1 |
| Previous browser gate accepts arbitrary future overlap failures matching two class selectors | scripts/axe-home.mjs `reviewedIncomplete` accepts `.fg.z-10.relative` or `.animate-marquee` without computed evidence | Remove that exemption; replace clipped/duplicated decorative marquee with readable wrapping names and use the approved hero scale/solid ground | P1 |
| Policy index and resume download miss CTA metadata | policies.astro index anchors; resume.astro PDF anchor | Add stable `data-cta` values without changing destinations | P1 |
| Shared controls and panels drift from token contract | global.css `.panel` literal rgba border, `.btn-ghost` uses decorative ink.line; Header inline radii | Use named panel/control/outline tokens; preserve single clay accent | P2 |
| Color literals remain in rendered source | Layout.astro theme-color; CaseStudyArt.astro SVG fills/strokes; global.css rgba; ChatWidget shadows and red error tint | Resolve tokens through theme lookups/CSS variables; move remaining shadow values into config; error uses neutral surface and text | P2 |
| Vertical rhythm varies by page generation | roadmap wrapper py-14/sm:py-20; Hero and Services fixed large insets; accessibility/resume py-16/lg:py-24; start/thanks py-20/sm:py-28; policies py-16/sm:py-24 | Apply hq-section to touched public skeletons and shared sales sections; retain bounded text widths and document remaining legacy variations | P2 |
| Footer is one flat group of unrelated links | Footer.astro single flex wrapper for company, contact, templates, policies | Name the navigation landmark and restore a direct Website services link; keep contact hydration intact | P2 |
| Standalone content is appropriate in page files; repeating timeline renderer is not a signup concern | index: unique hub composition; roadmap: ordered renderer plus independent signup script | Keep unique home sections inline; extract the repeated quarter timeline with its scoped styles, leave signup ownership in roadmap page | P2 |
| Receipt copy overlaps incorrectly for roadmap updates | roadmap signup success `/thanks`; `/thanks` promises free-review teardown | Record Michael's copy/flow decision; do not change lead semantics in a structure pass | Needs Michael |
| Footer hydration crosses component boundaries | Browser inspection: Footer's global `a[data-em-u][data-em-h]` selector rewrites the urgent link's label; full address exceeds its 230px text column at 320px | Scope hydration to `footer-email`, preserve urgent label and subject, allow footer address wrapping, assert both rendered destinations | P1 — found and fixed during verification |

## Skeleton decisions

Home argument remains identity → departments → released work → clearly separate
testing previews → next work → close. A contractor can choose the website-services
route through navigation without turning the headquarters into a second sales
page. Preserve its primary Released CTA, four existing department choices and
release truth; no new promotional claims or counters.

Roadmap argument remains release definitions → counts → ordered queue → update
request. Jump links make it usable without forcing visitors to traverse every
entry. Timeline extraction owns repeated rendering and spacing; signup owns its
form and behavior. No abstraction of the home ledger and roadmap rows: they have
different semantics, actions and heading levels. A one-use component alone is
not a defect; Hero and Services isolate coherent responsibilities.

## Layout inventory and deliberate exceptions

All 14 pages resolve through Layout and `.container-page` directly or through
their components. Homepage/roadmap/comparison use hq typography. This pass also
migrates the sales Hero, audit/trade/start/receipt and policy h1s to hq-hero, and
Intake's h2 to hq-section. Some secondary headings and metadata retain older
display scales or utility combinations, listed individually in
[the token inventory](STRUCTURE_TOKEN_INVENTORY_2026-09-09.md).
Long-form accessibility/resume intentionally use a narrower 3xl
reading measure; project receipt intentionally uses a 2xl panel. Preserve these
reading-width exceptions rather than making every page 1152px of prose.

Baseline non-token colors were in CaseStudyArt, Layout, global.css and ChatWidget.
All are now token lookups; scanning `src/` for literal hex and rgb/rgba returns
no matches. Existing supplied public artwork and historical documentation are
outside this source migration. Fixed 5rem footer clearance is functional space for floating
controls. Decorative lines may use ink.line; essential controls must use
ink.outline. Legacy CaseStudyArt Georgia lettering, field metadata sizes,
Services type sizes and older nested panel utilities remain documented follow-ups.
The audit/trade/thanks/start/policies decorative hero gradients were removed;
shared ground, controls and panels now use the approved solid surfaces. No broad
visual certification is claimed.

## Re-verification of the 2026-08-16 audit

| Original finding | Current evidence / disposition |
| --- | --- |
| 1: roadmap raw-JSON dead end | Already fixed: signup fetch and native 303 handler; preserve |
| 2: client/release contradiction | Superseded by 2026-08-19 release truth: deployed/tested is separate from official release; do not promote Aries/Big7 |
| 3: Mondays | Old day-of-week promise removed; targets note is present |
| 4: already-runs promise | Removed; explicit Testing and planned targets now present |
| 5: escaped apostrophe in hub | Old page retired; `/hub` redirects to `/` |
| 6–7: neon fork and Impact | Home and roadmap already on token system / Space Grotesk |
| 8–10: muted contrast and intake step opacity | Current token lookups and full-opacity intake labels already fix them |
| 11: home/roadmap orphans | Already linked; actual current orphans are the three trade pages |
| 12: minimal header | Still present on secondary pages; fix this pass |
| 13: nonexistent font variable | No longer used |
| 14: faint decorative borders | Approved ink.line is decorative; strengthen essential controls only |
| 15: new-tab cues (AAA) | Existing arrows/labels vary; no AA violation established; preserve destinations |
| Dark Aries poster | Asset still unchanged; no new imagery or client claims in this pass |

## Verification and completion

Implemented all autonomous findings above. The receipt content/flow decision is
recorded in `../PENDING_MANUAL.md`. No page was deleted; all 12 indexable pages are
reachable by browsing from home. The two noindex receipts remain completion
destinations, reachable through the existing form redirects. The comparison
page retains its existing sales-page link; each trade page now has an inbound
link from the sales-page directory. Minimal pages have Home/Websites/Roadmap
navigation; the home and footer expose Websites directly.

Final checks on Windows, Node 22.23.1, current branch:

- `npm run build`: 14 pages; shipped-placeholder fence clean.
- `npm test`: 41 files, 512 passed, 2 existing conditional Stripe tests skipped.
- `npm run test:a11y`: all 14 routes at 320/375/768/1440px, 56 combinations clean.
  Zero violations, zero horizontal overflow, no console errors/failed requests.
  Keyboard skip/focus/reduced motion and each route's 375px no-JS nav passed.
  Hydrated footer email and preserved urgent label/subject passed on every width.
- `npm run audit:canonicals`: 14 page URLs OK.
- `npx astro check`: 38 files, zero errors/warnings/hints.
- `git diff --check`: no whitespace errors.

[Full command output, verbatim](STRUCTURE_VERIFICATION_2026-09-09.md).
Raw browser evidence: `../output/design-qa/axe-home.json` (local ignored artifact).
The exact hash-verified silent Aries video still needs no audio captions; its
axe review is retained. Open-chat contrast incomplete results remain recorded
and independently measured at 8.38:1 text / 6.90:1 link with clipping checked.
No violations or arbitrary class-selector overlap failures are waived.

Earlier attempts failed CTA metadata checks, the old first-action expectation
after roadmap navigation changed, token-config typing, and axe overlap checks.
These were fixed and rerun. The final 320px receipt failure exposed the footer
selector bug described above; making its panel solid alone did not fix it.
The final full run passed after scoping the actual hydration behavior.

### Visual inspection

Inspected local Chrome screenshots, not a production deployment:

| Surface | 375px | 1440px |
| --- | --- | --- |
| Home hero | All five navigation links visible; Websites wraps to a second nav row. Heading and Released label fit. Chat occupies the right edge of the full-width action without covering its label. | Single-row nav; company argument and existing status panel form two columns; both hero actions readable. |
| Roadmap hero/timeline/jumps | Compact primary nav, stacked intro/counters, wrapping jump links, and single-column rows with readable date/status. | Intro and queue retain the hierarchy; jumps wrap to a second line, timeline dates sit beside descriptions. |
| Websites hero/trade directory | Headline fits in three lines, original proof remains, trade links wrap into two rows before Services. | Headline fits two lines, project names form a static row, trade links precede the existing Services ladder. |

Reviewed files under `output/design-qa/`: `mobile-hero.png`, `desktop-hero.png`,
`roadmap-mobile-hero.png`, `roadmap-desktop-releases.png`,
`roadmap-mobile-section-nav.png`, `roadmap-desktop-section-nav.png`,
`websites-mobile-hero.png`, `websites-desktop-hero.png`,
`websites-mobile-section-nav.png`, `websites-desktop-section-nav.png`.
Also inspected `output/structure-qa/thanks-urgent-320.png`: restored inline label
wraps within its panel. All routes have automated screenshots at all four widths;
not every screenshot or complete page was manually inspected.

### File-by-file diff summary

| File | Change |
| --- | --- |
| `src/components/Header.astro` | Visible wrapping primary navigation on every page; direct Websites link; token CTA radius. |
| `src/components/Footer.astro` | Named footer navigation, Websites link, scoped email hydration and address wrapping. |
| `src/components/SectionNav.astro` | New tracked, wrapping section/directory navigation. |
| `src/components/RoadmapTimeline.astro` | New repeated timeline renderer and scoped token styles, extracted unchanged content. |
| `src/components/Hero.astro` | Approved hero scale and section spacing; static accessible project-name list replaces clipped marquee and decorative overlays. |
| `src/components/Proof.astro` | Shared section spacing token. |
| `src/components/Services.astro` | Shared section spacing token; prices/copy intact. |
| `src/components/Faq.astro` | Shared section spacing token. |
| `src/components/Intake.astro` | Shared section/heading roles; remove glow behind text. |
| `src/components/TradeLanding.astro` | Shared hero scale/spacing and solid ground. |
| `src/components/CaseStudyArt.astro` | Existing drawings obtain colors from tokens. |
| `src/components/ChatWidget.astro` | Named shadow tokens and neutral error surface; request behavior intact. |
| `src/layouts/Layout.astro` | Theme-color metadata reads the actual ink token. |
| `src/pages/index.astro` | Remove stale comments about hidden website navigation; composition unchanged. |
| `src/pages/roadmap.astro` | Quarter/signup jumps, timeline component, shared spacing; data/form behavior preserved. |
| `src/pages/websites.astro` | Three existing trade pages linked after proof. |
| `src/pages/audit.astro` | Shared hero/spacing, solid ground. |
| `src/pages/start.astro` | Shared hero/spacing, CSS bullet shapes, tracked existing intake shortcut. |
| `src/pages/start/thanks.astro` | Shared hero/spacing; remove redundant referral arrow. |
| `src/pages/thanks.astro` | Shared hero/spacing/panel; remove redundant referral arrow; original receipt and urgent context preserved. |
| `src/pages/policies.astro` | Shared hero/spacing, solid ground, index/reference CTA metadata. |
| `src/pages/accessibility.astro` | Shared spacing, wrapping contact address, reference CTA metadata. |
| `src/pages/resume.astro` | Shared spacing and CTA metadata; supplied PDF intact. |
| `src/styles/global.css` | Shared token panels/controls/fields, stronger input boundaries/focus, footer clearance, remove raw color literals. |
| `tailwind.config.mjs` | Two named existing-shadow values and precise config typing. |
| `tests/build/site-structure.test.ts` | Built route/fragment validity, reachability, receipt noindex and navigation/tracking checks. |
| `scripts/axe-home.mjs` | 14-route/four-width coverage, actual first CTA, no-JS/email regressions, section screenshots; remove broad incomplete waiver. |
| `tests/README.md` | Current counts and browser/structure verification scope. |
| `docs/STRUCTURE_AUDIT_2026-09-09.md` | Page map, prioritized findings, decisions, implementation and limits. |
| `docs/STRUCTURE_TOKEN_INVENTORY_2026-09-09.md` | Line-specific remaining type/radius/spacing inventory. |
| `docs/STRUCTURE_VERIFICATION_2026-09-09.md` | Full captured final command output. |
| `docs/M3_DESIGN_SYSTEM.md` | Dated adoption note; original authority and history preserved. |
| `TODO.md` | Completed structure work and remaining owner gate. |
| `DECISIONS.md` | Record scoped navigation/component choices and preserved product truth. |
| `PENDING_MANUAL.md` | Roadmap receipt decision and local release handoff. |
| `COCKPIT_QUEUE.md` | Local work-log entry; actual browser log not written. |

### Not done / needs Michael

- Confirm roadmap receipt wording/flow before changing the existing free-review
  response. No new timeline, subscription capability or service promise invented.
- Resolve the existing npm patch environment gate and Vitest/SVGO advisories,
  then owner-approved release and authorized production smoke. No dependency
  changes, push, deployment, remote form/chat submission or account work here.
- Existing proof/media/Stripe/referral decisions remain in PENDING_MANUAL. No new
  testimonials, metrics, client names or prices were added.
- Full assistive-technology, physical mobile, Safari and Firefox testing was not
  performed. Two conditional Stripe tests remain skipped. Automated AA checks
  and selected visual inspections do not constitute a complete WCAG certification.
- Remaining older metadata/type/radius uses are flagged in the inventory, not
  silently certified as fully migrated. Supplied artwork is unchanged.
- Actual Cockpit browser work-log transcription remains queued locally.
