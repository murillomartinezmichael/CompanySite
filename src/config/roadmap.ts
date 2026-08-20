/**
 * roadmap.ts — single source of truth for the 21-drop launch schedule.
 *
 * /roadmap renders the full timeline and / renders the public M3MM hub.
 * Both read the same DROPS array. To mark an official release, only the
 * `status` field on each entry changes.
 *
 * A deployment URL does not make a drop an official release. Preview builds
 * stay `testing` until Michael declares the public launch.
 *
 * Status values:
 *   'released' — officially released by M3MM, green LED pulse
 *   'next'     — the next official launch, amber pip
 *   'testing'  — publicly reachable preview, not released
 *   'upcoming' — planned or waiting on launch requirements
 */
export type DropStatus = 'released' | 'next' | 'testing' | 'upcoming';

export interface Drop {
  /** Product name as it appears in the timeline heading. */
  name: string;
  /** One-line description. */
  blurb: string;
  /** Quarter grouping label (e.g. "Q4 2026"). */
  quarter: string;
  /** Short date label (e.g. "SEP 1"). */
  dateLabel: string;
  /** Year suffix (e.g. "2026"). */
  year: string;
  /** ISO date for sorting + hub countdowns. */
  date: string;
  /** Public release or preview URL, when one should be visitor-accessible. */
  url?: string;
  /** Lifecycle status; drives pip color and Launch/Notify button. */
  status: DropStatus;
  /** Plain-language lane used by the public release ledger. */
  category?: 'Company' | 'Client work' | 'Product' | 'Career';
}

export const DROPS: Drop[] = [
  {
    name: 'M3MM Hub',
    blurb: 'M3MM\'s main public front door: the official release ledger, test previews, company departments, policies, career proof, and the launch roadmap in one living dashboard.',
    quarter: 'Officially released',
    dateLabel: 'RELEASED',
    year: '2026',
    date: '2026-08-18',
    url: '/',
    status: 'released',
    category: 'Company',
  },
  {
    name: 'AriesOutdoorLiving',
    blurb: 'First client site, sold at handoff and live at ariesoutdoorliving.com; the official M3MM public launch has not happened yet. Grouped with the reachable builds until then.',
    quarter: 'Deployed — awaiting official launch',
    dateLabel: 'LIVE',
    year: '2026',
    date: '2026-06-25',
    url: 'https://ariesoutdoorliving.com',
    status: 'testing',
    category: 'Client work',
  },
  {
    name: 'M3MM Websites',
    blurb: 'The website-services department is deployed for testing: client work, bounded pricing, free site reviews, and the intake path for businesses ready to build.',
    quarter: 'Preview lab — deployed for testing',
    dateLabel: 'TEST',
    year: '2026',
    date: '2026-07-16',
    url: '/websites',
    status: 'testing',
    category: 'Company',
  },
  {
    name: 'Michael\'s Resume + Career Site',
    blurb: 'The career surface is deployed for testing: current software-engineering experience, verified work, case studies, and a downloadable resume.',
    quarter: 'Preview lab — deployed for testing',
    dateLabel: 'TEST',
    year: '2026',
    date: '2026-07-19',
    url: 'https://resumesite.murillomartinezmichael.workers.dev',
    status: 'testing',
    category: 'Career',
  },
  {
    name: 'SiteGuide',
    blurb: 'The template store and AI guide widget are deployed for product testing. The preview is usable, but M3MM has not declared its official release.',
    quarter: 'Preview lab — deployed for testing',
    dateLabel: 'TEST',
    year: '2026',
    date: '2026-07-19',
    url: 'https://siteguide-production.up.railway.app?utm_source=m3mm&utm_medium=hub&utm_campaign=downshift&utm_content=release-ledger',
    status: 'testing',
    category: 'Product',
  },
  {
    name: 'AIMA — AI Manual Assistant',
    blurb: 'The manual upload and cited-answer experience is deployed for testing while the product continues to mature. It is a preview, not an official release.',
    quarter: 'Preview lab — deployed for testing',
    dateLabel: 'TEST',
    year: '2026',
    date: '2026-07-19',
    url: 'https://peaceful-kashata-9599e5.netlify.app',
    status: 'testing',
    category: 'Product',
  },
  {
    name: 'ClipForge',
    blurb: 'URL + context in → 9:16 vertical MP4 plus timestamped voiceover script out. TikTok-ready output pipeline for anyone shipping video daily.',
    quarter: 'Q3 2026',
    dateLabel: 'SEP 29',
    year: '2026',
    date: '2026-09-29',
    status: 'next',
    category: 'Product',
  },
  {
    name: 'PhotoPicker',
    blurb: 'Point it at a folder of 500 phone photos, get back the 20 you\'d actually post. ML-scored, profile-configurable (portfolio, gallery, hero, thumbnail), CLI + Python API.',
    quarter: 'Q4 2026',
    dateLabel: 'OCT 13',
    year: '2026',
    date: '2026-10-13',
    status: 'upcoming',
  },
  {
    name: 'HandoffKit',
    blurb: 'Ship a client site + a client-shaped handoff guide in the same commit. Astro-first, works with anything static.',
    quarter: 'Q4 2026',
    dateLabel: 'OCT 27',
    year: '2026',
    date: '2026-10-27',
    status: 'upcoming',
  },
  {
    name: 'SiteAudit',
    blurb: 'Give it any URL, get a scorecard + DM-ready free-review bullets + a TikTok teardown script. Playwright + deterministic scoring, Claude-drafted commentary.',
    quarter: 'Q4 2026',
    dateLabel: 'NOV 10',
    year: '2026',
    date: '2026-11-10',
    status: 'upcoming',
  },
  {
    name: 'CockpitCloud',
    blurb: 'Hosted, multi-user Cockpit — the M3MM mission-control kanban that scans your GitHub org and turns commits into shipped-work receipts.',
    quarter: 'Q4 2026',
    dateLabel: 'NOV 24',
    year: '2026',
    date: '2026-11-24',
    status: 'upcoming',
  },
  {
    name: 'AriesOutdoorLiving V2',
    blurb: 'Client-approved Aries rebuild — Astro, R2-hosted photo CDN, contact + reviews flow. Reference implementation for the M3MM custom small-business-site tier.',
    quarter: 'Q4 2026',
    dateLabel: 'DEC 8',
    year: '2026',
    date: '2026-12-08',
    status: 'upcoming',
  },
  {
    name: 'PersonalPortal',
    blurb: 'Six .NET 9 Blazor micro-portals — fitness, work, gaming, housing, finance, bots — all sharing one design system. Opinionated dashboard for people who want their life in tabs.',
    quarter: 'Q4 2026',
    dateLabel: 'DEC 22',
    year: '2026',
    date: '2026-12-22',
    status: 'upcoming',
  },
  {
    name: 'CampaignForge',
    blurb: 'Multi-channel campaign orchestrator — briefs in, coordinated posts across email, social, and blog out, on a calendar you actually respect.',
    quarter: 'Q1 2027',
    dateLabel: 'JAN 5',
    year: '2027',
    date: '2027-01-05',
    status: 'upcoming',
  },
  {
    name: 'Flowforge',
    blurb: 'Workflow-automation glue for the M3MM product stack — the "connect these three tools" layer, n8n-adjacent but scoped to what M3MM customers actually run.',
    quarter: 'Q1 2027',
    dateLabel: 'JAN 19',
    year: '2027',
    date: '2027-01-19',
    status: 'upcoming',
  },
  {
    name: 'LearnMicroservices',
    blurb: 'Long-form course + reference-implementation repo for engineers going from monolith to microservices without the wreckage. Modular-monolith first, strangler-fig migration, sagas over distributed transactions.',
    quarter: 'Q1 2027',
    dateLabel: 'FEB 2',
    year: '2027',
    date: '2027-02-02',
    status: 'upcoming',
  },
  {
    name: 'McpLens',
    blurb: 'Inspection + observability tool for MCP servers. Point it at any MCP endpoint, see what it exposes, what it costs, and what it breaks on.',
    quarter: 'Q1 2027',
    dateLabel: 'FEB 16',
    year: '2027',
    date: '2027-02-16',
    status: 'upcoming',
  },
  {
    name: 'PaymentBackend',
    blurb: 'Drop-in Stripe + webhook + entitlement layer for small SaaS. Test-mode-to-live guardrails built in so your /checkout can\'t ever ship a test-mode key accidentally.',
    quarter: 'Q1 2027',
    dateLabel: 'MAR 2',
    year: '2027',
    date: '2027-03-02',
    status: 'upcoming',
  },
  {
    name: 'QuoteMateAI',
    blurb: 'Structured-quote generator for service businesses. Takes a brief, returns a bounded quote with line-items and a human-approved edit surface.',
    quarter: 'Q1 2027',
    dateLabel: 'MAR 16',
    year: '2027',
    date: '2027-03-16',
    status: 'upcoming',
  },
  {
    name: 'LeadLeak',
    blurb: 'Lead-flow observability — where your inbound stops moving, who\'s dropping the ball, and which channel is quietly on fire.',
    quarter: 'Q1 2027',
    dateLabel: 'MAR 30',
    year: '2027',
    date: '2027-03-30',
    status: 'upcoming',
  },
  {
    name: 'Big7 Construction',
    blurb: 'A test deployment exists, but the official company-site release is long-term. The next real milestone is receiving and curating jobsite photography; it will not be presented as launched before that proof is ready.',
    quarter: 'Deployed for testing — waiting on jobsite photography',
    dateLabel: 'TEST',
    year: '2026',
    date: '2026-07-01',
    status: 'testing',
    category: 'Client work',
  },
];

export const LAUNCH_STATS = {
  total: DROPS.length,
  released: DROPS.filter((d) => d.status === 'released').length,
  next: DROPS.filter((d) => d.status === 'next').length,
  testing: DROPS.filter((d) => d.status === 'testing').length,
  upcoming: DROPS.filter((d) => d.status === 'upcoming').length,
};
