/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        postman: { DEFAULT: '#FF6C37', hover: '#E65A2A' },
        apple: {
          bg: '#F5F5F7', text: '#1D1D1F', gray: '#86868B',
          border: '#D2D2D7', darkBg: '#000000', darkCard: '#1C1C1E', darkBorder: '#38383A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: { 'apple': '18px', 'apple-lg': '28px' },
      boxShadow: {
        'apple-light': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'apple-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'postman-glow': '0 0 20px rgba(255, 108, 55, 0.3)',
      },
      backdropBlur: { 'apple': '20px' }
    },
  },
  plugins: [],
}