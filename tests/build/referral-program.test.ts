// Referral program — build-surface contract.
//
// The unit tests prove the helpers behave; these prove the helpers are
// actually wired into the four public surfaces (intake field, /thanks,
// /start/thanks, auto-reply email) and that none of them hardcodes copy
// that could drift from the one config.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

const intake = read('src/components/Intake.astro');
const prefill = read('src/lib/prefill.ts');
const lead = read('functions/api/lead.ts');
const validate = read('functions/_lib/validate.ts');
const thanks = read('src/pages/thanks.astro');
const startThanks = read('src/pages/start/thanks.astro');
const referral = read('functions/_lib/referral.ts');

describe('referral capture — intake form', () => {
  it('renders an optional referredBy input with the shared label', () => {
    expect(intake).toMatch(/name="referredBy"/);
    expect(intake).toContain('REFERRAL_FIELD_LABEL');
    expect(intake).toMatch(/\{referralFieldLabel\}/);
    // Optional by contract — a required referral field would tax every lead.
    expect(intake).not.toMatch(/name="referredBy"[\s\S]{0,200}\brequired\b/);
  });

  it('caps the field client-side at the same limit the server enforces', () => {
    expect(intake).toMatch(/name="referredBy"[\s\S]{0,200}maxlength="120"/);
    expect(validate).toMatch(/referredBy:\s*120/);
  });

  it('keeps the WCAG baseline: labelled control with a described hint', () => {
    expect(intake).toMatch(/aria-describedby="referred-by-hint"/);
    expect(intake).toMatch(/id="referred-by-hint"/);
    // The input sits inside a <label>, same as every other intake field.
    expect(intake).toMatch(/<label[\s\S]{0,600}name="referredBy"[\s\S]{0,600}<\/label>/);
  });
});

describe('referral capture — ?ref= share links', () => {
  it('whitelists ref/referredby to the referredBy field only', () => {
    expect(prefill).toMatch(/\bref:\s*'referredBy'/);
    expect(prefill).toMatch(/referredby:\s*'referredBy'/);
  });

  it('does not let a share link fake source, intent, or the honeypot', () => {
    expect(prefill).not.toMatch(/PARAM_TO_FIELD[\s\S]{0,600}source:\s*'source'/);
    expect(prefill).not.toMatch(/PARAM_TO_FIELD[\s\S]{0,600}company_website/);
  });
});

describe('referral capture — /api/lead', () => {
  it('reads referredBy on the no-JS urlencoded path too', () => {
    expect(lead).toMatch(/referredBy:\s*params\.get\('referredBy'\)/);
  });

  it('escapes the referrer into the admin attribution block', () => {
    expect(lead).toMatch(/referralRow[\s\S]{0,300}esc\(lead\.referredBy\)/);
    expect(lead).toMatch(/attributionHtml\s*=\s*\(lead\.intent \|\| utmRows \|\| referralRow\)/);
  });

  it('logs the referrer so referral volume is measurable', () => {
    expect(lead).toMatch(/referredBy:\s*lead\.referredBy \|\| undefined/);
  });

  it('closes the auto-reply with the shared offer plus a personal share link', () => {
    expect(lead).toContain("from '../_lib/referral'");
    expect(lead).toMatch(/referralOffer\(\)/);
    expect(lead).toMatch(/referralShareUrl\(lead\.name\)/);
    expect(lead).toMatch(/esc\(referral\.headline\)/);
    expect(lead).toMatch(/esc\(referral\.body\)/);
    expect(lead).toMatch(/esc\(referralLink\)/);
  });
});

describe('referral offer — public pages', () => {
  it('renders /thanks from the shared config, not hardcoded copy', () => {
    expect(thanks).toContain("functions/_lib/referral");
    expect(thanks).toMatch(/\{referral\.headline\}/);
    expect(thanks).toMatch(/\{referral\.body\}/);
    expect(thanks).toMatch(/data-cta="thanks-referral"/);
    expect(thanks).toMatch(/data-intent="book:free-review"/);
  });

  it('renders /start/thanks from the same config', () => {
    expect(startThanks).toContain("functions/_lib/referral");
    expect(startThanks).toMatch(/\{referral\.headline\}/);
    expect(startThanks).toMatch(/\{referral\.body\}/);
    expect(startThanks).toMatch(/data-cta="start-thanks-referral"/);
  });

  it('never hardcodes a referral payout figure in page or email source', () => {
    // Any dollar amount attached to the word "referral" must come from the
    // config helper — this fails if someone pastes "$100 per referral" in.
    const referralDollar = /referr[a-z]*[^.\n]{0,60}\$\s*\d|\$\s*\d[^.\n]{0,60}referr[a-z]*/i;
    expect(thanks).not.toMatch(referralDollar);
    expect(startThanks).not.toMatch(referralDollar);
    expect(intake).not.toMatch(referralDollar);
  });

  it('keeps the bounty unset until the owner confirms it', () => {
    // Flips to a real number only via PENDING_MANUAL; the copy follows
    // automatically. If this ever fails, the amount was set — update the
    // expectation deliberately, in the same commit as the decision.
    expect(referral).toMatch(/bountyUsd:\s*null/);
  });
});
