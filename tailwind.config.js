/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/views/**/*.ejs', './src/js/**/*.js'],
  theme: {
    extend: {
      fontSize: {
        xxs: '0.7rem',
      },
      animation: {
        slideTopBottom: 'slideTopBottom 900ms ease-in-out',
      },
      keyframes: {
        slideTopBottom: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
