/**
 * roadmap.ts — single source of truth for the 21-drop M³ launch schedule.
 *
 * /roadmap renders the timeline, /hub renders the live product dashboard,
 * both read the same DROPS array. To light up a tile as products go live,
 * only the `status` field on each entry changes.
 *
 * Status values:
 *   'live'     — shipped, url resolves, green LED pulse
 *   'next'     — the upcoming drop, amber pip
 *   'upcoming' — future drop, red pip
 */
export type DropStatus = 'live' | 'next' | 'upcoming';

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
  /** Live product URL — required for status:'live', optional otherwise. */
  url?: string;
  /** Lifecycle status; drives pip color and Launch/Notify button. */
  status: DropStatus;
}

export const DROPS: Drop[] = [
  {
    name: 'AriesOutdoorLiving',
    blurb: 'First M³ client shipped and paid — David Serrano\'s outdoor-living crew. Sold at handoff; first quote request came in three days after launch. This is what an M³ site looks like in the wild.',
    quarter: 'Already shipped — live right now',
    dateLabel: 'LIVE',
    year: '2026',
    date: '2026-06-25',
    url: 'https://ariesoutdoorliving.com',
    status: 'live',
  },
  {
    name: 'The Hub',
    blurb: 'One dashboard for every M³ product and tool. Live status, quick-launch links, "what\'s new" feed. As each drop below goes live, its tile lights up on The Hub the same day.',
    quarter: 'Already shipped — live right now',
    dateLabel: 'LIVE',
    year: '2026',
    date: '2026-08-17',
    url: '/hub',
    status: 'live',
  },
  {
    name: 'CompanySite — m3mm.net',
    blurb: 'M³\'s own front door. Custom-build inquiries, bounded pricing ($500 basic, $1k–$2k mid, quote-only over $2k), n8n Lead OS scoring every intake end-to-end. This is where every drop below eventually links back to.',
    quarter: 'Already shipped — live right now',
    dateLabel: 'LIVE',
    year: '2026',
    date: '2026-07-16',
    url: 'https://m3mm.net',
    status: 'live',
  },
  {
    name: 'SiteGuide',
    blurb: 'Off-the-shelf template store — 19 sellable business templates plus an AI chat guide widget you drop in with one <script> tag. Per-tenant configuration, per-tenant origin lockdown.',
    quarter: 'Next up',
    dateLabel: 'SEP 1',
    year: '2026',
    date: '2026-09-01',
    url: 'https://siteguide-production.up.railway.app',
    status: 'next',
  },
  {
    name: 'AIMA — AI Manual Assistant',
    blurb: 'Drop a product manual PDF, ask it questions, get citations back. RAG SaaS built for regulated industries where "the answer is in the manual" isn\'t good enough.',
    quarter: 'Q3 2026',
    dateLabel: 'SEP 15',
    year: '2026',
    date: '2026-09-15',
    status: 'upcoming',
  },
  {
    name: 'ClipForge',
    blurb: 'URL + context in → 9:16 vertical MP4 plus timestamped voiceover script out. TikTok-ready output pipeline for anyone shipping video daily.',
    quarter: 'Q3 2026',
    dateLabel: 'SEP 29',
    year: '2026',
    date: '2026-09-29',
    status: 'upcoming',
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
    blurb: 'Hosted, multi-user Cockpit — the M³ mission-control kanban that scans your GitHub org and turns commits into shipped-work receipts.',
    quarter: 'Q4 2026',
    dateLabel: 'NOV 24',
    year: '2026',
    date: '2026-11-24',
    status: 'upcoming',
  },
  {
    name: 'AriesOutdoorLiving V2',
    blurb: 'Client-approved Aries rebuild — Astro, R2-hosted photo CDN, contact + reviews flow. Reference implementation for the M³ "small-business site" tier.',
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
    blurb: 'Workflow-automation glue for the M³ stack — the "connect these three tools" layer, n8n-adjacent but scoped to what M³ customers actually run.',
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
];

export const LAUNCH_STATS = {
  total: DROPS.length,
  live: DROPS.filter((d) => d.status === 'live').length,
  next: DROPS.filter((d) => d.status === 'next').length,
  upcoming: DROPS.filter((d) => d.status === 'upcoming').length,
};
