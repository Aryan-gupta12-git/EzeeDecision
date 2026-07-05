/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"General Sans"', '"Instrument Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#FAFAFA',
          card: '#FFFFFF',
          text: '#111111',
          muted: '#6E6E73',
          accent: '#0066CC', // Elegant Apple-like Blue
          accentHover: '#0055B3',
          emerald: '#00875A',
          border: '#E5E5E7',
        }
      },
      boxShadow: {
        premium: '0 4px 20px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        input: '0 2px 10px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
