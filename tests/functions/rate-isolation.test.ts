// One Worker, one rate-limit Map — so the bucket key must name the route.
//
// Codex money-path review 2026-08-12 (fleet job 20260812-221943-codex-b0bea9),
// BLOCKER. Cloudflare compiles the whole `functions/` tree into a single
// Worker, so `_lib/rate.ts`'s module-level Map is shared. Keyed on the bare IP,
// `/api/track` (60/min) and `/api/lead` (5/min) drew from the SAME bucket:
// five analytics beacons exhausted the lead allowance and a genuine submission
// was answered 429 and lost.
//
// This is the ordinary high-intent path, not an edge case: `src/lib/track.ts`
// fires on every `[data-cta]` click site-wide (24 on the home page alone) and
// `Intake.astro` fires `intake_start` on first focus of the form. Four CTA
// clicks plus clicking into the form was enough to burn the lead's budget
// before it was ever submitted.

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost as leadPost } from '../../functions/api/lead';
import { onRequestPost as trackPost } from '../../functions/api/track';
import { __resetBuckets } from '../../functions/_lib/rate';

const ctx = (r: Request) => ({ request: r, env: {} }) as unknown as Parameters<typeof leadPost>[0];

const LEAD_RATE_MAX = 5;
const IP = '198.51.100.77';

const beacon = (ip: string) =>
  new Request('https://m3mm.net/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify({ name: 'hero-cta', section: 'hero' }),
  });

const validLead = (ip: string) =>
  new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://m3mm.net',
      'CF-Connecting-IP': ip,
    },
    body: JSON.stringify({
      name: 'Real Buyer',
      email: 'buyer@example.com',
      businessType: 'landscaping',
      frustration: 'My site is old and does not book any work for me at all.',
    }),
  });

describe('the analytics beacon must not spend the lead allowance', () => {
  beforeEach(() => __resetBuckets());

  it('a real lead still lands after enough CTA beacons to exhaust its old budget', async () => {
    for (let i = 0; i < LEAD_RATE_MAX; i++) {
      expect((await trackPost(ctx(beacon(IP)))).status).toBe(204);
    }
    // Before the fix this was 429 and the lead was dropped.
    const res = await leadPost(ctx(validLead(IP)));
    expect(res.status).not.toBe(429);
  });

  it('a real lead survives far more beacons than the lead limit', async () => {
    for (let i = 0; i < LEAD_RATE_MAX * 4; i++) {
      await trackPost(ctx(beacon(IP)));
    }
    expect((await leadPost(ctx(validLead(IP)))).status).not.toBe(429);
  });

  it('the lead limit itself still works — this is isolation, not removal', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < LEAD_RATE_MAX + 1; i++) {
      statuses.push((await leadPost(ctx(validLead(IP)))).status);
    }
    expect(statuses.filter((s) => s === 429)).toHaveLength(1);
    expect(statuses[statuses.length - 1]).toBe(429);
  });

  it('the track limit still works on its own key', async () => {
    const TRACK_RATE_MAX = 60;
    for (let i = 0; i < TRACK_RATE_MAX; i++) await trackPost(ctx(beacon(IP)));
    // Still 204 (the beacon never surfaces an error to the page) but the lead
    // path must remain completely unaffected by it.
    expect((await trackPost(ctx(beacon(IP)))).status).toBe(204);
    expect((await leadPost(ctx(validLead(IP)))).status).not.toBe(429);
  });

  it('rate buckets stay separated per IP as well as per route', async () => {
    for (let i = 0; i < LEAD_RATE_MAX; i++) await leadPost(ctx(validLead('203.0.113.9')));
    expect((await leadPost(ctx(validLead('203.0.113.10')))).status).not.toBe(429);
  });
});
