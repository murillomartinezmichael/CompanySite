---
client: Big 7 Construction
kind: Home construction + repair
location: Atlanta, GA
year: 2026
# Drop /public/videos/big7-scroll.mp4 + big7-poster.jpg, then uncomment:
# video: /videos/big7-scroll.mp4
# poster: /videos/big7-poster.jpg
liveUrl: https://big7construction.com
problem: >-
  Big 7 does high-end custom builds AND the small repair jobs no one wants to
  post about. One old site tried to cover both and did neither well. Repair
  leads were going to national aggregators that skim 30%.
outcome: >-
  A split-track marketing site: "Build with us" for the ground-up jobs,
  "Fix with us" for the repair funnel. Both routes share the same intake so
  Big 7 owns every lead. Deployed on Railway, embedded AI guide for
  after-hours questions.
metrics:
  - label: Deploy target
    value: Railway (nginx:alpine)
  - label: Embedded assistant
    value: SiteGuide (Claude)
order: 2
---

Same repo, two lanes. The build track shows finished homes; the repair track shows fast turnaround. Both funnel to a single intake so no lead gets lost between the two.
