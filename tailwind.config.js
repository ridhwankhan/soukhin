/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          50: '#E8F5F0',
          100: '#C4E6DB',
          200: '#9FD7C6',
          300: '#7AC8B1',
          400: '#55B99C',
          500: '#1B4332',
          600: '#163828',
          700: '#112D1E',
          800: '#0C2215',
          900: '#07170B',
        },
        secondary: {
          DEFAULT: '#F5F0E8',
          50: '#FDFCFA',
          100: '#F9F6F2',
          200: '#F5F0E8',
          300: '#E8E0D4',
          400: '#D4C4B5',
          500: '#B8860B',
          600: '#9A7209',
          700: '#7C5E07',
          800: '#5E4A05',
          900: '#403603',
        },
        accent: {
          DEFAULT: '#B8860B',
          light: '#D4A84A',
          dark: '#8B6508',
        },
        terracotta: {
          DEFAULT: '#C2704A',
          50: '#FBF0EB',
          100: '#F7E1D7',
          200: '#EFC4B4',
          300: '#E7A791',
          400: '#DF8A6E',
          500: '#C2704A',
          600: '#9B5A3B',
          700: '#74422C',
          800: '#4D2A1D',
          900: '#26120E',
        },
        softblack: '#2D2D2D',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        bengali: ['Hind Siliguri', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '108': '27rem',
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
