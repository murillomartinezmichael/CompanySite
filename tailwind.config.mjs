/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#08080B',
          soft: '#0E0E14',
          panel: '#141420',
          line: '#22222E',
        },
        bone: {
          DEFAULT: '#F4EFE6',
          dim: '#B8B2A6',
          muted: '#7A7568',
        },
        clay: {
          DEFAULT: '#FF3B5C',
          deep: '#D9002F',
          glow: '#FF7A93',
        },
        cyber: '#00E7FF',
        neon: '#FCEE0A',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 11vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-xl': ['clamp(2.75rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 5.5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        'glow-clay': '0 0 60px -10px rgba(255, 59, 92, 0.55)',
        'panel': '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 3s linear infinite',
        'marquee': 'marquee 45s linear infinite',
        'pulse-soft': 'pulseSoft 3.6s ease-in-out infinite',
        'draw-line': 'drawLine 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        drawLine: {
          from: { strokeDashoffset: '500' },
          to: { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
