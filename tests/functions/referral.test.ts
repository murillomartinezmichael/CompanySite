// Referral program — the money-path unit tests.
//
// The program's whole job: a past client sends someone, that someone's lead
// arrives with the referrer named, and Michael can pay the right person.
// These pin (1) the copy never publishes an unconfirmed payout, (2) the
// referrer's name survives validation, and (3) it reaches every sink.

import { describe, it, expect } from 'vitest';
import {
  REFERRAL_FIELD_LABEL,
  REFERRAL_PROGRAM,
  referralOffer,
  referralShareUrl,
} from '../../functions/_lib/referral';
import { LIMITS, validateLead, esc, type Lead } from '../../functions/_lib/validate';
import { buildN8nLeadPayload, scoreLead } from '../../functions/_lib/n8n-sink';
import { buildCockpitLeadCard } from '../../functions/_lib/cockpit-sink';

const baseLead: Lead = {
  name: 'Dana Reyes',
  email: 'dana@example.com',
  businessType: 'Deck builder',
  frustration: 'Nobody fills out the contact form and the phone stopped ringing.',
  source: 'audit',
};

describe('referral offer copy', () => {
  it('publishes no dollar figure while the bounty is unconfirmed (LAW 6)', () => {
    // Guard rail, not decoration: this is what stops an agent from shipping
    // an invented "$100 per referral" promise on a live money-path site.
    if (REFERRAL_PROGRAM.bountyUsd === null) {
      const offer = referralOffer();
      expect(offer.amount).toBeNull();
      expect(offer.headline).not.toMatch(/\$\s*\d/);
      expect(offer.body).not.toMatch(/\$\s*\d/);
      expect(offer.body).not.toMatch(/paid|cash|bonus|reward/i);
    } else {
      expect(REFERRAL_PROGRAM.bountyUsd).toBeGreaterThan(0);
    }
  });

  it('still asks for the referral and names the exact field', () => {
    const offer = referralOffer();
    expect(offer.headline.length).toBeGreaterThan(0);
    expect(offer.body).toContain(REFERRAL_FIELD_LABEL);
  });

  it('states the amount and payout trigger the moment a bounty is set', () => {
    const offer = referralOffer({ bountyUsd: 100, payoutTrigger: 'when their build starts' });
    expect(offer.amount).toBe(100);
    expect(offer.headline).toContain('$100');
    expect(offer.body).toContain('when their build starts');
    expect(offer.body).toContain(REFERRAL_FIELD_LABEL);
  });

  it('treats a zero or negative bounty as unpriced rather than free money', () => {
    expect(referralOffer({ bountyUsd: 0, payoutTrigger: 'x' }).amount).toBeNull();
    expect(referralOffer({ bountyUsd: -50, payoutTrigger: 'x' }).amount).toBeNull();
  });
});

describe('referralShareUrl', () => {
  it('builds a prefilling link that lands on the intake', () => {
    const url = referralShareUrl('David Serrano');
    expect(url).toContain('https://m3mm.net/audit');
    expect(url).toContain('ref=David+Serrano');
    expect(url.endsWith('#intake')).toBe(true);
  });

  it('omits an empty ref instead of emitting a dangling param', () => {
    expect(referralShareUrl('   ')).toBe('https://m3mm.net/audit#intake');
  });

  it('caps the referrer name so a hostile value cannot bloat the link', () => {
    const url = referralShareUrl('x'.repeat(500));
    expect(url.length).toBeLessThan(400);
  });

  it('percent-encodes rather than letting a name break out of the URL', () => {
    const url = referralShareUrl('a&b=c#d');
    expect(url).toContain('ref=a%26b%3Dc%23d');
  });
});

describe('validateLead — referredBy threading', () => {
  it('carries a trimmed referrer through to the accepted lead', () => {
    const result = validateLead({ ...baseLead, referredBy: '  David Serrano  ' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead.referredBy).toBe('David Serrano');
  });

  it('is optional — a lead without a referrer still validates', () => {
    const result = validateLead(baseLead);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead.referredBy).toBe('');
  });

  it('caps an oversized referrer at the documented limit', () => {
    const result = validateLead({ ...baseLead, referredBy: 'z'.repeat(1000) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead.referredBy.length).toBe(LIMITS.referredBy);
  });

  it('ignores a non-string referrer instead of throwing', () => {
    const result = validateLead({ ...baseLead, referredBy: { evil: true } as unknown as string });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead.referredBy).toBe('');
  });

  it('escapes a referrer before it reaches the admin email body', () => {
    const result = validateLead({ ...baseLead, referredBy: '<script>alert(1)</script>' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(esc(result.lead.referredBy)).not.toContain('<script>');
    expect(esc(result.lead.referredBy)).toContain('&lt;script&gt;');
  });
});

describe('referred leads reach the lead OS', () => {
  it('forwards the referrer to n8n', () => {
    const payload = buildN8nLeadPayload('lead_x', { ...baseLead, referredBy: 'Big 7' }, '203.0.113.9');
    expect(payload.lead).toMatchObject({ referredBy: 'Big 7' });
  });

  it('sends null rather than undefined when there is no referrer', () => {
    const payload = buildN8nLeadPayload('lead_x', baseLead, '203.0.113.9');
    expect((payload.lead as Record<string, unknown>).referredBy).toBeNull();
  });

  it('scores a referred lead hotter than the same lead cold', () => {
    const cold = scoreLead(baseLead);
    const referred = scoreLead({ ...baseLead, referredBy: 'David Serrano' });
    expect(referred).toBeGreaterThan(cold);
  });

  it('surfaces the referrer on the CockpitCloud triage card', () => {
    const card = buildCockpitLeadCard('lead_x', { ...baseLead, referredBy: 'David Serrano' }, '203.0.113.9');
    expect(String(card.next_step)).toContain('Referred by: David Serrano');
  });

  it('leaves the card clean when nobody referred them', () => {
    const card = buildCockpitLeadCard('lead_x', baseLead, '203.0.113.9');
    expect(String(card.next_step)).not.toContain('Referred by');
  });
});
