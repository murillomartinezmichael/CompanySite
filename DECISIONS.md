# CompanySite — Decisions

Cross-cutting choices that took real thought. Cross-refs to the repo-wide ledger at `../docs/DECISIONS.md § D-*` where applicable.

Format per entry: **D-CS-###** · date · one-line rule · why · reversibility.

---

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
