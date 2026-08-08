/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────────────────
// CONFIDENT STUDIO design system v4 — 2026-07-21.
//
// Replaces the v3 "Cyberpunk 2055 / Edgerunners" theme. That theme was
// built for TikTok-scroll-stopping character (see git history), but the
// actual buyer here is a small-business/contractor owner deciding whether
// to trust this person with their company's public face — BRD.md calls
// the audience out explicitly: "credible... not a DIY template." A
// gamer/anime aesthetic answers a different question than the one this
// page needs to answer. Direction: still dark, still confident and
// distinctive — just one restrained accent, no glitch/halftone/neon-HUD
// decoration. See DECISIONS.md for the full rationale.
//
// Semantic mapping (Tailwind class names unchanged; HEX shifted so every
// existing `text-clay` / `bg-ink` / etc. call site keeps working):
//   clay   → single accent, deepened + desaturated from the old neon cyan
//   ink    → void/navy family, kept (dark mode reads modern here)
//   bone   → text family, kept
//   cyber / neon → REMOVED. Every former usage now maps to clay or a
//   neutral bone/muted tone (see the file-by-file sweep in DECISIONS.md).
// ─────────────────────────────────────────────────────────────────────────
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0D0E14',   // --bg-void  · page ground
          soft:    '#161A24',   // --surface  · nav, cards, panels
          panel:   '#1D212C',   // --surface-alt · alternate sections
          line:    '#262B38',   // hairline (raw hex; rgba variants in raw CSS)
        },
        bone: {
          DEFAULT: '#EDEFF3',   // --text-main  · body copy, headings
          dim:     '#B7BBC7',   // secondary body
          muted:   '#82879A',   // --text-muted · labels, mono, metadata
        },
        clay: {
          DEFAULT: '#4FB8C7',   // --accent · single restrained teal-cyan, deepened
          deep:    '#2E7A85',   // deeper tone for shadows/borders
          glow:    '#8FD9E3',   // hover-tint (thin usage only)
        },
      },
      fontFamily: {
        // Space Grotesk display, Inter body. Mono resolves to the OS's own
        // ui-monospace (SF Mono / Cascadia / Roboto Mono) — kicker labels are
        // 11px uppercase 0.2em tracked, so system mono is visually clean and
        // saves ~31KB font transfer + one preload slot.
        display: ['"Space Grotesk"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 11vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-xl':  ['clamp(2.75rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(2rem, 5.5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        // Hover states get a faint accent glow — 12px cap, ~0.3 alpha. No
        // large ambient glows. `glow-clay` kept as the name for backwards
        // compat with existing component classes.
        'glow-clay': '0 0 12px rgba(79, 184, 199, 0.30)',
        'panel':     '0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 40px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        // Subtle grain texture on case-study art placeholders (CaseStudyArt.astro)
        // — editorial polish, unrelated to the removed neon/HUD theming.
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'marquee':   'marquee 45s linear infinite',
        'draw-line': 'drawLine 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        drawLine: {
          from: { strokeDashoffset: '500' },
          to:   { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
