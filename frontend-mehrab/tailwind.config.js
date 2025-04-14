/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        secondary: '#e2f8ed',
        accent: '#f0fff4',
      },
      fontFamily: {
        arabic: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      animation: {
        'sound-wave-1': 'sound-wave 1.2s infinite',
        'sound-wave-2': 'sound-wave 1s infinite',
        'sound-wave-3': 'sound-wave 0.8s infinite',
      },
      keyframes: {
        'sound-wave': {
          '0%, 100%': { transform: 'scaleY(0.6)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
} 