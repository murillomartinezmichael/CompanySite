# Updated architecture assertions

The previous homepage and header structure were intentionally replaced. Tests now assert the six real public page destinations, two roadmap entry points, registry preservation, accessible in-page destinations and private no-tracking boundaries. Public canonical expectations include every new static page plus dynamic project/private routes. Muted-text checks still enforce both palettes at 4.5:1 and now locate the shared design tokens.

All original lead, idempotency, rate-limit, provider, body-limit, checkout, payment, referral and security tests remain in the suite. Existing outbound SiteGuide links and their exact attribution metadata were restored after the first regression run. Private links must not be assigned public funnel tracking merely to satisfy an old global test.
