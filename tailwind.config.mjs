/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────────────────
// CYBERPUNK 2055 · Edgerunners design system v3 — 2026-07-06.
//
// Spec (Mike's paste): 90% dark, neon accents thin + rare. Cyan is the
// primary accent (thin borders, small glows, underlines). Yellow appears
// only on primary CTA hover fills. Magenta is a rare punch, max 2 uses
// per page. Never all three accents in the same component.
//
// Semantic mapping (Tailwind class names unchanged; HEX shifted):
//   clay   → primary cyan            (was David lime — spec puts cyan back on top)
//   cyber  → CTA yellow              (was Lucy cyan — repurposed for hover fills)
//   neon   → magenta rare punch      (barely shifted hue)
//   ink    → void/navy/purple family (warmer than v2's blue-black)
//   bone   → icy silver text
// ─────────────────────────────────────────────────────────────────────────
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0D0B14',   // --bg-void  · page ground
          soft:    '#1B2A4A',   // --surface  · nav, cards, panels
          panel:   '#2B2140',   // --surface-alt · alternate sections
          line:    '#22223A',   // hairline (raw hex; rgba variants in raw CSS)
        },
        bone: {
          DEFAULT: '#E8ECF2',   // --text-main  · body copy, headings
          dim:     '#B8B4CC',   // secondary body
          muted:   '#8F8AA8',   // --text-muted · labels, mono, metadata
        },
        clay: {
          DEFAULT: '#7DF9FF',   // --accent-cyan · PRIMARY accent
          deep:    '#3AB3BD',   // deeper cyan for shadows
          glow:    '#B7FBFF',   // hover-tint (thin usage only)
        },
        cyber: '#F5D90A',       // --accent-yellow · CTAs + hover ONLY
        neon:  '#FF2E88',       // --accent-magenta · rare punch (max 2/page)
      },
      fontFamily: {
        // Space Grotesk for display (cyberpunk grotesque), JetBrains Mono
        // for kickers/labels, Inter for body copy. Fraunces removed —
        // serifs don't fit the 2055 aesthetic.
        display: ['"Space Grotesk"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 11vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-xl':  ['clamp(2.75rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(2rem, 5.5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        // Spec: hover states can add a faint cyan glow — 12px cap, ~0.3 alpha.
        // No large ambient glows. `glow-clay` is the ONLY hover token; kept
        // name for backwards compat with existing component classes.
        'glow-clay': '0 0 12px rgba(125, 249, 255, 0.30)',
        'glow-hot':  '0 0 12px rgba(255,  46, 136, 0.30)',
        'panel':     '0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 40px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        // Grid at <5% opacity per spec — cyan hairlines
        'grid': "linear-gradient(rgba(125,249,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(125,249,255,0.04) 1px, transparent 1px)",
      },
      animation: {
        'fade-up':    'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer':    'shimmer 3s linear infinite',
        'marquee':    'marquee 45s linear infinite',
        'pulse-soft': 'pulseSoft 3.6s ease-in-out infinite',
        'draw-line':  'drawLine 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both',
        'glitch':     'glitch 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        drawLine: {
          from: { strokeDashoffset: '500' },
          to:   { strokeDashoffset: '0' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)', opacity: '1' },
          '92%':           { transform: 'translate(-2px, 1px)', opacity: '0.9' },
          '94%':           { transform: 'translate(2px, -1px)',  opacity: '1' },
          '96%':           { transform: 'translate(-1px, -2px)', opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
