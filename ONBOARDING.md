# CompanySite — Onboarding

**For:** a contributor (or future-Michael) getting productive in a day.
**Time to first shipped edit:** ~30 minutes.

---

## Day 1 — get it running and understand the shape

**Checklist:**

- [ ] Clone the repo. `cd CompanySite`.
- [ ] `python -m http.server 8000` → open `http://localhost:8000`. That's the whole dev loop.
- [ ] Read `index.html` in a text editor. **The site is one file.** ~5,600 lines: HTML structure + `<style>` block + a small `<script>` at the bottom.
- [ ] Scan the CSS custom properties near the top of `<style>`: `--cream`, `--clay`, `--clay-light`, `--ink`. That's the whole palette.
- [ ] Search for `data-intent="` — every CTA carries one. See `CONVERSION_STANDARDS.md`.
- [ ] Skim `RUNBOOK.md` for deploy shape (Railway + Docker + nginx:alpine).

**By end of day 1 you can:** change a headline, change a color, run it locally, ship it to prod (Railway auto-deploys on push).

---

## Day 2 — the CTA + intake loop

- [ ] Click a CTA locally. Watch the contact form's `<textarea>` prefill with a brief.
- [ ] Open DevTools → inspect the contact form. Confirm `input[name="intent"]` and `input[name="source"]` populate from the click.
- [ ] Read the `CATALOG` object in the inline `<script>` — every intent key + its title + detail.
- [ ] Add a new intent key + a CTA that uses it. Test locally.

**By end of day 2 you can:** ship a new offering to the site and route its inquiries to Formspree with full attribution.

---

## Day 3 — polish + performance

- [ ] Open Chrome DevTools → Lighthouse. Run on `http://localhost:8000`.
- [ ] Aim for Performance > 90, Accessibility > 95. If either drops after a change, revert until you know why.
- [ ] Check `prefers-reduced-motion` — every animation should respect it. `docs/ACCESSIBILITY_STANDARDS.md`.
- [ ] Verify the SiteGuide widget loads (chat bubble bottom-right) — its origin is `siteguide-production.up.railway.app`.

**By end of day 3 you're shipping-ready.**

---

## Anti-patterns for a new contributor

1. Introducing a build step. This is a single file on purpose.
2. Adding a JS framework. Anything bigger than a small `<script>` goes into a sibling project loaded via `<script src>`.
3. Adding `$` back into the pricing section. The 2026-07-03 rework was intentional — quote-based only.
4. Editing styles in a separate `.css` file.

---

## Where to look next

- `RUNBOOK.md` — run, deploy, debug, rollback.
- `TRD.md` — architecture + decisions.
- `../docs/CONVERSION_STANDARDS.md` — the rules every CTA + intake follows.
- `../docs/FRONTEND_STANDARDS.md` — why static + no build for this shape.
