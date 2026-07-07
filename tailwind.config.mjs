/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────────────────
// CYBERPUNK 2055 · Lucy palette (Edgerunners) — 2026-07-06 restoration.
//
// The prior editorial (clay-red + neon-yellow) palette got rolled back per
// Mike's directive. Class names stay the same (`text-clay`, `text-neon`,
// `bg-ink`, `text-bone` …) so component code doesn't churn — only the HEX
// values shift.
//
// Semantic mapping:
//   clay   → Netrunner cyan     (was aggressive red)
//   neon   → cool magenta       (was aggressive yellow — Mike's "yall changed it with the yellow" complaint)
//   cyber  → violet accent      (was another cyan)
//   ink    → void / midnight    (deeper night-city dark)
//   bone   → silver-ice text    (was warm off-white)
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
          DEFAULT: '#6BC5F5',   // Lucy blue — primary accent
          deep:    '#2E7FB8',   // deeper cyan for shadows
          glow:    '#B3DFF8',   // hover / glow layer
        },
        cyber: '#A87BFF',       // netrunner violet
        neon:  '#FF2C9E',       // cool magenta — replaces the yellow entirely
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
        // Rewired: cyan glow replaces clay glow, plus a magenta glow token
        // for the secondary accent.
        'glow-clay': '0 0 60px -10px rgba(107, 197, 245, 0.55)',
        'glow-hot':  '0 0 60px -10px rgba(255, 44, 158, 0.5)',
        'panel':     '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        // Netrunner grid instead of grain — subtle 48px lattice using cyan
        // hairlines. Kept the SVG-grain token in case anything else consumes
        // it, but body no longer applies it.
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'grid': "linear-gradient(rgba(107,197,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(107,197,245,0.05) 1px, transparent 1px)",
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
