/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./*.html",
    "./**/*.html"
  ],
  theme: {
     extend: {
      fontFamily: {
        'poiret': ['"Poiret One"', 'cursive'],
        'tourney': ['Tourney', 'cursive'],
      },
  },
  plugins: [],
}}