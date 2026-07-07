/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────────────────
// CYBERPUNK 2055 · Edgerunners palette — 2026-07-06 shift v2.
//
// Mike's follow-up: "more of the guy than the girl" — David's electric
// lime is now the dominant hero color, Lucy's cyan drops to secondary,
// magenta rim glow stays the shared accent both characters carry.
//
// Semantic mapping (class names unchanged from v1, only HEX shifted):
//   clay   → David's electric lime  (was Lucy cyan)
//   neon   → magenta rim glow       (unchanged — the color both share)
//   cyber  → Lucy cyan              (was netrunner violet — now the secondary)
//   ink    → void / navy dark       (deep space-blue behind the scene)
//   bone   → silver-ice text        (unchanged)
// ─────────────────────────────────────────────────────────────────────────
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#030814',   // void — page ground
          soft:    '#0B1929',   // midnight — sections
          panel:   '#12213a',   // panel — cards
          line:    '#1E3556',   // hairline
        },
        bone: {
          DEFAULT: '#E8F4FF',   // ice — primary text
          dim:     '#C6D4E8',   // silver — secondary text
          muted:   '#7A8BA8',   // dim — labels + mono
        },
        clay: {
          DEFAULT: '#B4FF3D',   // David lime — primary accent (the guy)
          deep:    '#7ACC00',   // deeper lime shadow
          glow:    '#D0FF80',   // lighter lime hover / glow
        },
        cyber: '#6BC5F5',       // Lucy cyan — secondary accent (the girl)
        neon:  '#FF2C9E',       // magenta rim glow — shared accent
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
        // Primary glow is lime (David's hoodie), secondary is the magenta
        // rim light both characters carry in the Earth scene.
        'glow-clay': '0 0 60px -10px rgba(180, 255, 61, 0.55)',
        'glow-hot':  '0 0 60px -10px rgba(255, 44, 158, 0.5)',
        'panel':     '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        // Netrunner grid — now lime-tinted hairlines to sit under David-first
        // accents. Grain kept as legacy token.
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'grid': "linear-gradient(rgba(180,255,61,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(180,255,61,0.05) 1px, transparent 1px)",
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
