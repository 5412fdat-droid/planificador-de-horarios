/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'uagrm-dark': '#2B3C66',
        'uagrm-light': '#C4D0E8',
        'uagrm-hover': '#A7B8D6',
        'uagrm-text': '#1A2540',
      }
    },
  },
  plugins: [],
}
