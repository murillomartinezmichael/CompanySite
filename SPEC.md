# CompanySite — Complete Product Specification

**Offload Labs Marketing Website**

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Design System](#2-design-system)
3. [Typography](#3-typography)
4. [Page Structure & Sections](#4-page-structure--sections)
5. [Component Specifications](#5-component-specifications)
6. [Responsive Behavior](#6-responsive-behavior)
7. [Animations & Interactions](#7-animations--interactions)
8. [Forms & Integrations](#8-forms--integrations)
9. [SEO & Meta](#9-seo--meta)
10. [File Structure](#10-file-structure)
11. [Development Guide](#11-development-guide)
12. [Deployment Guide](#12-deployment-guide)
13. [Roadmap](#13-roadmap)

---

## 1. Product Overview

### What It Is
A single-page marketing website for **Offload Labs** — a precision software engineering studio that builds automation, bots, and AI assistants for operations-driven small and mid-size businesses.

### Who It's For
**Visitor:** A business owner, operations manager, or CTO who is spending human hours on repetitive, automatable work. They land here via LinkedIn, referral, or search. They are evaluating whether to hire Offload Labs.

**Goal of the page:** Get the visitor to submit the contact form or send an email.

### Why a Single HTML File (No Framework)
The page has no dynamic data, no user state, no API calls. The content never changes without a human making a deliberate edit. Introducing React, Vite, or any build system would add:
- A build pipeline that can break
- Node modules to maintain
- A deploy process that's more complex

The trade-off would give you zero benefit on a static content page. A single `.html` file deploys by drag-and-drop to any host, zero configuration, zero dependencies. That's the right call here.

### Business Context
- **Company**: Offload Labs, Atlanta, GA
- **Owner**: Michael Murillo-Martinez
- **Email**: murillomartinezmichael@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/michael-murillo-martinez-912168194/
- **GitHub**: https://github.com/murillomartinezmichael
- **Form handler**: Formspree (endpoint: `https://formspree.io/f/mreroovo`)

---

## 2. Design System

### Philosophy
Warm, editorial, organic. Inspired by high-end print design — the kind of aesthetic that communicates precision and seniority without corporate coldness. Every color feels like it could be found in nature.

### Color Palette (CSS Custom Properties)

```css
:root {
  --cream:      #F4EFE6;   /* Primary background — warm off-white */
  --cream-2:    #EBE3D5;   /* Hover states, secondary backgrounds */
  --stone:      #D6CDBC;   /* Reserved — light borders, rarely used */
  --clay:       #B8835A;   /* Primary accent — labels, highlights */
  --clay-dark:  #8B5E3C;   /* Hover accent — italic spans, button hovers */
  --ink:        #1C1917;   /* Primary text, buttons, nav, footer bg */
  --ink-soft:   #3F3B37;   /* Secondary text */
  --muted:      #78716C;   /* Tertiary text, card examples, footer meta */
  --line:       #2A2724;   /* Very dark borders (reserved) */
}
```

**One accent color outside the palette:**
```css
#5a7a4a  /* Sage green — "Available" status dot in hero only */
```

**Semi-transparent derived colors (used inline, not as variables):**
```
rgba(255, 255, 255, 0.4)  — eyebrow badge background
rgba(28, 25, 23, 0.08)    — light border
rgba(28, 25, 23, 0.12)    — medium border (service card dividers)
rgba(28, 25, 23, 0.15)    — darker border (form inputs)
rgba(244, 239, 230, 0.85) — nav background
rgba(244, 239, 230, 0.7)  — process section intro text
rgba(244, 239, 230, 0.65) — process step body text
rgba(244, 239, 230, 0.5)  — footer meta text
rgba(255, 255, 255, 0.6)  — form input background (resting)
rgba(255, 255, 255, 0.9)  — form input background (focused)
```

### Spacing Scale
There is no formal spacing token system — spacing is set contextually per component. The recurring values are:

```
8px   — icon-to-text gap, tag padding vertical
16px  — button padding, small gaps
20px  — form label margin, small component padding
24px  — eyebrow margin, paragraph spacing
28px  — process step heading gap
32px  — CTA button padding, form margin
40px  — mobile gaps, hero padding unit
48px  — section header to grid
56px  — service card padding vertical
60px  — contact section header gap
80px  — services section header margin-bottom
100px — about grid gap
120px — standard section vertical padding
140px — process section vertical padding
160px — contact section vertical padding
180px — hero top padding
```

### Container
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}
```

### Grain Texture Overlay
A subtle noise texture is applied over the entire page via CSS:
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,..."); /* SVG fractal noise */
}
```
The SVG uses `feTurbulence` (fractalNoise, baseFrequency 0.9, 3 octaves) and `feColorMatrix`. This gives the page a printed, tactile feel that differentiates it from sterile digital-first designs.

---

## 3. Typography

### Font Families

| Font | Category | Use |
|---|---|---|
| **Fraunces** | Display serif | All headings, hero, footer brand, section titles |
| **Inter** | Sans-serif | All body text, labels, nav links, buttons, forms |

Both loaded from Google Fonts. Both use `display=swap` (fallback text shows immediately, font swaps in).

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

Fraunces uses **optical sizing** (`font-optical-sizing: auto`) — the letterforms subtly change shape at very large vs small sizes, which is what makes the 104px hero headline look right without manual tracking adjustments.

### Global Defaults
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'ss01', 'cv11';
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
  color: var(--ink);
  background: var(--cream);
}
```

### Serif Utility Class
```css
.serif {
  font-family: 'Fraunces', Georgia, serif;
  font-optical-sizing: auto;
  letter-spacing: -0.02em;
}
```

### Type Scale

**Fluid (responsive) — uses `clamp(min, preferred, max)`:**

| Element | Size |
|---|---|
| Hero h1 | `clamp(48px, 8vw, 104px)` |
| Hero subheading | `clamp(18px, 1.6vw, 22px)` |
| Section titles (h2) | `clamp(38px, 5vw, 68px)` |

**Fixed sizes:**

| Element | Size | Weight | Font |
|---|---|---|---|
| Nav brand | 22px | 500 | Fraunces |
| Nav links | 14px | 400 | Inter |
| Hero h1 line-height | 0.95 | — | — |
| Section label | 12px | 500 | Inter (uppercase, 0.25em tracking) |
| Service number | 14px | 400 | Fraunces |
| Service heading (h3) | 36px | 400 | Fraunces |
| Service description | 16px | 400 | Inter |
| Service examples | 13px | 400 | Inter |
| Process step number | 64px | 300 | Fraunces |
| Process step heading (h4) | 24px | 400 | Fraunces |
| Process step body | 15px | 400 | Inter |
| About intro paragraph | 26px | 400 | Fraunces |
| About body paragraphs | 19px | 400 | Inter |
| Stack tag label | 11px | 500 | Inter (uppercase, 0.25em tracking) |
| Stack tags | 13px | 500 | Inter |
| Form labels | 12px | 500 | Inter (uppercase, 0.15em tracking) |
| Form inputs | 16px | 400 | Inter |
| Button text | 15px | 500 | Inter |
| Footer brand | 64px | 300 | Fraunces |
| Footer links | 14px | 400 | Inter |
| Footer meta | 13px | 400 | Inter |

### Italic Accent Pattern
Throughout headings, a key word or phrase is wrapped in an `<em>` styled with:
```css
font-style: italic;
font-weight: 300;
color: var(--clay-dark);
```
This creates the editorial hierarchy effect. Example: "We build the systems your business *runs on*."

---

## 4. Page Structure & Sections

### Full Document Outline
```
<html lang="en">
  <head>
    — charset, viewport, title, meta, OG tags
    — Google Fonts preconnect + import
    — <style> block (all CSS, ~600 lines)
  </head>
  <body>
    <nav class="nav">         — Fixed top navigation
    <section id="hero">       — Hero / above the fold
    [decorative rule]         — "Engineered in Atlanta · Delivered worldwide"
    <section id="work">       — Services (4 cards)
    <section id="process">    — Process steps (dark bg)
    <section id="about">      — About + tech stack
    <section id="contact">    — Contact form
    <footer>                  — Footer brand + links
    <body::before>            — Grain texture overlay (CSS pseudo-element)
  </body>
```

### Section 1: Navigation
**ID/Class:** `.nav`  
**Position:** Fixed, top 0, full width, z-index 50

```
[● Offload Labs]    [Work]  [Process]  [About]  [Get in touch ↗]
```
- Left: brand mark (clay dot + serif logotype)
- Right: 4 nav links + filled CTA button
- Mobile: brand mark + single "Contact" pill button only (links hidden)
- Background: cream 85% opacity + `backdrop-filter: blur(12px)` (frosted glass effect)
- Border: 1px bottom, ink 8% opacity

### Section 2: Hero
**ID:** `#hero` (hero section has no anchor ID — it's the top of the page)  
**Padding:** 180px top, 120px bottom

```
[● Available for new projects · Atlanta, GA]

We build the systems
your business runs on.

Automation, bots, and AI built for teams that take their operations
seriously. Precision engineering for the work your people shouldn't
be doing by hand.

[Start a project →]  [See what we build →]
```

- **Eyebrow badge:** pill shape, green dot (pulsing), uppercase text
- **h1:** Fraunces, up to 104px, two-line split
- **Subheading:** Inter, up to 22px, max-width 620px
- **CTAs:** primary (filled pill) + secondary (underline-link style)
- All elements animate in on load (reveal animation, staggered)

**Decorative rule** (between hero and services):
```
————————————  Engineered in Atlanta · Delivered worldwide  ————————————
```
Two flex lines flanking centered uppercase text in muted color.

### Section 3: Services
**ID:** `#work`  
**Padding:** 120px top/bottom

```
— The Work
Four disciplines. Done right.

Systems engineered to handle operations that don't scale with headcount.

┌────────────────────────┬────────────────────────┐
│ 01 —                   │ 02 —                   │
│ Automation             │ Bots                   │
│                        │                        │
│ [description]          │ [description]          │
│ Examples: ...          │ Examples: ...          │
├────────────────────────┼────────────────────────┤
│ 03 —                   │ 04 —                   │
│ AI Assistants          │ Internal Tools         │
│                        │                        │
│ [description]          │ [description]          │
│ Examples: ...          │ Examples: ...          │
└────────────────────────┴────────────────────────┘
```

Grid: 2 columns on desktop, 1 on mobile. Cards separated by 1px borders. Hover: background → cream-2.

**The 4 Services:**

| # | Title | Description | Examples |
|---|---|---|---|
| 01 | Automation | Engineered scripts and integrations that eliminate manual data entry, cross-system handoffs, and the operational friction that compounds with scale. | Cross-system data sync · Automated reporting pipelines · File processing at scale · Scheduled job orchestration |
| 02 | Bots | Slack, Discord, and internal bots that field the questions your team answers on repeat — or execute routine operations on a schedule. | HR bots · Onboarding assistants · Status bots · Internal helpdesks |
| 03 | AI Assistants | Custom assistants trained on your manuals, SOPs, and institutional knowledge. Onboarding cycles shorten. Senior staff stop re-explaining the fundamentals. | Onboarding assistants · Internal knowledge retrieval · RAG systems for proprietary documentation |
| 04 | Internal Tools | Bespoke dashboards, admin portals, and operational workflows engineered around how your business actually runs — not how a SaaS template thinks it should. | Inventory systems · Operations dashboards · Approval workflows · Release & status portals |

### Section 4: Process
**ID:** `#process`  
**Background:** ink (#1C1917) — the only dark-background section  
**Padding:** 140px top/bottom  
**Margin:** 80px top/bottom (separates it visually from adjacent cream sections)

```
— The Process
Direct. Disciplined.

No six-month discovery phases. No pitch decks. Here's exactly how we work.

┌───────────────────┬───────────────────┬───────────────────┐
│ 01                │ 02                │ 03                │
│ Scoping call      │ Fixed-scope       │ Ship & support    │
│                   │ proposal          │                   │
│ [description]     │ [description]     │ [description]     │
└───────────────────┴───────────────────┴───────────────────┘
```

Grid: 3 columns on desktop, 1 on mobile. Step numbers in clay, 64px. Borders in cream 20% opacity.

**The 3 Steps:**

| Step | Title | Copy |
|---|---|---|
| 01 | Scoping call | Thirty minutes. We identify what's consuming your team's time and whether it's worth automating. If we can help, we'll show you how. If we can't, we'll tell you that too. |
| 02 | Fixed-scope proposal | A clear document: what we're building, when it ships, what it costs. No hourly surprises. No vague deliverables. No scope creep without agreement. |
| 03 | Ship & support | We build, deliver, and back the system. You own the code outright. Your operations keep running — with or without us in the picture. |

### Section 5: About
**ID:** `#about`  
**Padding:** 120px top/bottom  
**Layout:** 2-column grid (1fr : 1.2fr), right column is sticky

```
┌─────────────────────────────┬──────────────────────┐
│ — About                     │  ┌────────────────┐  │
│ Engineered in Atlanta.      │  │ — The Stack    │  │
│ Built to last.              │  │                │  │
│                             │  │ [C#] [.NET]    │  │
│ [intro paragraph 26px]      │  │ [Python] [JS]  │  │
│                             │  │ [Azure] [RAG]  │  │
│ [body paragraph 1]          │  │ [... 24 tags]  │  │
│ [body paragraph 2]          │  └────────────────┘  │
│ [body paragraph 3]          │  (sticky, top: 120px) │
└─────────────────────────────┴──────────────────────┘
```

**Copy:**

*Intro (26px, Fraunces):*
"Offload Labs is a precision engineering studio for operations-driven businesses. We build the internal systems other agencies won't touch — and the infrastructure SaaS can't replace."

*Paragraph 2:*
"Our background is production software for high-stakes environments: regulated gaming platforms, fintech payment systems, and enterprise DevOps. Release validation. Compliance workflows. Decryption pipelines. Build automation at scale. The kind of software that runs quietly in the background — and can't afford to break."

*Paragraph 3:*
"That same discipline, turned toward small and mid-size businesses who need real software, engineered properly, without the agency overhead."

**Tech Stack Tags (24 total):**
`C#` `·NET` `ASP.NET` `Razor` `C++` `Python` `JavaScript` `Angular` `HTML / CSS` `SQL` `PostgreSQL` `XML / JSON` `RESTful APIs` `Microservices` `Unity` `Bash` `Azure DevOps` `Octopus Deploy` `Jira / Scrum` `SVN Automation` `OpenAI` `Anthropic` `RAG Pipelines` `Vector DBs`

### Section 6: Contact
**ID:** `#contact`  
**Padding:** 160px top/bottom  
**Background:** linear-gradient(180deg, cream 0%, cream-2 100%)  
**Text-align:** center (header + form centered)

```
— Get in touch
Where is your team losing hours?

Tell us what's slow, repetitive, or manual.
We'll tell you if it's worth automating — usually within a day.

┌─────────────────────────────────────┐
│ Your name                           │
│ [                                 ] │
│                                     │
│ Email                               │
│ [                                 ] │
│                                     │
│ What's the problem?                 │
│ [                                   │
│                                     │
│                                   ] │
│                                     │
│ [         Send it →              ]  │
└─────────────────────────────────────┘

Or email directly: murillomartinezmichael@gmail.com
```

### Section 7: Footer

```
Offload            [LinkedIn] [GitHub] [Email]
Labs.              © 2026 Offload Labs · Atlanta, GA
```

- Left: oversized brand name in Fraunces 300, 64px
- "Labs." line in italic, clay color
- Right: 3 links + copyright
- Background: ink, text: cream

---

## 5. Component Specifications

### Button: Primary (`.btn-primary`)
```css
display: inline-flex;
align-items: center;
gap: 10px;
background: var(--ink);
color: var(--cream);
padding: 18px 32px;
border-radius: 999px;
font-weight: 500;
font-size: 15px;
transition: all 0.2s;

/* Hover */
background: var(--clay-dark);
transform: translateY(-1px);

/* SVG arrow inside: translateX(4px) on hover */
```

### Button: Secondary (`.btn-secondary`)
```css
color: var(--ink);
padding: 18px 0;
font-weight: 500;
font-size: 15px;
border-bottom: 1px solid var(--ink);
transition: opacity 0.2s;

/* Hover */
opacity: 0.6;
```

### Button: Nav CTA (`.btn-contact`)
```css
background: var(--ink);
color: var(--cream);
padding: 10px 20px;
border-radius: 999px;
font-weight: 500;
font-size: 14px;
transition: background 0.2s;

/* Hover */
background: var(--clay-dark);
```

### Eyebrow Badge
```css
display: inline-flex;
align-items: center;
gap: 10px;
padding: 8px 16px;
border: 1px solid rgba(28, 25, 23, 0.15);
border-radius: 999px;
background: rgba(255, 255, 255, 0.4);
font-size: 13px;
text-transform: uppercase;
letter-spacing: 0.08em;
color: var(--ink-soft);
margin-bottom: 48px;
```

Status dot inside eyebrow:
```css
width: 7px; height: 7px;
border-radius: 50%;
background: #5a7a4a;
animation: pulse 2s infinite;

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
```

### Section Label
```css
font-size: 12px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.25em;
color: var(--clay-dark);
display: block;
margin-bottom: 16px;
```

### Service Card
```css
padding: 56px 40px;
border-bottom: 1px solid rgba(28, 25, 23, 0.12);
transition: background 0.3s;

/* Odd cards only (desktop): */
border-right: 1px solid rgba(28, 25, 23, 0.12);

/* Hover: */
background: var(--cream-2);
```

### Stack Tag
```css
background: var(--cream);
border: 1px solid rgba(28, 25, 23, 0.12);
padding: 6px 14px;
border-radius: 999px;
font-size: 13px;
font-weight: 500;
color: var(--ink-soft);
```

### Form Input
```css
width: 100%;
padding: 16px 20px;
background: rgba(255, 255, 255, 0.6);
border: 1px solid rgba(28, 25, 23, 0.15);
border-radius: 4px;
font-family: inherit;
font-size: 16px;
color: var(--ink);
transition: border-color 0.2s, background 0.2s;
outline: none;

/* Focus: */
border-color: var(--clay-dark);
background: rgba(255, 255, 255, 0.9);
```

### Italic Accent
Used in all headings for the emphasized keyword:
```html
<em style-equivalent>keyword</em>
```
```css
font-style: italic;
font-weight: 300;
color: var(--clay-dark);
```

---

## 6. Responsive Behavior

### Breakpoints

| Breakpoint | Changes |
|---|---|
| `max-width: 900px` | About grid collapses to 1 column; gap reduces from 100px to 40px |
| `max-width: 768px` | Nav collapses (links hidden, mobile contact button appears); Services grid → 1 column; Process grid → 1 column; Footer stacks vertically; Footer brand 64px → 44px |

### What Stays the Same on Mobile
- All section padding (120px+) — intentionally generous even on mobile
- All font sizes (the fluid `clamp()` values handle scaling naturally)
- Grain texture overlay
- Form layout

### What Changes on Mobile
- Nav: All 4 links hidden → single "Contact" pill button shown
- Services: 2×2 grid → single column (right borders removed)
- Process: 3-column → single column
- About: 2-column → single column (sticky stack removed)
- Footer: row → column, left-aligned

---

## 7. Animations & Interactions

### Reveal Animation (Hero elements)
```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal    { animation: reveal 0.8s ease forwards; }
.reveal-d1 { animation-delay: 0.1s; }
.reveal-d2 { animation-delay: 0.2s; }
.reveal-d3 { animation-delay: 0.3s; }
```

Applied to: eyebrow badge (d1), hero h1 (d2), hero sub (d3), CTA buttons.

### Status Dot Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
/* Duration: 2s, infinite */
```

### Button Hover States
| Button | Hover Effect |
|---|---|
| Primary (.btn-primary) | background → clay-dark, translateY(-1px), arrow → translateX(4px) |
| Secondary (.btn-secondary) | opacity 0.6 |
| Nav CTA | background → clay-dark |
| Submit button | background → clay-dark, translateY(-1px) |

### Nav Link Hover
```css
transition: opacity 0.2s;
/* Hover: opacity 0.6 */
```

### Service Card Hover
```css
transition: background 0.3s;
/* Hover: background → var(--cream-2) */
```

### Form Focus State
```css
transition: border-color 0.2s, background 0.2s;
/* Focus: border-color → clay-dark, background → rgba(255,255,255,0.9) */
```

### Footer Link Hover
```css
transition: border-color 0.2s;
/* Hover: border-color → clay (#B8835A) */
```

---

## 8. Forms & Integrations

### Contact Form

**Handler:** [Formspree](https://formspree.io) (no backend code needed)  
**Endpoint:** `https://formspree.io/f/mreroovo`  
**Method:** POST  

Formspree receives the submission and forwards it as an email to the account associated with `mreroovo`. No server, no code, no database.

**Fields:**

| Field | Type | Name attr | Required | Placeholder |
|---|---|---|---|---|
| Name | `text` | `name` | Yes | Jane Smith |
| Email | `email` | `email` | Yes | jane@company.com |
| Message | `textarea` | `message` | Yes | Our team spends hours every week on... |

**What happens on submit:** Formspree handles the redirect/response. The user sees a Formspree "thank you" page (can be customized in Formspree dashboard to redirect back to the site).

**To change the form destination:** Log in to formspree.io, update the email on the `mreroovo` form.

### Direct Email Link
```html
<a href="mailto:murillomartinezmichael@gmail.com">
  murillomartinezmichael@gmail.com
</a>
```

### External Navigation Links
```
LinkedIn: https://www.linkedin.com/in/michael-murillo-martinez-912168194/
GitHub:   https://github.com/murillomartinezmichael
Email:    mailto:murillomartinezmichael@gmail.com
```

---

## 9. SEO & Meta

### Current Tags
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Offload Labs — Systems your business runs on</title>
<meta name="description" content="Automation, bots, and AI systems for operations-driven teams. Precision-built software from experienced gaming & fintech engineers.">
<meta property="og:title" content="Offload Labs">
<meta property="og:description" content="We build the systems your business runs on.">
```

### Missing (Future Improvement)
```html
<!-- Add these when ready -->
<meta property="og:image" content="https://offloadlabs.com/og-image.jpg">
<meta property="og:url" content="https://offloadlabs.com">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://offloadlabs.com">
```

### SEO Strengths
- Semantic HTML (proper heading hierarchy h1→h2→h3→h4)
- `lang="en"` on `<html>`
- Descriptive title with keyword
- Meta description present
- Fast loading (no JS, minimal assets)

---

## 10. File Structure

```
CompanySite/
├── index.html       ← Entire site: HTML + all CSS in <style> block (~27KB)
├── README.md        ← One-line description
└── .git/            ← Version control
```

**That's it.** The entire product is one file. This is intentional.

The CSS lives inside a `<style>` block in `<head>`. This is a valid, deliberate choice for a single-page site — it avoids an extra HTTP request for a stylesheet and keeps the entire site in one file.

---

## 11. Development Guide

### Running Locally
```bash
cd CompanySite
python -m http.server 8000
```
Open `http://localhost:8000`.

Why not just open the file directly (`file://`)? Because some browsers block certain features (like Formspree POST) on `file://` origins. A local server avoids this.

**Alternative local servers:**
```bash
# Node.js (if installed):
npx serve .

# VS Code: Live Server extension (right-click index.html → "Open with Live Server")
```

### Making Changes
Open `index.html` in any text editor. All HTML is in the `<body>`. All CSS is in the `<style>` block at the top of `<head>`. No build step, no compilation.

**CSS structure inside the `<style>` block:**
```
1. :root — CSS variables
2. * — box-sizing reset
3. html — scroll-behavior: smooth
4. body — global font, background, color
5. body::before — grain texture
6. a — link reset
7. .container — max-width wrapper
8. .serif — serif font utility
9. .nav — navigation styles
10. .hero — hero section
11. .reveal — animation classes
12. @keyframes reveal — reveal animation
13. @keyframes pulse — status dot
14. [section labels] — .section-label
15. .services — services section
16. .service — individual service card
17. .process — process section
18. .about — about section
19. .stack — tech stack box
20. .contact — contact form section
21. .footer — footer
22. @media (max-width: 900px) — about responsive
23. @media (max-width: 768px) — full mobile
```

### Testing Changes
- Resize browser window to test mobile (768px breakpoint)
- Hover all interactive elements (buttons, cards, nav links)
- Submit the form to verify Formspree receives it
- Check in Chrome, Firefox, and Safari (backdrop-filter needs `-webkit-` prefix)

---

## 12. Deployment Guide

### Option A: Azure Static Web Apps (Current/Recommended)
1. Push `index.html` to the GitHub repo
2. Azure Static Web Apps is connected to the repo
3. Deploys automatically on every push to `main`

No configuration file needed for a single-file site.

### Option B: Any Static Host
Upload `index.html` to:
- Netlify (drag-and-drop in their UI)
- Vercel (`vercel deploy`)
- GitHub Pages (push to `gh-pages` branch)
- Cloudflare Pages

### Custom Domain
Point `offloadlabs.com` (or whichever domain) to the hosting provider. The site works at any domain — no URLs are hardcoded.

**Important after domain change:** Update the `og:url` and `canonical` meta tags when you add them.

### Formspree on Production
Formspree's free tier allows 50 submissions/month. For higher volume, upgrade the Formspree plan or replace it with a backend endpoint. The form action URL (`https://formspree.io/f/mreroovo`) works from any domain.

---

## 13. Roadmap

### Done
- [x] Full landing page with all 6 sections
- [x] Responsive design (mobile + desktop)
- [x] Contact form via Formspree
- [x] Typography system (Fraunces + Inter)
- [x] Color palette + CSS variables
- [x] Hover states and animations
- [x] Grain texture overlay
- [x] Meta description + basic OG tags

### To Do (Future)
- [ ] Add `og:image` (a 1200×630px social share image)
- [ ] Add `og:url` and `canonical` tag once domain is set
- [ ] Add Twitter card tags
- [ ] Formspree: configure thank-you redirect back to site
- [ ] Case studies / portfolio section (when projects are shareable)
- [ ] Testimonials section
- [ ] Analytics (Plausible or Fathom — privacy-friendly)
- [ ] Consider adding a blog/writing section to support SEO over time
