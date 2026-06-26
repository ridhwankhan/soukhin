/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        muted: 'var(--color-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          fg: 'var(--color-accent-fg)',
          soft: 'var(--color-accent-soft)',
        },
        heading: 'var(--color-heading)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          secondary: 'var(--color-ink-secondary)',
          muted: 'var(--color-ink-muted)',
        },
        line: 'var(--color-border)',
        footer: {
          DEFAULT: 'var(--color-footer)',
          fg: 'var(--color-footer-fg)',
        },
        announcement: {
          DEFAULT: 'var(--color-announcement)',
          fg: 'var(--color-announcement-fg)',
        },
        /* Legacy aliases — map to theme tokens */
        primary: {
          DEFAULT: 'var(--color-accent)',
          600: 'var(--color-accent-hover)',
        },
        secondary: {
          DEFAULT: 'var(--color-surface)',
        },
        softblack: 'var(--color-ink)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        bengali: ['Hind Siliguri', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        108: '27rem',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
