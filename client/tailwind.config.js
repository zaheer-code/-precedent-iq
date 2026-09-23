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
          dark: '#0B1020',          // Color 1: Deep Midnight Navy
          base: '#0E1528',
          card: '#11182D',
          cardBorder: '#1C2640',
          cardBorderHover: '#2A3B60',
          accent: '#D9A62E',        // Color 2: Warm Legal Gold (Primary Accent)
          accentHover: '#E5B645',
          accentActive: '#C49223',
          accentMuted: 'rgba(217, 166, 46, 0.12)',
          accentBorder: 'rgba(217, 166, 46, 0.35)',
          navy: '#151E36',
          navyHover: '#1C2848',
          light: '#F3F4F6',         // Color 3: Soft Ivory White (Primary Text)
          muted: '#9CA3AF',
          slate: '#6B7280',
          subtle: '#374151'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
