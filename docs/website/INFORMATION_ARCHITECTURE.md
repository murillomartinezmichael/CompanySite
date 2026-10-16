# M3MM.NET information architecture

Updated 2026-10-16. Implementation scope: `CompanySite` (Astro); `M3Websites` is a separate website-services repository.

## Primary wayfinding

| Header destination | Canonical route | Audience question |
| --- | --- | --- |
| Home | `/` | What is M3MM? |
| Projects | `/projects` | What is M3MM building? |
| Environment | `/environment` | How is its computing environment planned? |
| Roadmaps | `/roadmaps` | What comes next in each separate workstream? |
| Business | `/business` | How are services, strategy and investor information organized? |
| About | `/about` | Who is behind M3MM and how do I reach it? |

Roadmaps are independent: **project release roadmap** `/roadmap` (retained historical URL and intake flow) and **infrastructure roadmap** `/roadmaps/environment`.

## Content boundaries

- Project directory is derived from the 21 tracked entries in `src/config/roadmap.ts`; testing status is not release status.
- Environment area pages come from `src/config/environment.ts`, with no private hostnames, credentials or topology.
- Investment content remains at `/investors/` and is reached from the short `/business` overview.
- Website-services sales funnel remains at `/websites` with existing proof, pricing, intake and anchors.
- Resume, policies, accessibility, audit and start flows remain accessible; they are not extra top-level header tabs.

## Change boundaries

No private infrastructure or live network configurations are changed by the website. Navigation information is not proof of a completed server or release.
