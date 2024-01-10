const {colors} = require('./src/theme/tokens/colors');

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    colors,
    extend: {},
  },
  plugins: [],
}

export default config;