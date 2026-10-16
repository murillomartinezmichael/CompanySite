# Navigation and content redesign plan

## Problem
The primary header mixed specific offerings (Websites), investor materials, a roadmap and a resume while broad product and infrastructure topics lacked clear homes. The homepage department directory reinforced the mixture.

## Implemented approach
1. Promote six visitor-oriented categories to primary navigation and collapse them into a native keyboard-accessible menu on smaller screens.
2. Reuse existing public release data for a browsable project directory; preserve official statuses and original project roadmap.
3. Add a separate infrastructure model organized into six phases and six subject areas.
4. Make `/roadmaps` a two-choice destination; neither roadmap inherits the other's progress.
5. Put the long investor experience behind a focused `/business` entry page rather than expanding the global header.
6. Move Resume and Policies to contextually appropriate About/Footer links without removing routes.
7. Reuse M3MM logo, colors, fonts, light/dark mode, data-cta tracking and mobile conventions.

## Safety and verification
- Work is isolated in `feat/website-navigation-two-roadmaps-20261016`; do not modify the concurrent local checkout.
- Run build, source tests, canonical checks and mobile/browser review before merging.
- Keep sensitive environment status in private operational docs; public infrastructure states default to planned or verification needed.
- Do not deploy, merge or alter network hardware as a side effect of this site work.
