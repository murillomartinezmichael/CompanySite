// Client referral program — single source of truth for the payout terms and
// the public copy that states them.
//
// Why it lives in functions/_lib: `/api/lead` (the money path) renders the
// referral CTA into the auto-reply email, and the Astro pages render the same
// offer. One module, imported by both, so the site and the email can never
// promise different things.
//
// LAW 6 (never fake it): `bountyUsd` is intentionally `null` until Michael
// confirms the cash amount and payout trigger — see PENDING_MANUAL.md. While
// it is null every public surface renders the CAPTURE-ONLY variant, which
// makes no payment promise at all. The moment a real number lands here, all
// four surfaces (intake hint, /thanks, /start/thanks, auto-reply email) start
// stating it, with no other edit.

export type ReferralProgram = {
  /** Cash paid per successful referral, USD. `null` = program announced but
   *  not yet priced; nothing monetary is published. */
  bountyUsd: number | null;
  /** When the bounty is paid. Only ever rendered alongside a real bountyUsd,
   *  so an unconfirmed amount can't drag an unconfirmed term onto the site. */
  payoutTrigger: string;
};

export const REFERRAL_PROGRAM: ReferralProgram = {
  bountyUsd: null,
  payoutTrigger: 'when their build starts',
};

/** The exact form-field label. Used by the intake markup, the /thanks copy,
 *  and the email so a referrer is told the same field name everywhere. */
export const REFERRAL_FIELD_LABEL = 'Referred by';

export type ReferralOffer = {
  /** null in capture-only mode — nothing about money is rendered. */
  amount: number | null;
  headline: string;
  body: string;
};

/**
 * Public referral copy. Pure — pass a program to test both modes.
 */
export function referralOffer(program: ReferralProgram = REFERRAL_PROGRAM): ReferralOffer {
  const amount = typeof program.bountyUsd === 'number' && program.bountyUsd > 0
    ? program.bountyUsd
    : null;

  if (amount === null) {
    return {
      amount: null,
      headline: 'Know someone who needs a site?',
      body: `Send them to m3mm.net and have them put your name in the "${REFERRAL_FIELD_LABEL}" field on the intake. I'll know exactly who sent them.`,
    };
  }

  return {
    amount,
    headline: `Know someone who needs a site? Get $${amount}.`,
    body: `Have them put your name in the "${REFERRAL_FIELD_LABEL}" field on the intake — paid ${program.payoutTrigger}.`,
  };
}

/**
 * Share link a past client hands to a prospect. `?ref=` prefills the
 * referral field (whitelisted in src/lib/prefill.ts::PARAM_TO_FIELD), so the
 * referrer gets credited even if the prospect never types their name.
 */
export function referralShareUrl(referrer: string, origin = 'https://m3mm.net'): string {
  const url = new URL('/audit', origin);
  const clean = referrer.trim().slice(0, 120);
  if (clean) url.searchParams.set('ref', clean);
  url.hash = 'intake';
  return url.toString();
}
