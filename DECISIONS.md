# CompanySite — Decisions

Cross-cutting choices that took real thought. Cross-refs to the repo-wide ledger at `../docs/DECISIONS.md § D-*` where applicable.

Format per entry: **D-CS-###** · date · one-line rule · why · reversibility.

---

## D-CS-00X · 2026-07-05 · Vitest pinned to `^2.1.9` (not 4.x)

- **Why:** Vitest 4.x requires Node 20.19+ or 22.12+; the dev Node here is 21.0.0 (unsupported in that matrix) and boot fails with `SyntaxError: 'node:util' does not provide styleText`. Vitest 2.1.9 supports Node 18/20/21/22 and gives us the full test API we need (parametrized `it.each`, `vi.useFakeTimers`, coverage-v8-compatible).
- **Reversibility:** Bump when the dev Node is on the LTS track (20.19+) — one-line `package.json` change.

## D-CS-001 · 2026-07-05 · Stack pivoted from single-file nginx to Astro 4 + Tailwind + Cloudflare Pages

- **Why:** New brief calls for a TikTok-conversion site with editorial polish, mobile-first, Lighthouse 95+, per-CTA analytics, and a serverless intake email. Static-HTML + nginx cannot ship the last two without bolting on a separate service; Astro static + Pages Functions is a single-repo answer.
- **Consistent with:** MASTER-CLAUDE.md LAW 5 (boring tech: Astro/Tailwind is named directly).
- **Reversibility:** Trivial — Dockerfile still ships (multi-stage, builds Astro then serves via nginx), so Railway is a fallback deploy path if Cloudflare Pages ever goes wrong. Previous single-file site preserved at `legacy/2026-cyberpunk-index.html`.

## D-CS-002 · 2026-07-05 · From-pricing reintroduced on Services (overrides prior CompanySite quote-only stance)

- **Why:** New brief explicitly calls for from-pricing "to filter tire-kickers". The 2026-07-03 quote-only rework was intentional at the time but the new positioning wants clear price anchors.
- **Reversibility:** One file (`src/components/Services.astro`) — drop the `from` field, ship.

## D-CS-003 · 2026-07-05 · Resend as the intake-email provider (with graceful stub when key missing)

- **Why:** Cheapest, cleanest, no lock-in. `functions/api/lead.ts` short-circuits when `RESEND_API_KEY` is unset — returns 200 and logs the lead so MVP works pre-key (LAW 6: no faked functions; it's an explicit documented fallback, not a lie).
- **Alternatives considered:** SendGrid (heavier), Cloudflare Email Workers (only inbound), Formspree (previous CompanySite used it — deprecated here because we control the endpoint now).
- **Reversibility:** Swap `sendEmail()` internals in `functions/api/lead.ts`; single file.

## D-CS-004 · 2026-07-05 · Case-study content collection over hardcoded cards

- **Why:** Adding a case study = drop a `.md` file + optional MP4. Zero code change. Scales with client volume.
- **Reversibility:** Trivial. Content is 2 markdown files today.

## D-CS-005 · 2026-07-05 · No JS framework beyond Astro islands; global tracker + reveal helper only

- **Why:** LAW 5 boring tech. Lighthouse 95+ target. Every ounce of client JS is a Lighthouse tax. Current wire weight: zero shipped JS bundles.
- **Reversibility:** Adding React or Vue is an integration setting flip in Astro config, but should require a concrete need.

## D-CS-006 · 2026-07-05 · Analytics is a POST-to-`/api/track` beacon, not a third-party pixel

- **Why:** Zero third-party JS, zero cookies, zero GDPR surface, Cloudflare tail logs are enough for MVP. Swap to Plausible or D1 persistence later when volume warrants.
- **Reversibility:** One function (`functions/api/track.ts`) — swap the log line for a write to D1 / Plausible / whatever.

## D-CS-007 · 2026-07-06 · `data-intent` + prefill catalog on Services CTAs (CONVERSION_STANDARDS § 2, § 3)

- **Why:** Services rows scrolled to `#intake` but landed the visitor on a blank textarea, forcing them to re-explain what they clicked — an anti-pattern named in `docs/CONVERSION_STANDARDS.md § 8` ("CTA scrolls to a form that's blank"). Fix: each service carries `data-intent` in the reserved `tier:` namespace (`tier:website:site-that-books`, `tier:automation:hours-saved`, `tier:widget:ai-assistant`), and `src/lib/prefill.ts` writes a structured brief into the `frustration` textarea on click. Separator-marker (`\n---\nAdd anything else below:\n`) lets a second click replace an earlier prefill without clobbering user-typed text.
- **Reversibility:** Two-line delete on Services.astro (`data-intent`) plus removing `wirePrefill()` from Layout — no schema, no persistence.

## D-CS-008 · 2026-07-06 · UTM tagging on outbound case-study `liveUrl`

- **Why:** Referral traffic from m3mm.net to Aries / Big 7 was arriving anonymous — the client couldn't tell from analytics that leads originated at the portfolio. Now every `liveUrl` gets `utm_source=m3mm.net · utm_medium=case-study · utm_campaign=proof · utm_content=<slug>`. Applied server-side (at Astro build time) via `URL.searchParams.set` so the tags survive rel="noopener" and can be overridden safely if a client asks for a different taxonomy.
- **Reversibility:** Trivial — delete the `outboundLiveUrl` block in `src/components/CaseStudy.astro` and revert `href={d.liveUrl}`.

## D-CS-009 · 2026-07-06 · Canonical URL audit closed clean; regression test locks the invariant

- **Audit finding:** Every rendered page emits `<link rel="canonical">` from `src/layouts/Layout.astro`, derived from `Astro.site = 'https://m3mm.net'` (astro.config.mjs). Built `dist/index.html` canonical = `https://m3mm.net/`; `dist/audit/index.html` canonical = `https://m3mm.net/audit`. `og:url` tracks canonical on both pages. Schema.org `url` in the JSON-LD block = `https://m3mm.net/`. Zero `companysite-production.up.railway.app` leakage in rendered source (`src/**/*.astro`, `public/{_headers,_redirects,robots.txt}`). Only `Railway` string in `dist/*.html` is inside the Big 7 case-study copy ("Deployed on Railway (nginx:alpine)") — accurate description of the client's actual hosting stack, not a domain leak.
- **Why the test:** SEO canonicalization is data-transforming logic clients see (STANDARDS.md § 3 → "if it computes something a client sees, test it"). A silent regression — someone hardcodes a URL, someone edits astro.config.mjs to a staging origin — would only surface weeks later in Google Search Console. `tests/build/canonical.test.ts` (4 tests) asserts the site-config pin, the Layout canonical wiring, `og:url ↔ canonical` sync, and the no-leakage invariant on the top-level rendered surfaces.
- **Reversibility:** Trivial — delete `tests/build/canonical.test.ts`. It's a source-level test, no coupling to build state.
