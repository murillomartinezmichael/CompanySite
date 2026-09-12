# Structure token inventory — 2026-09-09

Source inventory supporting [the structure audit](STRUCTURE_AUDIT_2026-09-09.md).
These are every current match for legacy display/arbitrary text sizes, literal
font size/radius/reading widths and fixed vertical utility insets in pages,
components and shared CSS. Standard spacing steps, circular decoration and
65ch reading measures are allowed exceptions, not automatic defects. Smaller
10–11px metadata and older display roles remain design drift to review in a
future bounded pass. Color literal scan of `src/` is empty after this pass;
static supplied artwork in `public/` and historical documents are not restyled.
Line numbers describe this local revision and will change with later edits.

```text
src/styles/global.css:45:    border-radius: 2px;
src/styles/global.css:69:    @apply inline-flex items-center justify-center gap-2.5 border border-clay bg-clay px-7 py-3.5 text-base font-semibold text-ink transition-all duration-150;
src/styles/global.css:84:    @apply inline-flex items-center justify-center gap-2 border px-7 py-3.5 text-base font-medium text-bone transition-all duration-150;
src/styles/global.css:101:    @apply font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-bone-muted;
src/styles/global.css:115:    @apply font-mono flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-bone-muted;
src/styles/global.css:118:    @apply w-full border bg-ink px-4 py-3 text-bone placeholder:text-bone-muted transition-all duration-150;
src/styles/global.css:178:    font-size: 11px;
src/styles/global.css:183:    border-radius: 999px;
src/pages\accessibility.astro:42:      <li>A single <code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">&lt;main&gt;</code> landmark on every page.</li>
src/pages\accessibility.astro:45:      <li>Full support for <code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">prefers-reduced-motion</code> — animations disable for users who ask for less motion.</li>
src/pages\accessibility.astro:46:      <li>A defined page language (<code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">lang="en"</code>) so screen readers pronounce content correctly.</li>
src/pages\audit.astro:45:          <span class="mono text-[11px] uppercase tracking-[0.2em] text-clay/80">Budget under $500?</span>
src/pages\audit.astro:61:        <div class="mt-12 grid gap-5 border-t border-ink-line/60 pt-8 sm:grid-cols-2">
src/pages\audit.astro:63:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Aries Outdoor Living</span>
src/pages\audit.astro:69:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Big 7 Construction</span>
src/pages\index.astro:234:  .hero-lede { max-width: 56ch; margin: 1rem 0 0; color: var(--hq-dim); font-size: theme('fontSize.hq-lede[0]'); line-height: 1.65; }
src/pages\index.astro:258:  .section-intro>p:last-child,.ledger-note { max-width: 48ch; color: var(--hq-dim); line-height: 1.65; }
src/pages\index.astro:271:  .live-pip { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
src/pages\index.astro:273:  .release-main p,.preview-list p,.preview-title>p:last-child { max-width: 65ch; margin-top: .75rem; color: var(--hq-dim); line-height: 1.65; }
src/pages\index.astro:282:  .preview-list h4 { margin-top: .5rem; font-size: 1.125rem; }
src/pages\index.astro:286:  .roadmap-copy>p:not(.section-code) { margin-top: 1.5rem; color: var(--hq-dim); line-height: 1.65; max-width: 60ch; }
src/pages\index.astro:296:  .queue-body h3 { margin-top: .5rem; font-size: 1.25rem; }
src/pages\index.astro:301:  @media (max-width: 980px) {
src/pages\index.astro:309:  @media (max-width: 640px) {
src/pages\policies.astro:22:        <span class="grid h-12 w-12 flex-none place-items-center overflow-hidden bg-ink-soft ring-1 ring-ink-line" style="border-radius: 2px;">
src/pages\policies.astro:27:          <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.17em] text-bone-muted">Modernize. Mobilize. Multiply.</p>
src/pages\policies.astro:42:          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-muted">Policy index</p>
src/pages\policies.astro:44:            <a href="#covid-vaccination" data-cta="policies-jump-vaccination" data-section="policies" data-intent="product:company-policies" class="block border-l border-clay py-2 pl-4 text-sm text-bone transition-colors hover:text-clay">COVID-19 vaccination</a>
src/pages\policies.astro:45:            <a href="#accessibility" data-cta="policies-jump-accessibility" data-section="policies" data-intent="product:company-policies" class="block py-2 pl-4 text-sm text-bone-dim transition-colors hover:text-bone">Accessibility</a>
src/pages\policies.astro:46:            <a href="#updates" data-cta="policies-jump-updates" data-section="policies" data-intent="product:company-policies" class="block py-2 pl-4 text-sm text-bone-dim transition-colors hover:text-bone">Updates and scope</a>
src/pages\policies.astro:53:            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line pb-5">
src/pages\policies.astro:54:              <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">Adopted policy</span>
src/pages\policies.astro:55:              <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-muted">Effective · August 18, 2026</span>
src/pages\policies.astro:66:            <div class="mt-7 border-l-2 border-clay bg-ink-soft/50 px-5 py-4">
src/pages\policies.astro:67:              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-muted">Definition</p>
src/pages\policies.astro:108:            <div class="mt-8 border-t border-ink-line pt-6 text-xs leading-relaxed text-bone-muted">
src/pages\policies.astro:119:            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">Public commitment</p>
src/pages\policies.astro:129:          <section id="updates" class="border-t border-ink-line pt-8" aria-labelledby="updates-heading">
src/pages\policies.astro:136:            <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-muted">Page last updated · August 18, 2026</p>
src/pages\resume.astro:44:        class="btn-ghost shrink-0 text-sm px-5 py-2.5"
src/pages\resume.astro:53:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Experience</h2>
src/pages\resume.astro:71:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Selected Deployed Work</h2>
src/pages\resume.astro:75:            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-clay">{work.label}</p>
src/pages\resume.astro:79:              class="mt-3 inline-block py-1 text-sm text-clay underline underline-offset-4 hover:text-clay-glow"
src/pages\resume.astro:93:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Education</h2>
src/pages\resume.astro:106:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Skills</h2>
src/pages\resume.astro:124:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Community &amp; Leadership</h2>
src/pages\resume.astro:139:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Awards &amp; Credentials</h2>
src/pages\roadmap.astro:242:  .roadmap-scope .lede { @apply text-hq-lede; max-width: 65ch; margin: 1.5rem 0 1rem; color: var(--secondary); }
src/pages\roadmap.astro:244:  .roadmap-scope .schedule-note { @apply text-hq-small; color: var(--ink-mute); max-width: 65ch; }
src/pages\roadmap.astro:252:  .roadmap-scope .section-head { @apply font-display text-hq-section font-medium; margin: theme('spacing.hq-section') 0 1.5rem; max-width: 26ch; }
src/pages\roadmap.astro:255:  .roadmap-scope .signup-copy { color: var(--secondary); max-width: 65ch; line-height: 1.65; }
src/pages\roadmap.astro:267:  .roadmap-scope .fine, .roadmap-scope .foot-note { @apply text-hq-small; color: var(--ink-mute); margin-top: 1rem; max-width: 65ch; }
src/pages\roadmap.astro:269:  @media (max-width: 640px) {
src/pages\compare\website-options.astro:95:  .comparison h1 { @apply text-hq-hero; max-width: 18ch; margin-block: 1.5rem; }
src/pages\compare\website-options.astro:96:  .comparison h2 { @apply text-hq-section; max-width: 26ch; margin-bottom: 1.5rem; }
src/pages\compare\website-options.astro:98:  .comparison p, .comparison li, .comparison dd { color: theme('colors.bone.dim'); line-height: 1.65; max-width: 70ch; }
src/pages\compare\website-options.astro:99:  .comparison .lede { @apply text-hq-lede; max-width: 56ch; }
src/pages\compare\website-options.astro:119:  @media (max-width: 768px) { .options { grid-template-columns: minmax(0, 1fr); } }
src/components\CaseStudyArt.astro:109:  <div class="absolute bottom-4 left-4 flex items-center gap-3 rounded-full border border-ink-line bg-ink/70 px-3.5 py-1.5 backdrop-blur">
src/components\CaseStudyArt.astro:114:    <span class="mono text-[10px] uppercase tracking-[0.2em] text-bone-dim">Scroll reel · dropping soon</span>
src/components\CaseStudyArt.astro:119:    <span class="mono text-[10px] uppercase tracking-[0.24em] text-bone-muted">Ref</span>
src/components\Faq.astro:51:        <h2 id="faq-heading" class="text-display-lg">
src/components\Faq.astro:77:            <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-bone transition-colors hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-ink [&::-webkit-details-marker]:hidden">
src/components\Faq.astro:85:            <div class="max-w-2xl pb-7 pt-2 pr-10 text-bone-dim">
src/pages\websites.astro:36:  <p class="container-page pb-8 text-bone-dim">
src/components\Header.astro:18:  <div class="container-page flex items-center justify-between py-6">
src/components\Header.astro:22:        style="border-radius: 2px;"
src/components\Header.astro:34:      <span class="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted sm:inline">Modernize. Mobilize. Multiply.</span>
src/components\Header.astro:65:        class="inline-flex items-center gap-1.5 border border-clay bg-clay px-4 py-2 text-sm font-semibold text-ink transition-all duration-150 hover:bg-clay-glow hover:border-clay-glow hover:shadow-glow-clay rounded-hq-control"
src/components\Header.astro:82:  @media (max-width: 1100px) {
src/components\Footer.astro:24:  <div class="container-page flex flex-col gap-6 py-10 text-sm text-bone-muted sm:flex-row sm:items-center sm:justify-between">
src/components\Footer.astro:30:        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">Modernize. Mobilize. Multiply.</span>
src/pages\start.astro:49:            <p class="mono text-[11px] uppercase tracking-[0.22em] text-bone-muted">Project ledger</p>
src/pages\start.astro:51:            <div class="mt-7 border-y border-ink-line/70 py-6">
src/pages\start.astro:57:                <span class="mono mb-1 rounded-sm border border-clay/50 bg-clay/10 px-2 py-1 text-xs uppercase tracking-[0.16em] text-clay">{BASIC_SITE.depositPercent}% down</span>
src/pages\start.astro:87:                <p class="mt-3 text-center mono text-[10px] uppercase tracking-[0.16em] text-bone-muted">Secure checkout hosted by Stripe</p>
src/pages\start.astro:95:                <div class="mt-7 rounded-sm border border-ink-line bg-ink-soft/60 px-4 py-3">
src/pages\start.astro:96:                  <p class="mono text-[11px] uppercase tracking-[0.18em] text-bone-muted">Checkout opening soon</p>
src/pages\start.astro:122:        <div class="container-page pt-10">
src/pages\start.astro:145:        <div class="container-page pb-16 text-sm text-bone-dim">JavaScript is required to reveal the post-payment project intake. Email through the footer if you need help.</div>
src/components\RoadmapTimeline.astro:43:    width: .75rem; height: .75rem; border-radius: 50%; background: theme('colors.bone.muted');
src/components\RoadmapTimeline.astro:53:  .body p { margin-top: .75rem; color: theme('colors.bone.dim'); max-width: 65ch; line-height: 1.65; }
src/components\RoadmapTimeline.astro:57:  @media (max-width: 640px) {
src/components\ChatWidget.astro:69:    border-radius: 999px;
src/components\ChatWidget.astro:96:    border-radius: 12px;
src/components\ChatWidget.astro:111:    font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
src/components\ChatWidget.astro:115:    width: 7px; height: 7px; border-radius: 999px;
src/components\ChatWidget.astro:122:    border-radius: 6px;
src/components\ChatWidget.astro:135:    max-width: 88%;
src/components\ChatWidget.astro:137:    border-radius: 10px;
src/components\ChatWidget.astro:138:    font-size: 13.5px; line-height: 1.5;
src/components\ChatWidget.astro:148:    border-radius: 999px; background: currentColor; opacity: 0.6;
src/components\ChatWidget.astro:166:    border-radius: 8px;
src/components\ChatWidget.astro:170:    font-family: inherit; font-size: 13.5px; line-height: 1.4;
src/components\ChatWidget.astro:176:    border-radius: 8px;
src/components\ChatWidget.astro:185:  @media (max-width: 480px) {
src/components\Proof.astro:17:      <h2 class="text-display-lg">
src/components\CaseStudy.astro:89:      <dl class="mt-6 grid grid-cols-1 gap-3 border-t border-ink-line pt-6 sm:grid-cols-3">
src/components\Intake.astro:170:        <span class="mono text-[10px] uppercase tracking-[0.18em] text-bone-muted">
src/components\Intake.astro:185:          <span class="mono text-[10px] uppercase tracking-[0.18em] text-bone-muted">
src/components\Intake.astro:206:        <span id="referred-by-hint" class="mono text-[10px] uppercase tracking-[0.18em] text-bone-muted">
src/components\Intake.astro:216:      <div class="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
src/components\Intake.astro:217:        <p class="mono text-[11px] uppercase tracking-[0.18em] text-bone-muted">
src/components\Intake.astro:235:        class="hidden rounded-lg border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-bone"
src/pages\thanks.astro:49:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Now</span>
src/pages\thanks.astro:54:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Next 24h</span>
src/pages\thanks.astro:59:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Email back</span>
src/pages\thanks.astro:66:        <div class="mt-16 border-t border-ink-line/60 pt-10">
src/pages\thanks.astro:70:              <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Aries Outdoor Living</span>
src/pages\thanks.astro:76:              <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Big 7 Construction</span>
src/pages\thanks.astro:85:        <div class="mt-16 border-t border-ink-line/60 pt-10">
src/pages\thanks.astro:95:              <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">→ See recent work</span>
src/pages\thanks.astro:108:              <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">→ Off-the-shelf templates</span>
src/pages\start\thanks.astro:25:      <div class="mt-10 border-t border-ink-line pt-8">
src/components\Hero.astro:20:      <span class="grid h-9 w-9 flex-none place-items-center overflow-hidden bg-ink-soft ring-1 ring-ink-line" style="border-radius: 2px;">
src/components\Hero.astro:25:      <span class="ml-auto hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone-muted sm:inline-flex">
src/components\Hero.astro:64:        <div class="font-mono text-[11px] uppercase tracking-[0.22em] text-clay/80">
src/components\Hero.astro:67:        <div class="mt-3 font-display text-display-lg leading-none text-bone">
src/components\Hero.astro:73:        <div class="mt-5 space-y-3 border-t border-ink-line/70 pt-4">
src/components\Hero.astro:75:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Aries Outdoor Living</span><br />
src/components\Hero.astro:79:            <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">Big 7 Construction</span><br />
src/components\Hero.astro:86:    <div class="mt-12 border-y border-ink-line py-6">
src/components\Services.astro:102:      <h2 class="text-display-lg">
src/components\Services.astro:117:            class="group relative block py-10 transition-colors duration-500 hover:bg-ink-soft/40 sm:py-14"
src/components\Services.astro:139:                  <span class={`mono inline-flex items-center rounded-sm border border-current/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${a.text} sm:text-sm`}>
src/components\Services.astro:157:                  <p class={`mono mt-5 inline-flex items-center gap-2 rounded-sm border border-current/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${a.text}`}>
src/components\Services.astro:189:      <span class="mono text-[11px] uppercase tracking-[0.2em] text-clay/80">Budget under $500?</span>
src/components\TradeLanding.astro:75:      <div class={`mt-12 grid gap-5 border-t border-ink-line/60 pt-8 ${proofs.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-xl'}`}>
src/components\TradeLanding.astro:78:            <span class={`mono text-[10px] uppercase tracking-[0.22em] ${accentText[p.accent]}`}>{p.name}</span>
src/components\TwoDoor.astro:12:<section class="relative py-10 sm:py-14" aria-label="Two ways to get a site">
src/components\TwoDoor.astro:28:        <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">→ Built for you</span>
src/components\TwoDoor.astro:46:        <span class="mono text-[10px] uppercase tracking-[0.22em] text-clay/80">→ Fast and cheap</span>
```


## Additional complete source scans

These sections also show approved token uses beside drift candidates so the
container, heading, border and spacing boundaries can be reviewed in context.
Standard spacing increments and reading widths are deliberate exceptions;
older display roles, arbitrary metadata sizes and non-token panel radii are
the remaining migration work. No additional source changes were made for this inventory.

### Heading roles and SVG type

```text
src/styles/global.css:178:    font-size: 11px;
src/pages\accessibility.astro:20:    <h1 class="mt-4 font-display text-4xl sm:text-5xl leading-[1.05] text-bone">
src/pages\accessibility.astro:29:    <h2 class="mt-14 font-display text-2xl text-bone">Our commitment</h2>
src/pages\accessibility.astro:39:    <h2 class="mt-14 font-display text-2xl text-bone">What we have done</h2>
src/pages\accessibility.astro:50:    <h2 class="mt-14 font-display text-2xl text-bone">Known limitations</h2>
src/pages\accessibility.astro:58:      <h2 class="font-display text-2xl text-bone">How to contact us</h2>
src/components\CaseStudy.astro:74:    <h3 class="font-display text-3xl font-medium sm:text-4xl">{d.client}</h3>
src/components\ChatWidget.astro:111:    font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
src/components\ChatWidget.astro:138:    font-size: 13.5px; line-height: 1.5;
src/components\ChatWidget.astro:170:    font-family: inherit; font-size: 13.5px; line-height: 1.4;
src/components\CaseStudyArt.astro:88:      <text x="140" y="360" text-anchor="middle" fill="var(--art-bone)" fill-opacity="0.7" font-family="Georgia,serif" font-size="14" letter-spacing="6">BUILD</text>
src/components\CaseStudyArt.astro:101:      <text x="500" y="360" text-anchor="middle" fill="var(--art-bone)" fill-opacity="0.7" font-family="Georgia,serif" font-size="14" letter-spacing="8">FIX</text>
src/components\Faq.astro:51:        <h2 id="faq-heading" class="text-display-lg">
src/pages\index.astro:38:        <h1 id="hub-heading">Everything I’m building.<br />One front door.</h1>
src/pages\index.astro:73:        <h2 id="departments-heading">One company.<br />Clear doors.</h2>
src/pages\index.astro:80:              <h3>{department.name}</h3>
src/pages\index.astro:93:          <h2 id="released-heading">Officially<br />released.</h2>
src/pages\index.astro:111:              <h3>{drop.name}</h3>
src/pages\index.astro:133:          <h3 id="preview-heading">Reachable does not mean released.</h3>
src/pages\index.astro:141:                <h4>{drop.name}</h4>
src/pages\index.astro:165:          <h2 id="roadmap-heading">What ships next matters.</h2>
src/pages\index.astro:183:                <h3>{drop.name}</h3>
src/pages\index.astro:196:        <h2 id="closing-heading">The hub grows when the work ships.</h2>
src/pages\index.astro:226:  .eyebrow,.section-code,.release-meta,.command-label,.meaning { font-size: theme('fontSize.hq-label[0]'); line-height: 1.5; font-weight: 500; }
src/pages\index.astro:232:  .hero h1 { margin: 2rem 0 0; font-size: theme('fontSize.hq-hero[0]'); line-height: 1.04; letter-spacing: -.035em; font-weight: 500; }
src/pages\index.astro:234:  .hero-lede { max-width: 56ch; margin: 1rem 0 0; color: var(--hq-dim); font-size: theme('fontSize.hq-lede[0]'); line-height: 1.65; }
src/pages\index.astro:242:  .command-head,.command-foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; padding: 1rem 1.5rem; font-size: theme('fontSize.hq-label[0]'); color: var(--hq-muted); }
src/pages\index.astro:250:  .command-stats div { display: grid; grid-template-columns: 1fr 1.6fr; gap: .75rem; padding-block: .75rem; border-top: 1px solid var(--hq-line); font-size: theme('fontSize.hq-small[0]'); }
src/pages\index.astro:257:  .section-intro h2,.ledger-title h2,.roadmap-copy h2,.closing h2 { margin: 0; font-size: theme('fontSize.hq-section[0]'); line-height: 1.12; letter-spacing: -.025em; }
src/pages\index.astro:262:  .department-card h3 { margin: 0; font-size: theme('fontSize.hq-title[0]'); line-height: 1.25; }
src/pages\index.astro:263:  .department-card p { margin: 1rem 0 1.5rem; font-size: theme('fontSize.hq-small[0]'); color: var(--hq-dim); line-height: 1.6; }
src/pages\index.astro:264:  .department-action { display: flex; justify-content: space-between; gap: .75rem; margin-top: auto; font-size: theme('fontSize.hq-small[0]'); font-weight: 600; }
src/pages\index.astro:268:  .release-index { align-self: start; color: var(--hq-muted); font-size: theme('fontSize.hq-label[0]'); font-variant-numeric: tabular-nums; }
src/pages\index.astro:272:  .release-main h3 { margin-top: .75rem; font-size: theme('fontSize.hq-title[0]'); }
src/pages\index.astro:277:  .preview-title h3 { font-size: theme('fontSize.hq-title[0]'); line-height: 1.25; }
src/pages\index.astro:281:  .preview-status { color: var(--hq-accent); font-size: theme('fontSize.hq-label[0]'); }
src/pages\index.astro:282:  .preview-list h4 { margin-top: .5rem; font-size: 1.125rem; }
src/pages\index.astro:283:  .preview-list p { font-size: theme('fontSize.hq-small[0]'); }
src/pages\index.astro:291:  .queue-order,.queue-date span { color: var(--hq-muted); font-size: theme('fontSize.hq-label[0]'); font-variant-numeric: tabular-nums; }
src/pages\index.astro:294:  .queue-date b { font-size: theme('fontSize.hq-small[0]'); font-weight: 600; }
src/pages\index.astro:295:  .queue-body>span { color: var(--hq-accent); font-size: theme('fontSize.hq-label[0]'); }
src/pages\index.astro:296:  .queue-body h3 { margin-top: .5rem; font-size: 1.25rem; }
src/pages\index.astro:297:  .queue-body p { margin-top: .5rem; color: var(--hq-dim); font-size: theme('fontSize.hq-small[0]'); line-height: 1.6; }
src/components\Hero.astro:34:    <h1 class="max-w-3xl text-hq-hero">
src/components\Hero.astro:67:        <div class="mt-3 font-display text-display-lg leading-none text-bone">
src/pages\roadmap.astro:39:        <h1 id="roadmap-heading" class="brand-display">Roadmap</h1>
src/pages\roadmap.astro:66:          <h2 id={`quarter-${index}`} class="section-head">{q}</h2>
src/pages\roadmap.astro:72:        <h2 id="signup-heading" class="section-head">Follow a build</h2>
src/pages\resume.astro:37:        <h1 class="font-display text-4xl sm:text-5xl leading-[1.05] text-bone">{resume.name}</h1>
src/pages\resume.astro:53:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Experience</h2>
src/pages\resume.astro:58:              <h3 class="font-display text-lg text-bone">{job.role} — {job.company}</h3>
src/pages\resume.astro:71:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Selected Deployed Work</h2>
src/pages\resume.astro:76:            <h3 class="mt-2 font-display text-lg text-bone">{work.name}</h3>
src/pages\resume.astro:93:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Education</h2>
src/pages\resume.astro:97:            <h3 class="font-display text-lg text-bone">{ed.school}</h3>
src/pages\resume.astro:106:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Skills</h2>
src/pages\resume.astro:124:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Community &amp; Leadership</h2>
src/pages\resume.astro:128:            <h3 class="font-display text-lg text-bone">{c.org}</h3>
src/pages\resume.astro:139:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Awards &amp; Credentials</h2>
src/pages\thanks.astro:34:        <h1 class="text-hq-hero">
src/pages\audit.astro:28:        <h1 class="text-hq-hero">
src/pages\policies.astro:31:      <h1 class="mt-10 max-w-4xl text-hq-hero">
src/pages\policies.astro:58:            <h2 id="covid-policy-heading" class="mt-7 font-display text-3xl text-bone sm:text-4xl">COVID-19 vaccination</h2>
src/pages\policies.astro:76:                <h3 class="font-medium text-bone">Medical privacy</h3>
src/pages\policies.astro:84:                <h3 class="font-medium text-bone">Client and site requirements</h3>
src/pages\policies.astro:92:                <h3 class="font-medium text-bone">Respect and non-retaliation</h3>
src/pages\policies.astro:100:                <h3 class="font-medium text-bone">When someone is sick</h3>
src/pages\policies.astro:120:            <h2 id="accessibility-policy-heading" class="mt-4 font-display text-3xl text-bone">Accessibility</h2>
src/pages\policies.astro:130:            <h2 id="updates-heading" class="font-display text-2xl text-bone">Updates and scope</h2>
src/pages\start.astro:30:            <h1 class="text-hq-hero">
src/components\Proof.astro:17:      <h2 class="text-display-lg">
src/components\RoadmapTimeline.astro:20:        <h3>
src/components\Intake.astro:45:      <h2 class="text-hq-section">{headline}</h2>
src/components\Services.astro:102:      <h2 class="text-display-lg">
src/components\Services.astro:136:                  <h3 class="font-display text-2xl font-medium leading-tight text-bone sm:text-4xl lg:text-5xl">
src/components\TradeLanding.astro:43:      <h1 class="text-hq-hero">
src/pages\start\thanks.astro:20:      <h1 class="mt-5 text-hq-hero">Your project is in the queue.</h1>
src/pages\compare\website-options.astro:33:    <h1 id="comparison-heading">Which website option fits your business?</h1>
src/pages\compare\website-options.astro:38:      <h2 id="short-answer">Start with the job</h2>
src/pages\compare\website-options.astro:49:      <h2 id="options-heading">Four ways to get it built</h2>
src/pages\compare\website-options.astro:53:            <h3>{option.name}</h3>
src/pages\compare\website-options.astro:67:      <h2 id="quote-heading">Compare the same scope</h2>
src/pages\compare\website-options.astro:80:      <h2 id="next-heading">Use your current site as the starting point</h2>
```

### Container and reading widths

```text
src/styles/global.css:62:  .container-page {
src/styles/global.css:63:    @apply mx-auto w-full max-w-6xl px-5 sm:px-8;
src/pages\websites.astro:28:  <div class="container-page">
src/pages\websites.astro:36:  <p class="container-page pb-8 text-bone-dim">
src/components\TwoDoor.astro:13:  <div class="container-page">
src/pages\thanks.astro:27:    <div class="container-page relative py-hq-section">
src/pages\thanks.astro:28:      <div class="max-w-3xl">
src/pages\thanks.astro:39:        <p class="mt-6 max-w-2xl text-lg text-bone-dim">
src/components\TradeLanding.astro:36:  <div class="container-page relative py-hq-section">
src/components\TradeLanding.astro:37:    <div class="max-w-3xl">
src/components\TradeLanding.astro:47:      <p class="mt-6 max-w-2xl text-lg text-bone-dim">{sub}</p>
src/components\TradeLanding.astro:75:      <div class={`mt-12 grid gap-5 border-t border-ink-line/60 pt-8 ${proofs.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-xl'}`}>
src/pages\start.astro:22:      <div class="container-page">
src/pages\start.astro:24:          <div class="max-w-3xl">
src/pages\start.astro:33:            <p class="mt-6 max-w-2xl text-lg text-bone-dim">
src/pages\start.astro:122:        <div class="container-page pt-10">
src/pages\start.astro:145:        <div class="container-page pb-16 text-sm text-bone-dim">JavaScript is required to reveal the post-payment project intake. Email through the footer if you need help.</div>
src/components\Services.astro:96:  <div class="container-page">
src/components\Services.astro:97:    <div class="reveal max-w-2xl">
src/components\Services.astro:144:                <p class="mt-5 max-w-2xl text-bone-dim">{s.body}</p>
src/components\Services.astro:182:    <p class="mt-10 max-w-2xl text-sm text-bone-muted">
src/components\Header.astro:18:  <div class="container-page flex items-center justify-between py-6">
src/components\Header.astro:82:  @media (max-width: 1100px) {
src/pages\resume.astro:32:  <article class="container-page max-w-3xl py-hq-section">
src/components\Footer.astro:24:  <div class="container-page flex flex-col gap-6 py-10 text-sm text-bone-muted sm:flex-row sm:items-center sm:justify-between">
src/components\Footer.astro:41:        class="max-w-full break-all transition-colors hover:text-bone"
src/components\RoadmapTimeline.astro:53:  .body p { margin-top: .75rem; color: theme('colors.bone.dim'); max-width: 65ch; line-height: 1.65; }
src/components\RoadmapTimeline.astro:57:  @media (max-width: 640px) {
src/pages\policies.astro:20:    <div class="container-page">
src/pages\policies.astro:31:      <h1 class="mt-10 max-w-4xl text-hq-hero">
src/pages\policies.astro:35:      <p class="mt-7 max-w-2xl text-lg leading-relaxed text-bone-dim">
src/pages\policies.astro:121:            <p class="mt-4 max-w-2xl leading-relaxed text-bone-dim">
src/pages\policies.astro:131:            <p class="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
src/components\Proof.astro:11:  <div class="container-page">
src/components\Proof.astro:12:    <div class="max-w-2xl">
src/pages\compare\website-options.astro:31:  <article class="comparison container-page" aria-labelledby="comparison-heading">
src/pages\compare\website-options.astro:95:  .comparison h1 { @apply text-hq-hero; max-width: 18ch; margin-block: 1.5rem; }
src/pages\compare\website-options.astro:96:  .comparison h2 { @apply text-hq-section; max-width: 26ch; margin-bottom: 1.5rem; }
src/pages\compare\website-options.astro:98:  .comparison p, .comparison li, .comparison dd { color: theme('colors.bone.dim'); line-height: 1.65; max-width: 70ch; }
src/pages\compare\website-options.astro:99:  .comparison .lede { @apply text-hq-lede; max-width: 56ch; }
src/pages\compare\website-options.astro:119:  @media (max-width: 768px) { .options { grid-template-columns: minmax(0, 1fr); } }
src/pages\start\thanks.astro:17:  <div class="container-page py-hq-section">
src/pages\start\thanks.astro:18:    <section class="panel mx-auto max-w-2xl p-8 sm:p-12">
src/components\Faq.astro:44:  <div class="container-page">
src/components\Faq.astro:46:      <div class="reveal max-w-xl">
src/components\Faq.astro:85:            <div class="max-w-2xl pb-7 pt-2 pr-10 text-bone-dim">
src/pages\index.astro:31:    <section class="hero container-page" aria-labelledby="hub-heading">
src/pages\index.astro:70:    <section class="departments container-page" aria-labelledby="departments-heading">
src/pages\index.astro:89:    <section id="released" class="released container-page" aria-labelledby="released-heading">
src/pages\index.astro:162:      <div class="container-page roadmap-grid">
src/pages\index.astro:192:    <section class="closing container-page" aria-labelledby="closing-heading">
src/pages\index.astro:234:  .hero-lede { max-width: 56ch; margin: 1rem 0 0; color: var(--hq-dim); font-size: theme('fontSize.hq-lede[0]'); line-height: 1.65; }
src/pages\index.astro:258:  .section-intro>p:last-child,.ledger-note { max-width: 48ch; color: var(--hq-dim); line-height: 1.65; }
src/pages\index.astro:273:  .release-main p,.preview-list p,.preview-title>p:last-child { max-width: 65ch; margin-top: .75rem; color: var(--hq-dim); line-height: 1.65; }
src/pages\index.astro:286:  .roadmap-copy>p:not(.section-code) { margin-top: 1.5rem; color: var(--hq-dim); line-height: 1.65; max-width: 60ch; }
src/pages\index.astro:301:  @media (max-width: 980px) {
src/pages\index.astro:309:  @media (max-width: 640px) {
src/components\Intake.astro:38:  <div class="container-page grid gap-14 lg:grid-cols-[1fr,1.15fr] lg:gap-20">
src/components\ChatWidget.astro:135:    max-width: 88%;
src/components\ChatWidget.astro:185:  @media (max-width: 480px) {
src/pages\audit.astro:21:    <div class="container-page relative py-hq-section">
src/pages\audit.astro:22:      <div class="max-w-3xl">
src/pages\audit.astro:32:        <p class="mt-6 max-w-2xl text-lg text-bone-dim">
src/components\Hero.astro:17:  <div class="container-page relative py-hq-section">
src/components\Hero.astro:34:    <h1 class="max-w-3xl text-hq-hero">
src/components\Hero.astro:42:        <p class="max-w-2xl text-lg leading-relaxed text-bone-dim sm:text-xl">
src/pages\roadmap.astro:34:    <div class="container-page py-hq-section">
src/pages\roadmap.astro:242:  .roadmap-scope .lede { @apply text-hq-lede; max-width: 65ch; margin: 1.5rem 0 1rem; color: var(--secondary); }
src/pages\roadmap.astro:244:  .roadmap-scope .schedule-note { @apply text-hq-small; color: var(--ink-mute); max-width: 65ch; }
src/pages\roadmap.astro:252:  .roadmap-scope .section-head { @apply font-display text-hq-section font-medium; margin: theme('spacing.hq-section') 0 1.5rem; max-width: 26ch; }
src/pages\roadmap.astro:255:  .roadmap-scope .signup-copy { color: var(--secondary); max-width: 65ch; line-height: 1.65; }
src/pages\roadmap.astro:267:  .roadmap-scope .fine, .roadmap-scope .foot-note { @apply text-hq-small; color: var(--ink-mute); margin-top: 1rem; max-width: 65ch; }
src/pages\roadmap.astro:269:  @media (max-width: 640px) {
src/pages\accessibility.astro:18:  <section class="container-page py-hq-section max-w-3xl">
src/pages\accessibility.astro:66:          class="inline-block max-w-full break-all text-clay underline underline-offset-4 hover:text-bone"
```

### Panel, border and radius treatments

```text
src/styles/global.css:45:    border-radius: 2px;
src/styles/global.css:70:    border-radius: theme('borderRadius.hq-control');
src/styles/global.css:75:    border-color: theme('colors.clay.glow');
src/styles/global.css:85:    border-radius: theme('borderRadius.hq-control');
src/styles/global.css:86:    border-color: theme('colors.ink.outline');
src/styles/global.css:89:    border-color: theme('colors.clay.DEFAULT');
src/styles/global.css:93:  /* Grouped content uses the shared neutral surface and panel radius. */
src/styles/global.css:94:  .panel {
src/styles/global.css:96:    border: 1px solid theme('colors.ink.line');
src/styles/global.css:97:    border-radius: theme('borderRadius.hq-panel');
src/styles/global.css:119:    border-color: theme('colors.ink.outline');
src/styles/global.css:120:    border-radius: theme('borderRadius.hq-control');
src/styles/global.css:124:    border-color: theme('colors.clay.DEFAULT');
src/styles/global.css:182:    border: 1px solid theme('colors.clay.DEFAULT');
src/styles/global.css:183:    border-radius: 999px;
src/styles/global.css:199:    border-color: theme('colors.clay.glow');
src/components\CaseStudy.astro:33:<article class={`panel group relative overflow-hidden p-6 sm:p-10 ${flip ? 'lg:flex-row-reverse' : ''} lg:flex lg:items-center lg:gap-14`}>
src/components\CaseStudy.astro:35:  <div class={`relative isolate mb-8 ${hideLiveHeader ? 'aspect-video' : 'aspect-[16/10]'} w-full overflow-hidden rounded-xl bg-ink-panel ring-1 ring-ink-line lg:mb-0 lg:w-1/2`}>
src/components\CaseStudyArt.astro:9:<div class="case-study-art relative flex h-full w-full overflow-hidden bg-gradient-to-br from-ink-panel via-ink-soft to-ink">
src/components\CaseStudyArt.astro:109:  <div class="absolute bottom-4 left-4 flex items-center gap-3 rounded-full border border-ink-line bg-ink/70 px-3.5 py-1.5 backdrop-blur">
src/components\CaseStudyArt.astro:111:      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-70"></span>
src/components\CaseStudyArt.astro:112:      <span class="relative inline-flex h-2 w-2 rounded-full bg-clay"></span>
src/components\ChatWidget.astro:16:    aria-controls="chat-panel"
src/components\ChatWidget.astro:29:  <div id="chat-panel" class="chat-panel" role="dialog" aria-label="M3MM assistant" aria-modal="false" hidden>
src/components\ChatWidget.astro:30:    <div class="chat-panel-head">
src/components\ChatWidget.astro:31:      <div class="chat-panel-title">
src/components\ChatWidget.astro:32:        <span class="chat-panel-dot" aria-hidden="true"></span>
src/components\ChatWidget.astro:35:      <button type="button" id="chat-close" class="chat-panel-close" aria-label="Close chat">
src/components\ChatWidget.astro:69:    border-radius: 999px;
src/components\ChatWidget.astro:72:    border: 1px solid theme('colors.clay.DEFAULT');
src/components\ChatWidget.astro:79:    border-color: theme('colors.clay.glow');
src/components\ChatWidget.astro:86:  .chat-panel {
src/components\ChatWidget.astro:95:    border: 1px solid theme('colors.ink.line');
src/components\ChatWidget.astro:96:    border-radius: 12px;
src/components\ChatWidget.astro:97:    box-shadow: theme('boxShadow.chat-panel');
src/components\ChatWidget.astro:100:  .chat-panel[hidden] { display: none; }
src/components\ChatWidget.astro:102:  .chat-panel-head {
src/components\ChatWidget.astro:105:    border-bottom: 1px solid theme('colors.ink.line');
src/components\ChatWidget.astro:106:    background: theme('colors.ink.panel');
src/components\ChatWidget.astro:108:  .chat-panel-title {
src/components\ChatWidget.astro:114:  .chat-panel-dot {
src/components\ChatWidget.astro:115:    width: 7px; height: 7px; border-radius: 999px;
src/components\ChatWidget.astro:119:  .chat-panel-close {
src/components\ChatWidget.astro:122:    border-radius: 6px;
src/components\ChatWidget.astro:124:    background: transparent; border: none; cursor: pointer;
src/components\ChatWidget.astro:126:  .chat-panel-close:hover, .chat-panel-close:focus-visible { color: theme('colors.bone.DEFAULT'); background: theme('colors.ink.line'); }
src/components\ChatWidget.astro:127:  .chat-panel-close svg { width: 16px; height: 16px; }
src/components\ChatWidget.astro:137:    border-radius: 10px;
src/components\ChatWidget.astro:143:  .chat-msg-assistant { align-self: flex-start; background: theme('colors.ink.panel'); border: 1px solid theme('colors.ink.line'); }
src/components\ChatWidget.astro:145:  .chat-msg-error { align-self: flex-start; background: theme('colors.ink.panel'); border: 1px solid theme('colors.ink.outline'); color: theme('colors.bone.dim'); }
src/components\ChatWidget.astro:148:    border-radius: 999px; background: currentColor; opacity: 0.6;
src/components\ChatWidget.astro:159:    border-top: 1px solid theme('colors.ink.line');
src/components\ChatWidget.astro:160:    background: theme('colors.ink.panel');
src/components\ChatWidget.astro:166:    border-radius: 8px;
src/components\ChatWidget.astro:168:    border: 1px solid theme('colors.ink.line');
src/components\ChatWidget.astro:176:    border-radius: 8px;
src/components\ChatWidget.astro:179:    border: none; cursor: pointer;
src/components\ChatWidget.astro:187:    .chat-panel { width: calc(100vw - 24px); right: -4px; }
src/components\ChatWidget.astro:197:  const panel = document.getElementById('chat-panel');
src/components\ChatWidget.astro:204:  if (widget && trigger && panel && closeBtn && messagesEl && form && input && sendBtn) {
src/components\ChatWidget.astro:214:      panel!.hidden = false;
src/components\ChatWidget.astro:221:      panel!.hidden = true;
src/components\Footer.astro:26:      <span class="grid h-7 w-7 place-items-center overflow-hidden rounded-md bg-ink-panel ring-1 ring-ink-line">
src/components\Header.astro:22:        style="border-radius: 2px;"
src/components\Header.astro:65:        class="inline-flex items-center gap-1.5 border border-clay bg-clay px-4 py-2 text-sm font-semibold text-ink transition-all duration-150 hover:bg-clay-glow hover:border-clay-glow hover:shadow-glow-clay rounded-hq-control"
src/components\Hero.astro:20:      <span class="grid h-9 w-9 flex-none place-items-center overflow-hidden bg-ink-soft ring-1 ring-ink-line" style="border-radius: 2px;">
src/components\Hero.astro:27:          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-70"></span>
src/components\Hero.astro:28:          <span class="relative inline-flex h-2 w-2 rounded-full bg-clay" style="box-shadow: 0 0 6px currentColor;"></span>
src/components\RoadmapTimeline.astro:35:  .timeline { position: relative; margin: 0; padding-left: 1.5rem; list-style: none; border-left: 1px solid theme('colors.ink.line'); }
src/components\RoadmapTimeline.astro:39:    border-radius: theme('borderRadius.hq-panel');
src/components\RoadmapTimeline.astro:43:    width: .75rem; height: .75rem; border-radius: 50%; background: theme('colors.bone.muted');
src/components\Intake.astro:50:          <span class="mono flex h-9 w-9 flex-none items-center justify-center rounded-full border border-clay/40 bg-clay/10 text-xs text-clay">01</span>
src/components\Intake.astro:57:          <span class="mono flex h-9 w-9 flex-none items-center justify-center rounded-full border border-clay/40 bg-clay/10 text-xs text-clay">02</span>
src/components\Intake.astro:64:          <span class="mono flex h-9 w-9 flex-none items-center justify-center rounded-full border border-clay/40 bg-clay/10 text-xs text-clay">03</span>
src/components\Intake.astro:73:      <div class="mt-10 flex items-center gap-4 rounded-2xl border border-ink-line bg-ink-soft/60 p-5 backdrop-blur-sm">
src/components\Intake.astro:74:        <div class="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-full bg-ink-panel ring-1 ring-ink-line">
src/components\Intake.astro:84:    <!-- Form panel -->
src/components\Intake.astro:87:      class="reveal reveal-delay-1 panel relative flex flex-col gap-6 p-6 sm:p-9"
src/components\Intake.astro:235:        class="hidden rounded-lg border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-bone"
src/components\SectionNav.astro:20:  .section-nav { margin-block: 2rem; border-block: 1px solid theme('colors.ink.line'); padding-block: 1rem; }
src/pages\policies.astro:22:        <span class="grid h-12 w-12 flex-none place-items-center overflow-hidden bg-ink-soft ring-1 ring-ink-line" style="border-radius: 2px;">
src/pages\policies.astro:51:          <article id="covid-vaccination" class="panel relative overflow-hidden p-6 sm:p-9" aria-labelledby="covid-policy-heading">
src/pages\policies.astro:118:          <section id="accessibility" class="panel p-6 sm:p-9" aria-labelledby="accessibility-policy-heading">
src/pages\thanks.astro:48:          <li class="panel flex flex-col gap-2 p-6">
src/pages\thanks.astro:53:          <li class="panel flex flex-col gap-2 p-6">
src/pages\thanks.astro:58:          <li class="panel flex flex-col gap-2 p-6">
src/pages\thanks.astro:69:            <div class="panel flex flex-col gap-2 p-6">
src/pages\thanks.astro:75:            <div class="panel flex flex-col gap-2 p-6">
src/pages\thanks.astro:90:              class="group panel flex flex-col gap-2 p-6 transition-colors hover:bg-ink-soft/60"
src/pages\thanks.astro:103:              class="group panel flex flex-col gap-2 p-6 transition-colors hover:bg-ink-soft/60"
src/pages\thanks.astro:116:        <div class="mt-14 rounded-2xl border border-ink-line bg-ink-soft/40 p-6 sm:p-8">
src/pages\thanks.astro:132:        <div class="panel mt-14 p-6 sm:p-8">
src/pages\index.astro:212:    --hq-panel: theme('colors.ink.panel');
src/pages\index.astro:236:  .action,.roadmap-button { display: inline-flex; gap: 1rem; align-items: center; justify-content: space-between; min-height: 48px; padding: .75rem 1.25rem; border: 1px solid var(--hq-outline); border-radius: theme('borderRadius.hq-control'); font-weight: 600; text-decoration: none; transition: background 150ms ease, color 150ms ease; }
src/pages\index.astro:237:  .action-live { color: var(--hq-ground); background: var(--hq-accent); border-color: var(--hq-accent); }
src/pages\index.astro:238:  .action-live:hover { background: var(--hq-highlight); border-color: var(--hq-highlight); }
src/pages\index.astro:240:  .action-ghost:hover { background: var(--hq-panel); }
src/pages\index.astro:241:  .command-card { border: 1px solid var(--hq-line); border-radius: theme('borderRadius.hq-panel'); background: var(--hq-card); overflow: hidden; }
src/pages\index.astro:243:  .command-head { border-bottom: 1px solid var(--hq-line); }
src/pages\index.astro:244:  .command-foot { border-top: 1px solid var(--hq-line); }
src/pages\index.astro:250:  .command-stats div { display: grid; grid-template-columns: 1fr 1.6fr; gap: .75rem; padding-block: .75rem; border-top: 1px solid var(--hq-line); font-size: theme('fontSize.hq-small[0]'); }
src/pages\index.astro:260:  .department-card { display: flex; flex-direction: column; height: 100%; padding: 1.5rem; border-top: 2px solid var(--hq-accent); background: var(--hq-card); color: var(--hq-text); text-decoration: none; transition: background 150ms ease; }
src/pages\index.astro:261:  .department-card:hover { background: var(--hq-panel); }
src/pages\index.astro:266:  .release-ledger { margin-top: 2rem; border-top: 1px solid var(--hq-line); }
src/pages\index.astro:267:  .release-row { display: grid; grid-template-columns: 3rem minmax(0,1fr) auto; gap: 1.5rem; align-items: center; padding-block: 2rem; border-bottom: 1px solid var(--hq-line); }
src/pages\index.astro:271:  .live-pip { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
src/pages\index.astro:274:  .launch-link,.preview-list a { display: inline-flex; align-items: center; gap: 1rem; min-height: 44px; padding: .625rem 1rem; border: 1px solid var(--hq-outline); border-radius: theme('borderRadius.hq-control'); color: var(--hq-accent); font-weight: 600; text-decoration: none; }
src/pages\index.astro:275:  .launch-link:hover,.preview-list a:hover { background: var(--hq-accent); color: var(--hq-ground); border-color: var(--hq-accent); }
src/pages\index.astro:276:  .preview-lab { display: grid; grid-template-columns: minmax(0,.7fr) minmax(0,1.3fr); gap: 3rem; margin-top: 3rem; padding: 2rem; border-radius: theme('borderRadius.hq-panel'); background: var(--hq-panel); }
src/pages\index.astro:278:  .preview-list li { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 1.5rem; padding-block: 1.5rem; align-items: center; border-bottom: 1px solid var(--hq-line); }
src/pages\index.astro:280:  .preview-list li:last-child { border: 0; padding-bottom: 0; }
src/pages\index.astro:287:  .roadmap-button { margin-top: 1.5rem; color: var(--hq-ground); border-color: var(--hq-accent); background: var(--hq-accent); }
src/pages\index.astro:289:  .queue-item { display: grid; grid-template-columns: 1.5rem 4.5rem minmax(0,1fr); gap: 1rem; padding-block: 1.5rem; border-bottom: 1px solid var(--hq-line); }
src/components\TradeLanding.astro:77:          <div class="panel flex flex-col gap-2 p-5">
src/pages\start.astro:40:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>One-page business site or focused refresh</span></li>
src/pages\start.astro:41:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>Mobile-first layout and clear customer action</span></li>
src/pages\start.astro:42:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>Contact path, starter SEO, and share preview</span></li>
src/pages\start.astro:43:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>You own the finished code</span></li>
src/pages\start.astro:47:          <aside class="panel relative overflow-hidden p-6 sm:p-8" aria-label="Payment summary">
src/pages\start.astro:57:                <span class="mono mb-1 rounded-sm border border-clay/50 bg-clay/10 px-2 py-1 text-xs uppercase tracking-[0.16em] text-clay">{BASIC_SITE.depositPercent}% down</span>
src/pages\start.astro:95:                <div class="mt-7 rounded-sm border border-ink-line bg-ink-soft/60 px-4 py-3">
src/pages\start.astro:123:          <div class="panel border-clay/30 bg-clay/[0.04] p-5 text-sm text-bone-dim" role="status">
src/pages\audit.astro:62:          <div class="panel flex flex-col gap-2 p-5">
src/pages\audit.astro:68:          <div class="panel flex flex-col gap-2 p-5">
src/components\Services.astro:139:                  <span class={`mono inline-flex items-center rounded-sm border border-current/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${a.text} sm:text-sm`}>
src/components\Services.astro:149:                      <span class={`mt-1 h-1.5 w-1.5 flex-none rounded-full ${a.text} bg-current opacity-60`}></span>
src/components\Services.astro:157:                  <p class={`mono mt-5 inline-flex items-center gap-2 rounded-sm border border-current/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${a.text}`}>
src/components\TwoDoor.astro:23:        class="group panel flex flex-col gap-2 p-6 transition-colors hover:bg-ink-soft/60"
src/components\TwoDoor.astro:41:        class="group panel flex flex-col gap-2 p-6 transition-colors hover:bg-ink-soft/60"
src/pages\accessibility.astro:42:      <li>A single <code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">&lt;main&gt;</code> landmark on every page.</li>
src/pages\accessibility.astro:45:      <li>Full support for <code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">prefers-reduced-motion</code> — animations disable for users who ask for less motion.</li>
src/pages\accessibility.astro:46:      <li>A defined page language (<code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">lang="en"</code>) so screen readers pronounce content correctly.</li>
src/pages\accessibility.astro:57:    <div class="mt-14 rounded-lg border border-ink-line bg-ink-panel/40 p-6 sm:p-8">
src/pages\roadmap.astro:248:    border-radius: theme('borderRadius.hq-panel'); list-style: none;
src/pages\roadmap.astro:253:  .roadmap-scope .signup { margin: theme('spacing.hq-section') 0 1.5rem; padding: 2rem; background: var(--card); border-radius: theme('borderRadius.hq-panel'); }
src/pages\roadmap.astro:259:  .roadmap-scope .field input { width: 100%; min-height: 3rem; padding: .75rem; background: var(--ground); color: var(--text); border: 1px solid var(--outline); border-radius: theme('borderRadius.hq-control'); font: inherit; }
src/pages\roadmap.astro:261:  .roadmap-scope .signup-btn { min-height: 3rem; padding: .75rem 1.5rem; background: var(--accent); color: var(--ground); border-radius: theme('borderRadius.hq-control'); font-weight: 600; cursor: pointer; }
src/pages\roadmap.astro:265:  .roadmap-scope .signup-status { margin-top: 1rem; padding: .75rem; border: 1px solid var(--outline); border-radius: theme('borderRadius.hq-control'); }
src/pages\resume.astro:74:          <article class="panel p-5">
src/pages\compare\website-options.astro:109:  .option { background: theme('colors.ink.soft'); padding: 1.5rem; border-radius: theme('borderRadius.hq-panel'); }
src/pages\compare\website-options.astro:117:  .actions .primary { background: theme('colors.clay.DEFAULT'); color: theme('colors.ink.DEFAULT'); padding: .75rem 1.25rem; border-radius: theme('borderRadius.hq-control'); font-weight: 600; text-decoration: none; }
src/pages\start\thanks.astro:18:    <section class="panel mx-auto max-w-2xl p-8 sm:p-12">
```

### CSS spacing and vertical utility rhythm

```text
src/styles/global.css:31:    padding-bottom: 5rem;
src/styles/global.css:69:    @apply inline-flex items-center justify-center gap-2.5 border border-clay bg-clay px-7 py-3.5 text-base font-semibold text-ink transition-all duration-150;
src/styles/global.css:84:    @apply inline-flex items-center justify-center gap-2 border px-7 py-3.5 text-base font-medium text-bone transition-all duration-150;
src/styles/global.css:118:    @apply w-full border bg-ink px-4 py-3 text-bone placeholder:text-bone-muted transition-all duration-150;
src/styles/global.css:172:    gap: 8px;
src/styles/global.css:173:    padding: 12px 18px;
src/styles/global.css:174:    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
src/components\CaseStudy.astro:35:  <div class={`relative isolate mb-8 ${hideLiveHeader ? 'aspect-video' : 'aspect-[16/10]'} w-full overflow-hidden rounded-xl bg-ink-panel ring-1 ring-ink-line lg:mb-0 lg:w-1/2`}>
src/components\CaseStudy.astro:69:    <div class="mb-4 flex flex-wrap items-baseline gap-3">
src/components\CaseStudy.astro:75:    <p class="mt-1 text-sm text-bone-muted">{d.kind}</p>
src/components\CaseStudy.astro:77:    <div class="mt-6 space-y-4">
src/components\CaseStudy.astro:79:        <p class="kicker mb-1.5">The problem</p>
src/components\CaseStudy.astro:83:        <p class="kicker mb-1.5">What we built</p>
src/components\CaseStudy.astro:89:      <dl class="mt-6 grid grid-cols-1 gap-3 border-t border-ink-line pt-6 sm:grid-cols-3">
src/components\CaseStudy.astro:93:            <dd class="mt-1 font-display text-lg text-bone">{m.value}</dd>
src/components\CaseStudy.astro:104:        class="mt-6 inline-flex items-center gap-1.5 text-sm text-clay transition-colors hover:text-clay-glow"
src/pages\audit.astro:23:        <div class="mb-6 flex items-center gap-3">
src/pages\audit.astro:32:        <p class="mt-6 max-w-2xl text-lg text-bone-dim">
src/pages\audit.astro:36:        <ul class="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-bone-muted">
src/pages\audit.astro:44:        <div class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-bone-muted">
src/pages\audit.astro:61:        <div class="mt-12 grid gap-5 border-t border-ink-line/60 pt-8 sm:grid-cols-2">
src/pages\accessibility.astro:20:    <h1 class="mt-4 font-display text-4xl sm:text-5xl leading-[1.05] text-bone">
src/pages\accessibility.astro:23:    <p class="mt-6 text-lg text-bone-muted leading-relaxed">
src/pages\accessibility.astro:29:    <h2 class="mt-14 font-display text-2xl text-bone">Our commitment</h2>
src/pages\accessibility.astro:30:    <p class="mt-4 text-bone-muted leading-relaxed">
src/pages\accessibility.astro:39:    <h2 class="mt-14 font-display text-2xl text-bone">What we have done</h2>
src/pages\accessibility.astro:40:    <ul class="mt-4 text-bone-muted leading-relaxed list-disc pl-6 space-y-2">
src/pages\accessibility.astro:42:      <li>A single <code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">&lt;main&gt;</code> landmark on every page.</li>
src/pages\accessibility.astro:45:      <li>Full support for <code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">prefers-reduced-motion</code> — animations disable for users who ask for less motion.</li>
src/pages\accessibility.astro:46:      <li>A defined page language (<code class="text-sm bg-ink-panel px-1.5 py-0.5 rounded">lang="en"</code>) so screen readers pronounce content correctly.</li>
src/pages\accessibility.astro:50:    <h2 class="mt-14 font-display text-2xl text-bone">Known limitations</h2>
src/pages\accessibility.astro:51:    <p class="mt-4 text-bone-muted leading-relaxed">
src/pages\accessibility.astro:57:    <div class="mt-14 rounded-lg border border-ink-line bg-ink-panel/40 p-6 sm:p-8">
src/pages\accessibility.astro:59:      <p class="mt-4 text-bone-muted leading-relaxed">
src/pages\accessibility.astro:62:      <p class="mt-4 text-bone">
src/pages\accessibility.astro:76:      <p class="mt-3 text-bone-muted text-sm">We aim to respond within two business days.</p>
src/pages\accessibility.astro:99:    <p class="mt-10 text-xs uppercase tracking-[0.14em] text-bone-muted">Last updated · July 10, 2026</p>
src/components\ChatWidget.astro:104:    padding: 14px 16px;
src/components\ChatWidget.astro:109:    display: flex; align-items: center; gap: 8px;
src/components\ChatWidget.astro:131:    padding: 16px;
src/components\ChatWidget.astro:132:    display: flex; flex-direction: column; gap: 10px;
src/components\ChatWidget.astro:136:    padding: 9px 12px;
src/components\ChatWidget.astro:147:    content: ''; display: inline-block; width: 6px; height: 6px; margin-left: 4px;
src/components\ChatWidget.astro:157:    display: flex; align-items: flex-end; gap: 8px;
src/components\ChatWidget.astro:158:    padding: 12px;
src/components\ChatWidget.astro:165:    padding: 9px 11px;
src/components\CaseStudyArt.astro:109:  <div class="absolute bottom-4 left-4 flex items-center gap-3 rounded-full border border-ink-line bg-ink/70 px-3.5 py-1.5 backdrop-blur">
src/components\Footer.astro:23:<footer class="mt-24 border-t border-ink-line/60">
src/components\Footer.astro:24:  <div class="container-page flex flex-col gap-6 py-10 text-sm text-bone-muted sm:flex-row sm:items-center sm:justify-between">
src/components\Faq.astro:47:        <div class="mb-6 flex items-center gap-3">
src/components\Faq.astro:54:        <p class="mt-6 text-lg text-bone-dim">
src/components\Faq.astro:60:          class="btn-primary mt-8"
src/components\Faq.astro:77:            <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-bone transition-colors hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-ink [&::-webkit-details-marker]:hidden">
src/components\Faq.astro:85:            <div class="max-w-2xl pb-7 pt-2 pr-10 text-bone-dim">
src/components\Faq.astro:90:                  class="mt-4 inline-flex items-center gap-1.5 text-sm text-clay underline decoration-clay/50 underline-offset-[6px] transition-colors hover:text-bone"
src/components\Hero.astro:19:    <div class="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2">
src/components\Hero.astro:40:    <div class="mt-12 grid gap-10 lg:grid-cols-[1.35fr,1fr] lg:items-end lg:gap-16">
src/components\Hero.astro:49:        <div class="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
src/components\Hero.astro:67:        <div class="mt-3 font-display text-display-lg leading-none text-bone">
src/components\Hero.astro:70:        <p class="mt-3 text-sm text-bone-dim">
src/components\Hero.astro:73:        <div class="mt-5 space-y-3 border-t border-ink-line/70 pt-4">
src/components\Hero.astro:86:    <div class="mt-12 border-y border-ink-line py-6">
src/components\Header.astro:18:  <div class="container-page flex items-center justify-between py-6">
src/components\Header.astro:65:        class="inline-flex items-center gap-1.5 border border-clay bg-clay px-4 py-2 text-sm font-semibold text-ink transition-all duration-150 hover:bg-clay-glow hover:border-clay-glow hover:shadow-glow-clay rounded-hq-control"
src/components\Header.astro:78:  .hub-header > div { flex-wrap: wrap; gap: 1rem; }
src/components\Header.astro:80:  .hub-header nav { display: flex; flex-wrap: wrap; gap: .25rem 1.25rem; }
src/components\Intake.astro:41:      <div class="mb-6 flex items-center gap-3">
src/components\Intake.astro:46:      <p class="mt-6 text-lg text-bone-dim">{sub}</p>
src/components\Intake.astro:48:      <ol class="mt-10 space-y-5">
src/components\Intake.astro:53:            <p class="mt-1 text-sm text-bone-dim">Under 2 minutes. Skip fields you don't have.</p>
src/components\Intake.astro:60:            <p class="mt-1 text-sm text-bone-dim">{mode === 'project' ? 'I review the intake and confirm the build plan before work begins.' : 'Lighthouse, mobile, funnel, copy — all of it.'}</p>
src/components\Intake.astro:67:            <p class="mt-1 text-sm text-bone-dim">{mode === 'project' ? 'Your $100 down payment reserves the next confirmed build window.' : 'A 5-minute recorded walkthrough, emailed within 24 hours. Plain English, no jargon.'}</p>
src/components\Intake.astro:73:      <div class="mt-10 flex items-center gap-4 rounded-2xl border border-ink-line bg-ink-soft/60 p-5 backdrop-blur-sm">
src/components\Intake.astro:79:          <p class="mt-0.5 text-xs text-bone-muted mono">One engineer · reviewing personally</p>
src/components\Intake.astro:216:      <div class="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
src/components\Intake.astro:235:        class="hidden rounded-lg border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-bone"
src/components\RoadmapTimeline.astro:35:  .timeline { position: relative; margin: 0; padding-left: 1.5rem; list-style: none; border-left: 1px solid theme('colors.ink.line'); }
src/components\RoadmapTimeline.astro:37:    position: relative; display: grid; grid-template-columns: 7rem minmax(0, 1fr); gap: 1.5rem;
src/components\RoadmapTimeline.astro:38:    padding: 1.5rem; margin-bottom: 1rem; background: theme('colors.ink.soft');
src/components\RoadmapTimeline.astro:50:  .body h3 { @apply font-display text-hq-title font-medium; margin: 0; }
src/components\RoadmapTimeline.astro:53:  .body p { margin-top: .75rem; color: theme('colors.bone.dim'); max-width: 65ch; line-height: 1.65; }
src/components\RoadmapTimeline.astro:54:  .status { @apply font-sans text-hq-label font-medium; display: block; margin-top: .5rem; color: theme('colors.clay.DEFAULT'); }
src/components\RoadmapTimeline.astro:58:    .item { grid-template-columns: minmax(0, 1fr); gap: 1rem; padding: 1.25rem; }
src/components\RoadmapTimeline.astro:59:    .date b { display: inline; margin-right: .5rem; }
src/components\SectionNav.astro:20:  .section-nav { margin-block: 2rem; border-block: 1px solid theme('colors.ink.line'); padding-block: 1rem; }
src/components\SectionNav.astro:21:  p { @apply text-hq-small; color: theme('colors.bone.dim'); margin-bottom: .5rem; }
src/components\SectionNav.astro:22:  ul { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; }
src/pages\roadmap.astro:233:    padding-bottom: 5rem;
src/pages\roadmap.astro:237:  .roadmap-scope .intro-label { @apply text-hq-small; color: var(--secondary); margin-bottom: 1.5rem; }
src/pages\roadmap.astro:238:  .roadmap-scope .brand-heading { display: flex; align-items: center; gap: 1rem; }
src/pages\roadmap.astro:240:  .roadmap-scope .brand-display { @apply font-display text-hq-hero font-medium; margin: 0; }
src/pages\roadmap.astro:241:  .roadmap-scope .brand-meaning { @apply text-hq-small; margin-top: 1rem; color: var(--secondary); }
src/pages\roadmap.astro:242:  .roadmap-scope .lede { @apply text-hq-lede; max-width: 65ch; margin: 1.5rem 0 1rem; color: var(--secondary); }
src/pages\roadmap.astro:246:    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem;
src/pages\roadmap.astro:247:    margin: 2rem 0 0; padding: 1.5rem; background: var(--card);
src/pages\roadmap.astro:251:  .roadmap-scope .stat span { @apply text-hq-small; display: block; margin-top: .5rem; color: var(--secondary); }
src/pages\roadmap.astro:252:  .roadmap-scope .section-head { @apply font-display text-hq-section font-medium; margin: theme('spacing.hq-section') 0 1.5rem; max-width: 26ch; }
src/pages\roadmap.astro:253:  .roadmap-scope .signup { margin: theme('spacing.hq-section') 0 1.5rem; padding: 2rem; background: var(--card); border-radius: theme('borderRadius.hq-panel'); }
src/pages\roadmap.astro:254:  .roadmap-scope .signup .section-head { margin-top: 0; }
src/pages\roadmap.astro:256:  .roadmap-scope .signup-form { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1rem; margin-top: 1.5rem; }
src/pages\roadmap.astro:258:  .roadmap-scope .field-label { @apply font-sans text-hq-small normal-case tracking-normal; display: block; margin-bottom: .5rem; }
src/pages\roadmap.astro:259:  .roadmap-scope .field input { width: 100%; min-height: 3rem; padding: .75rem; background: var(--ground); color: var(--text); border: 1px solid var(--outline); border-radius: theme('borderRadius.hq-control'); font: inherit; }
src/pages\roadmap.astro:261:  .roadmap-scope .signup-btn { min-height: 3rem; padding: .75rem 1.5rem; background: var(--accent); color: var(--ground); border-radius: theme('borderRadius.hq-control'); font-weight: 600; cursor: pointer; }
src/pages\roadmap.astro:265:  .roadmap-scope .signup-status { margin-top: 1rem; padding: .75rem; border: 1px solid var(--outline); border-radius: theme('borderRadius.hq-control'); }
src/pages\roadmap.astro:267:  .roadmap-scope .fine, .roadmap-scope .foot-note { @apply text-hq-small; color: var(--ink-mute); margin-top: 1rem; max-width: 65ch; }
src/pages\roadmap.astro:271:    .roadmap-scope .signup { padding: 1.25rem; }
src/pages\websites.astro:36:  <p class="container-page pb-8 text-bone-dim">
src/components\Proof.astro:13:      <div class="mb-6 flex items-center gap-3">
src/components\Proof.astro:20:      <p class="mt-5 text-lg text-bone-dim">
src/components\Proof.astro:25:    <div class="mt-14 space-y-10 lg:space-y-16">
src/pages\resume.astro:35:    <div class="mt-4 flex flex-wrap items-start justify-between gap-6">
src/pages\resume.astro:38:        <p class="mt-3 text-bone-dim">{resume.title} · {resume.location}</p>
src/pages\resume.astro:44:        class="btn-ghost shrink-0 text-sm px-5 py-2.5"
src/pages\resume.astro:50:    <p class="mt-8 text-lg text-bone-muted leading-relaxed">{resume.summary}</p>
src/pages\resume.astro:52:    <section class="mt-14">
src/pages\resume.astro:53:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Experience</h2>
src/pages\resume.astro:54:      <div class="mt-8 space-y-10">
src/pages\resume.astro:62:            <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-bone-dim">
src/pages\resume.astro:70:    <section class="mt-14">
src/pages\resume.astro:71:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Selected Deployed Work</h2>
src/pages\resume.astro:72:      <div class="mt-8 grid gap-6 sm:grid-cols-2">
src/pages\resume.astro:76:            <h3 class="mt-2 font-display text-lg text-bone">{work.name}</h3>
src/pages\resume.astro:77:            <p class="mt-2 text-sm leading-relaxed text-bone-dim">{work.detail}</p>
src/pages\resume.astro:79:              class="mt-3 inline-block py-1 text-sm text-clay underline underline-offset-4 hover:text-clay-glow"
src/pages\resume.astro:92:    <section class="mt-14">
src/pages\resume.astro:93:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Education</h2>
src/pages\resume.astro:94:      <div class="mt-8 space-y-4">
src/pages\resume.astro:105:    <section class="mt-14">
src/pages\resume.astro:106:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Skills</h2>
src/pages\resume.astro:107:      <dl class="mt-8 space-y-4">
src/pages\resume.astro:110:          <dd class="mt-1 text-bone-dim">{resume.skills.production.join(', ')}</dd>
src/pages\resume.astro:114:          <dd class="mt-1 text-bone-dim">{resume.skills.working.join(', ')}</dd>
src/pages\resume.astro:118:          <dd class="mt-1 text-bone-dim">{resume.skills.learning.join(', ')}</dd>
src/pages\resume.astro:123:    <section class="mt-14">
src/pages\resume.astro:124:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Community &amp; Leadership</h2>
src/pages\resume.astro:125:      <div class="mt-8 space-y-4">
src/pages\resume.astro:130:            <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-bone-dim">
src/pages\resume.astro:138:    <section class="mt-14">
src/pages\resume.astro:139:      <h2 class="font-display text-2xl text-bone border-b border-ink-line pb-3">Awards &amp; Credentials</h2>
src/pages\resume.astro:140:      <ul class="mt-8 list-disc space-y-2 pl-5 leading-relaxed text-bone-dim">
src/pages\resume.astro:145:    <section class="mt-14 text-sm text-bone-muted">
src/components\Services.astro:98:      <div class="mb-6 flex items-center gap-3">
src/components\Services.astro:105:      <p class="mt-6 text-lg text-bone-dim">
src/components\Services.astro:111:    <div class="mt-16 divide-y divide-ink-line/70 border-y border-ink-line/70">
src/components\Services.astro:117:            class="group relative block py-10 transition-colors duration-500 hover:bg-ink-soft/40 sm:py-14"
src/components\Services.astro:139:                  <span class={`mono inline-flex items-center rounded-sm border border-current/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${a.text} sm:text-sm`}>
src/components\Services.astro:143:                <p class="mt-3 text-sm text-bone-muted">{s.for}</p>
src/components\Services.astro:144:                <p class="mt-5 max-w-2xl text-bone-dim">{s.body}</p>
src/components\Services.astro:146:                <ul class="mt-5 grid gap-2 text-sm text-bone-dim sm:grid-cols-2">
src/components\Services.astro:149:                      <span class={`mt-1 h-1.5 w-1.5 flex-none rounded-full ${a.text} bg-current opacity-60`}></span>
src/components\Services.astro:157:                  <p class={`mono mt-5 inline-flex items-center gap-2 rounded-sm border border-current/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${a.text}`}>
src/components\Services.astro:182:    <p class="mt-10 max-w-2xl text-sm text-bone-muted">
src/components\Services.astro:188:    <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-bone-muted">
src/pages\policies.astro:27:          <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.17em] text-bone-muted">Modernize. Mobilize. Multiply.</p>
src/pages\policies.astro:31:      <h1 class="mt-10 max-w-4xl text-hq-hero">
src/pages\policies.astro:35:      <p class="mt-7 max-w-2xl text-lg leading-relaxed text-bone-dim">
src/pages\policies.astro:40:      <div class="mt-14 grid gap-10 lg:grid-cols-[240px,minmax(0,1fr)] lg:gap-16">
src/pages\policies.astro:43:          <nav class="mt-4 border-l border-ink-line" aria-label="Company policies">
src/pages\policies.astro:44:            <a href="#covid-vaccination" data-cta="policies-jump-vaccination" data-section="policies" data-intent="product:company-policies" class="block border-l border-clay py-2 pl-4 text-sm text-bone transition-colors hover:text-clay">COVID-19 vaccination</a>
src/pages\policies.astro:45:            <a href="#accessibility" data-cta="policies-jump-accessibility" data-section="policies" data-intent="product:company-policies" class="block py-2 pl-4 text-sm text-bone-dim transition-colors hover:text-bone">Accessibility</a>
src/pages\policies.astro:46:            <a href="#updates" data-cta="policies-jump-updates" data-section="policies" data-intent="product:company-policies" class="block py-2 pl-4 text-sm text-bone-dim transition-colors hover:text-bone">Updates and scope</a>
src/pages\policies.astro:53:            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line pb-5">
src/pages\policies.astro:58:            <h2 id="covid-policy-heading" class="mt-7 font-display text-3xl text-bone sm:text-4xl">COVID-19 vaccination</h2>
src/pages\policies.astro:59:            <p class="mt-5 text-lg leading-relaxed text-bone-dim">
src/pages\policies.astro:66:            <div class="mt-7 border-l-2 border-clay bg-ink-soft/50 px-5 py-4">
src/pages\policies.astro:68:              <p class="mt-2 text-sm leading-relaxed text-bone-dim">
src/pages\policies.astro:74:            <div class="mt-8 grid gap-7 sm:grid-cols-2">
src/pages\policies.astro:77:                <p class="mt-2 text-sm leading-relaxed text-bone-dim">
src/pages\policies.astro:85:                <p class="mt-2 text-sm leading-relaxed text-bone-dim">
src/pages\policies.astro:93:                <p class="mt-2 text-sm leading-relaxed text-bone-dim">
src/pages\policies.astro:101:                <p class="mt-2 text-sm leading-relaxed text-bone-dim">
src/pages\policies.astro:108:            <div class="mt-8 border-t border-ink-line pt-6 text-xs leading-relaxed text-bone-muted">
src/pages\policies.astro:120:            <h2 id="accessibility-policy-heading" class="mt-4 font-display text-3xl text-bone">Accessibility</h2>
src/pages\policies.astro:121:            <p class="mt-4 max-w-2xl leading-relaxed text-bone-dim">
src/pages\policies.astro:126:            <a href="/accessibility" class="mt-6 inline-flex text-sm text-clay underline decoration-clay/50 underline-offset-4 hover:text-bone" data-cta="policies-accessibility" data-section="policies">Read the accessibility statement →</a>
src/pages\policies.astro:129:          <section id="updates" class="border-t border-ink-line pt-8" aria-labelledby="updates-heading">
src/pages\policies.astro:131:            <p class="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
src/pages\policies.astro:136:            <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-muted">Page last updated · August 18, 2026</p>
src/components\TradeLanding.astro:38:      <div class="mb-6 flex items-center gap-3">
src/components\TradeLanding.astro:47:      <p class="mt-6 max-w-2xl text-lg text-bone-dim">{sub}</p>
src/components\TradeLanding.astro:49:      <div class="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
src/components\TradeLanding.astro:67:      <ul class="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-bone-muted">
src/components\TradeLanding.astro:75:      <div class={`mt-12 grid gap-5 border-t border-ink-line/60 pt-8 ${proofs.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-xl'}`}>
src/components\TradeLanding.astro:88:        class="group mt-6 inline-flex items-center gap-1.5 text-sm text-bone-dim underline decoration-clay/50 decoration-1 underline-offset-[6px] transition-colors hover:text-clay"
src/pages\thanks.astro:29:        <div class="mb-6 flex items-center gap-3">
src/pages\thanks.astro:39:        <p class="mt-6 max-w-2xl text-lg text-bone-dim">
src/pages\thanks.astro:47:        <ol class="mt-14 grid gap-5 sm:grid-cols-3">
src/pages\thanks.astro:66:        <div class="mt-16 border-t border-ink-line/60 pt-10">
src/pages\thanks.astro:67:          <p class="kicker mono mb-6">// Same review, real clients</p>
src/pages\thanks.astro:85:        <div class="mt-16 border-t border-ink-line/60 pt-10">
src/pages\thanks.astro:86:          <p class="kicker mono mb-6">// While you wait</p>
src/pages\thanks.astro:116:        <div class="mt-14 rounded-2xl border border-ink-line bg-ink-soft/40 p-6 sm:p-8">
src/pages\thanks.astro:117:          <p class="kicker mono mb-3">// Referrals</p>
src/pages\thanks.astro:119:          <p class="mt-2 text-bone-dim">{referral.body}</p>
src/pages\thanks.astro:122:            class="mt-5 inline-flex items-center gap-2 text-sm text-clay underline decoration-clay/50 decoration-1 underline-offset-[6px] hover:text-bone"
src/pages\thanks.astro:132:        <div class="panel mt-14 p-6 sm:p-8">
src/pages\thanks.astro:133:          <p class="kicker mono mb-3 text-clay/80">// If it's actually urgent</p>
src/components\TwoDoor.astro:12:<section class="relative py-10 sm:py-14" aria-label="Two ways to get a site">
src/components\TwoDoor.astro:14:    <div class="reveal mb-6 flex items-center gap-3">
src/pages\start.astro:25:            <div class="mb-6 flex items-center gap-3">
src/pages\start.astro:33:            <p class="mt-6 max-w-2xl text-lg text-bone-dim">
src/pages\start.astro:39:            <ul class="mt-9 grid gap-3 text-sm text-bone-dim sm:grid-cols-2">
src/pages\start.astro:40:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>One-page business site or focused refresh</span></li>
src/pages\start.astro:41:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>Mobile-first layout and clear customer action</span></li>
src/pages\start.astro:42:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>Contact path, starter SEO, and share preview</span></li>
src/pages\start.astro:43:              <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true"></span><span>You own the finished code</span></li>
src/pages\start.astro:51:            <div class="mt-7 border-y border-ink-line/70 py-6">
src/pages\start.astro:55:                  <p class="mt-1 font-display text-5xl font-medium text-bone">${BASIC_SITE.depositUsd}</p>
src/pages\start.astro:57:                <span class="mono mb-1 rounded-sm border border-clay/50 bg-clay/10 px-2 py-1 text-xs uppercase tracking-[0.16em] text-clay">{BASIC_SITE.depositPercent}% down</span>
src/pages\start.astro:59:              <div class="mt-6 flex items-center justify-between text-sm">
src/pages\start.astro:63:              <div class="mt-2 flex items-center justify-between text-sm">
src/pages\start.astro:69:            <p class="mt-5 text-sm leading-relaxed text-bone-dim">
src/pages\start.astro:77:                  class="btn-primary mt-7 flex w-full items-center justify-center"
src/pages\start.astro:87:                <p class="mt-3 text-center mono text-[10px] uppercase tracking-[0.16em] text-bone-muted">Secure checkout hosted by Stripe</p>
src/pages\start.astro:89:                <a href="#intake" data-cta="start-open-project-intake" data-section="start" data-intent="checkout:basic-deposit" class="mt-5 block text-center text-sm text-bone-dim underline decoration-clay/50 underline-offset-4" data-paid-intake-link>
src/pages\start.astro:95:                <div class="mt-7 rounded-sm border border-ink-line bg-ink-soft/60 px-4 py-3">
src/pages\start.astro:97:                  <p class="mt-2 text-sm leading-relaxed text-bone-dim">
src/pages\start.astro:103:                  class="btn-primary mt-5 flex w-full items-center justify-center"
src/pages\start.astro:122:        <div class="container-page pt-10">
src/pages\start.astro:145:        <div class="container-page pb-16 text-sm text-bone-dim">JavaScript is required to reveal the post-payment project intake. Email through the footer if you need help.</div>
src/pages\index.astro:224:  .hq-scope :is(section[id], h2[id]) { scroll-margin-top: 2rem; }
src/pages\index.astro:225:  .hero { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(280px,.6fr); gap: 3rem; align-items: center; padding-block: var(--hq-space); }
src/pages\index.astro:229:  .brand-lockup { display: flex; align-items: center; gap: 1rem; margin-top: 2rem; }
src/pages\index.astro:231:  .brand-name { margin: 0; font: 600 2rem/1.1 theme('fontFamily.display'); letter-spacing: -.025em; }
src/pages\index.astro:232:  .hero h1 { margin: 2rem 0 0; font-size: theme('fontSize.hq-hero[0]'); line-height: 1.04; letter-spacing: -.035em; font-weight: 500; }
src/pages\index.astro:233:  .meaning { margin: 1.5rem 0 0; color: var(--hq-accent); }
src/pages\index.astro:234:  .hero-lede { max-width: 56ch; margin: 1rem 0 0; color: var(--hq-dim); font-size: theme('fontSize.hq-lede[0]'); line-height: 1.65; }
src/pages\index.astro:235:  .hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
src/pages\index.astro:236:  .action,.roadmap-button { display: inline-flex; gap: 1rem; align-items: center; justify-content: space-between; min-height: 48px; padding: .75rem 1.25rem; border: 1px solid var(--hq-outline); border-radius: theme('borderRadius.hq-control'); font-weight: 600; text-decoration: none; transition: background 150ms ease, color 150ms ease; }
src/pages\index.astro:242:  .command-head,.command-foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; padding: 1rem 1.5rem; font-size: theme('fontSize.hq-label[0]'); color: var(--hq-muted); }
src/pages\index.astro:246:  .command-body { padding: 1.5rem; }
src/pages\index.astro:248:  .command-number { margin-top: 1rem; color: var(--hq-text); font: 500 4rem/1 theme('fontFamily.display'); font-variant-numeric: tabular-nums; }
src/pages\index.astro:249:  .command-caption { margin: .5rem 0 1.5rem; color: var(--hq-dim); }
src/pages\index.astro:250:  .command-stats div { display: grid; grid-template-columns: 1fr 1.6fr; gap: .75rem; padding-block: .75rem; border-top: 1px solid var(--hq-line); font-size: theme('fontSize.hq-small[0]'); }
src/pages\index.astro:253:  .departments,.released { padding-block: var(--hq-space); }
src/pages\index.astro:254:  .section-intro,.ledger-title { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 4rem; align-items: end; }
src/pages\index.astro:255:  .section-code { margin: 0 0 1rem; color: var(--hq-accent); }
src/pages\index.astro:256:  .section-intro .section-code { grid-column: 1 / -1; margin: 0; }
src/pages\index.astro:257:  .section-intro h2,.ledger-title h2,.roadmap-copy h2,.closing h2 { margin: 0; font-size: theme('fontSize.hq-section[0]'); line-height: 1.12; letter-spacing: -.025em; }
src/pages\index.astro:259:  .department-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 1rem; list-style: none; padding: 0; margin-top: 2rem; }
src/pages\index.astro:260:  .department-card { display: flex; flex-direction: column; height: 100%; padding: 1.5rem; border-top: 2px solid var(--hq-accent); background: var(--hq-card); color: var(--hq-text); text-decoration: none; transition: background 150ms ease; }
src/pages\index.astro:262:  .department-card h3 { margin: 0; font-size: theme('fontSize.hq-title[0]'); line-height: 1.25; }
src/pages\index.astro:263:  .department-card p { margin: 1rem 0 1.5rem; font-size: theme('fontSize.hq-small[0]'); color: var(--hq-dim); line-height: 1.6; }
src/pages\index.astro:264:  .department-action { display: flex; justify-content: space-between; gap: .75rem; margin-top: auto; font-size: theme('fontSize.hq-small[0]'); font-weight: 600; }
src/pages\index.astro:265:  .release-ledger,.preview-list,.queue { list-style: none; padding: 0; margin: 0; }
src/pages\index.astro:266:  .release-ledger { margin-top: 2rem; border-top: 1px solid var(--hq-line); }
src/pages\index.astro:267:  .release-row { display: grid; grid-template-columns: 3rem minmax(0,1fr) auto; gap: 1.5rem; align-items: center; padding-block: 2rem; border-bottom: 1px solid var(--hq-line); }
src/pages\index.astro:269:  .release-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; color: var(--hq-highlight); }
src/pages\index.astro:272:  .release-main h3 { margin-top: .75rem; font-size: theme('fontSize.hq-title[0]'); }
src/pages\index.astro:273:  .release-main p,.preview-list p,.preview-title>p:last-child { max-width: 65ch; margin-top: .75rem; color: var(--hq-dim); line-height: 1.65; }
src/pages\index.astro:274:  .launch-link,.preview-list a { display: inline-flex; align-items: center; gap: 1rem; min-height: 44px; padding: .625rem 1rem; border: 1px solid var(--hq-outline); border-radius: theme('borderRadius.hq-control'); color: var(--hq-accent); font-weight: 600; text-decoration: none; }
src/pages\index.astro:276:  .preview-lab { display: grid; grid-template-columns: minmax(0,.7fr) minmax(0,1.3fr); gap: 3rem; margin-top: 3rem; padding: 2rem; border-radius: theme('borderRadius.hq-panel'); background: var(--hq-panel); }
src/pages\index.astro:278:  .preview-list li { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 1.5rem; padding-block: 1.5rem; align-items: center; border-bottom: 1px solid var(--hq-line); }
src/pages\index.astro:279:  .preview-list li:first-child { padding-top: 0; }
src/pages\index.astro:280:  .preview-list li:last-child { border: 0; padding-bottom: 0; }
src/pages\index.astro:282:  .preview-list h4 { margin-top: .5rem; font-size: 1.125rem; }
src/pages\index.astro:285:  .roadmap-grid { display: grid; grid-template-columns: minmax(0,.8fr) minmax(0,1.2fr); gap: 4rem; padding-block: var(--hq-space); }
src/pages\index.astro:286:  .roadmap-copy>p:not(.section-code) { margin-top: 1.5rem; color: var(--hq-dim); line-height: 1.65; max-width: 60ch; }
src/pages\index.astro:287:  .roadmap-button { margin-top: 1.5rem; color: var(--hq-ground); border-color: var(--hq-accent); background: var(--hq-accent); }
src/pages\index.astro:289:  .queue-item { display: grid; grid-template-columns: 1.5rem 4.5rem minmax(0,1fr); gap: 1rem; padding-block: 1.5rem; border-bottom: 1px solid var(--hq-line); }
src/pages\index.astro:290:  .queue-item:first-child { padding-top: 0; }
src/pages\index.astro:296:  .queue-body h3 { margin-top: .5rem; font-size: 1.25rem; }
src/pages\index.astro:297:  .queue-body p { margin-top: .5rem; color: var(--hq-dim); font-size: theme('fontSize.hq-small[0]'); line-height: 1.6; }
src/pages\index.astro:298:  .closing { display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 2rem; align-items: center; padding-top: var(--hq-space); }
src/pages\index.astro:300:  .closing a { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; color: var(--hq-accent); text-underline-offset: .3em; text-decoration: underline; }
src/pages\index.astro:303:    .hero { gap: 2rem; }
src/pages\index.astro:312:    .department-card { padding: 1.5rem; }
src/pages\index.astro:313:    .release-row { grid-template-columns: minmax(0,1fr); gap: 1rem; }
src/pages\index.astro:315:    .preview-lab { padding: 1.5rem; gap: 2rem; }
src/pages\index.astro:316:    .preview-list li { grid-template-columns: minmax(0,1fr); gap: 1rem; }
src/pages\index.astro:318:    .queue-item { grid-template-columns: 3.5rem minmax(0,1fr); gap: 1rem; }
src/pages\index.astro:321:    .closing { grid-template-columns: minmax(0,1fr); gap: 1.5rem; }
src/pages\compare\website-options.astro:93:  :global(body:has(.comparison) footer) { padding-bottom: 5rem; }
src/pages\compare\website-options.astro:94:  .comparison { padding-block: theme('spacing.hq-section'); overflow-wrap: anywhere; }
src/pages\compare\website-options.astro:95:  .comparison h1 { @apply text-hq-hero; max-width: 18ch; margin-block: 1.5rem; }
src/pages\compare\website-options.astro:96:  .comparison h2 { @apply text-hq-section; max-width: 26ch; margin-bottom: 1.5rem; }
src/pages\compare\website-options.astro:97:  .comparison h3 { @apply text-hq-title; margin-bottom: 1.5rem; }
src/pages\compare\website-options.astro:101:  .comparison .disclosure { margin-top: 1.5rem; }
src/pages\compare\website-options.astro:102:  .comparison > section { margin-top: theme('spacing.hq-section'); }
src/pages\compare\website-options.astro:103:  .comparison ul, .comparison ol { padding-left: 1.5rem; margin-block: 1.5rem; }
src/pages\compare\website-options.astro:106:  .comparison li + li { margin-top: .75rem; }
src/pages\compare\website-options.astro:108:  .options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
src/pages\compare\website-options.astro:109:  .option { background: theme('colors.ink.soft'); padding: 1.5rem; border-radius: theme('borderRadius.hq-panel'); }
src/pages\compare\website-options.astro:110:  .option dt { font-weight: 600; margin-bottom: .25rem; }
src/pages\compare\website-options.astro:111:  .option dl > div + div { margin-top: 1.25rem; }
src/pages\compare\website-options.astro:112:  .comparison .source-note { margin-top: 1.5rem; }
src/pages\compare\website-options.astro:115:  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; margin-top: 1.5rem; }
src/pages\compare\website-options.astro:117:  .actions .primary { background: theme('colors.clay.DEFAULT'); color: theme('colors.ink.DEFAULT'); padding: .75rem 1.25rem; border-radius: theme('borderRadius.hq-control'); font-weight: 600; text-decoration: none; }
src/pages\start\thanks.astro:20:      <h1 class="mt-5 text-hq-hero">Your project is in the queue.</h1>
src/pages\start\thanks.astro:21:      <p class="mt-6 text-lg text-bone-dim">I’ll review the scope and your preferred timing, then email you to confirm the build week before work begins.</p>
src/pages\start\thanks.astro:22:      <div class="mt-8 border-l-2 border-clay pl-5 text-sm text-bone-dim">
src/pages\start\thanks.astro:25:      <div class="mt-10 border-t border-ink-line pt-8">
src/pages\start\thanks.astro:26:        <p class="kicker mono mb-3">// Referrals</p>
src/pages\start\thanks.astro:28:        <p class="mt-2 text-sm text-bone-dim">{referral.body}</p>
src/pages\start\thanks.astro:31:          class="mt-4 inline-flex items-center gap-2 text-sm text-clay underline decoration-clay/50 decoration-1 underline-offset-[6px] hover:text-bone"
src/pages\start\thanks.astro:40:      <a href="/" class="btn-secondary mt-10 inline-flex" data-cta="start-thanks-home" data-section="start-thanks" data-intent="book:free-review">Back home</a>
```
