/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
        },
        accent: {
          DEFAULT: '#06B6D4',
          dark: '#0891B2',
        },
        success: {
          DEFAULT: '#22C55E',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        bg: {
          dark: '#0F172A',
          light: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
