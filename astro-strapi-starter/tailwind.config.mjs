/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  safelist: [
    'hover:bg-brand-primary-bright',
    'bg-brand-primary-bright',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#013564',
          'primary-bright': '#026FCF', // 👈 kebab-case
        },
        background: {
          primary: '#f4f7f6',
        },
      },
    },
  }, 
  plugins: [],
};
