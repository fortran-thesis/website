// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(15px) rotate(-5deg)' },
        },
        'float-wide': {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '50%': { transform: 'translate(10px, -15px) rotate(3deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-delayed 8s ease-in-out infinite 1s',
        'float-slower': 'float-wide 10s ease-in-out infinite 2s', 
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};