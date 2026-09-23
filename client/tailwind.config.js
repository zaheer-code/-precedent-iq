/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          dark: '#0a0d14',
          card: '#121722',
          cardBorder: '#1e2638',
          accent: '#d4af37', // Luxury Warm Gold
          accentHover: '#e5c07b',
          navy: '#1a243b',
          navyHover: '#223050',
          slate: '#64748b',
          muted: '#94a3b8',
          light: '#f8fafc',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
