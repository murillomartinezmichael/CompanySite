/** M3MM performance palette — Michael approved lime/blue/black, 2026-09-09.
 *  Light mode added 2026-10-01 at Michael's request. Token roles never change
 *  between themes (ink = surfaces, bone = text, clay/electric = accents); only
 *  the values do. Each token is a CSS variable of RGB channels so opacity
 *  modifiers (`bg-clay/20`) keep working; src/styles/global.css emits them. */
export const palettes = {
  dark: {
    electric: { DEFAULT: '#50BDFF', deep: '#174E78', glow: '#9BDCFF' },
    ink: {
      DEFAULT: '#050607',   // --bg-void  · page ground
      soft:    '#101519',   // --surface  · nav, cards, panels
      panel:   '#192127',   // --surface-alt · alternate sections
      outline: '#9AA7B1',   // interactive boundaries; >=3:1 on all surfaces
      line:    '#354149',   // hairline
    },
    bone: {
      DEFAULT: '#F4F7F8',   // --text-main  · body copy, headings
      dim:     '#C2CDD3',   // secondary body
      muted:   '#9AA7B1',   // --text-muted · labels, mono, metadata
    },
    clay: {
      DEFAULT: '#B6FF3B',   // primary action lime; legacy token name
      deep:    '#567C18',   // deeper tone for shadows/borders
      glow:    '#D2FF87',   // hover-tint (thin usage only)
    },
  },
  // Neon lime and sky blue fail as text on white, so light mode carries the
  // same hues at text-safe depth. Pinned by tests/build/muted-text-contrast.
  light: {
    electric: { DEFAULT: '#0B5FA0', deep: '#BFE3FA', glow: '#084C82' },
    ink: {
      DEFAULT: '#F5F7F8',
      soft:    '#FFFFFF',
      panel:   '#E9EEF1',
      outline: '#6B7884',
      line:    '#CED7DD',
    },
    bone: {
      DEFAULT: '#0A0E11',
      dim:     '#2C3840',
      muted:   '#4A5761',
    },
    clay: {
      DEFAULT: '#3A6600',
      deep:    '#C9F08A',
      glow:    '#2F5400',
    },
  },
};

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
const asVar = (group, shade) => `rgb(var(--${group}${shade === 'DEFAULT' ? '' : '-' + shade}) / <alpha-value>)`;
/** `{ '--ink': '5 6 7', '--ink-soft': ... }` for one palette — global.css uses it. */
export const themeVars = (palette) => Object.fromEntries(
  Object.entries(palette).flatMap(([group, shades]) => Object.entries(shades).map(([shade, hex]) =>
    [`--${group}${shade === 'DEFAULT' ? '' : '-' + shade}`, channels(hex)])));

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: Object.fromEntries(Object.entries(palettes.dark).map(([group, shades]) =>
        [group, Object.fromEntries(Object.keys(shades).map((shade) => [shade, asVar(group, shade)]))])),
      fontFamily: {
        // Space Grotesk display, Inter body. Mono resolves to the OS's own
        // ui-monospace (SF Mono / Cascadia / Roboto Mono) — kicker labels are
        // 11px uppercase 0.2em tracked, so system mono is visually clean and
        // saves ~31KB font transfer + one preload slot.
        display: ['"Space Grotesk"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      spacing: { 'hq-section': 'clamp(3rem, 6vw, 5rem)' },
      borderRadius: { 'hq-control': '8px', 'hq-panel': '16px' },
      fontSize: {
        'hq-hero': ['clamp(2.5rem, 5.2vw, 4.5rem)', { lineHeight: '1.04', letterSpacing: '-0.035em' }],
        'hq-section': ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.025em' }],
        'hq-title': ['1.5rem', { lineHeight: '1.25' }],
        'hq-lede': ['1.125rem', { lineHeight: '1.65' }],
        'hq-small': ['0.875rem', { lineHeight: '1.6' }],
        'hq-label': ['0.8125rem', { lineHeight: '1.5' }],
        'display-2xl': ['clamp(3rem, 11vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-xl':  ['clamp(2.75rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(2rem, 5.5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        'floating-control': '0 8px 24px rgb(0 0 0 / var(--shadow-strength, 0.45))',
        'chat-panel': '0 20px 60px rgb(0 0 0 / var(--shadow-strength, 0.55))',
        // Hover states get a faint accent glow — 12px cap, ~0.3 alpha. No
        // large ambient glows. `glow-clay` kept as the name for backwards
        // compat with existing component classes.
        'glow-clay': '0 0 12px rgba(182, 255, 59, 0.22)',
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
  plugins: [
    // Dark is the default. Light applies when the visitor's OS prefers it and
    // they have not chosen, or when they pick it with the header toggle
    // (Layout.astro sets data-theme before first paint).
    ({ addBase }) => addBase({
      ':root': { ...themeVars(palettes.dark), colorScheme: 'dark' },
      '@media (prefers-color-scheme: light)': {
        ':root:not([data-theme="dark"])': { ...themeVars(palettes.light), '--shadow-strength': '0.14', colorScheme: 'light' },
      },
      ':root[data-theme="light"]': { ...themeVars(palettes.light), '--shadow-strength': '0.14', colorScheme: 'light' },
    }),
  ],
};
