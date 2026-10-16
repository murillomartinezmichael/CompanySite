# M3MM.NET navigation guide

Primary labels are configured once in `src/config/site-navigation.ts` and consumed by `src/components/Header.astro`.

- Home: `/`
- Projects: `/projects` and `/projects/<slug>`
- Environment: `/environment` and `/environment/<section>`
- Roadmaps: `/roadmaps`; project release ledger at `/roadmap`; infrastructure plan at `/roadmaps/environment`
- Business: `/business`; detailed investor material at `/investors/`; website services at `/websites`
- About: `/about`; policy, accessibility and resume subtopics on their existing routes

The desktop header intentionally shows six destinations. At narrower widths native `<details>` exposes the same navigation plus the existing sales contact links, without JavaScript. Theme toggle and free-review CTA retain their original tracking behavior.

The footer includes main routes and original conversion/legal links. Do not remove `/audit#intake` or `/websites` anchors. Add `data-cta` to any new action.
