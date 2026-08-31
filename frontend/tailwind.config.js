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
        intel: {
          950: '#0a0d14',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          accent: '#38bdf8',
          gold: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981',
          purple: '#a855f7'
        }
      }
    },
  },
  plugins: [],
}
