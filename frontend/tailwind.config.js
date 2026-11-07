/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Didot', '"Bodoni MT"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      letterSpacing: { label: '0.18em' },
    },
  },
  plugins: [],
};
