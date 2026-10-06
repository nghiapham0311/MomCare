/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899',
          600: '#db2777',
        },
        indigo: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
        }
      }
    },
  },
  plugins: [],
}
