/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9e8',
          100: '#ddf2cc',
          200: '#c8ea9b',
          300: '#aad966',
          400: '#8fc940',
          500: '#6fb31a',
          600: '#589012',
          700: '#446c0e',
          800: '#37560c',
          900: '#2d5016',
        }
      }
    },
  },
  plugins: [],
}
