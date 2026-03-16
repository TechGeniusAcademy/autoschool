/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#fff1f1',
          '100': '#ffe1e1',
          '200': '#ffc7c7',
          '300': '#ffa0a0',
          '400': '#ff7a7a',
          '500': '#ff5252',
          '600': '#ff3636',
          '700': '#ee1f1f',
          '800': '#d41b1b',
          '900': '#c41c1c',
          '950': '#6b0909',
        },
        secondary: {
          '50': '#f6f7f9',
          '100': '#eceef2',
          '200': '#d6dae2',
          '300': '#b3bac9',
          '400': '#8995ac',
          '500': '#6a7792',
          '600': '#536079',
          '700': '#444e63',
          '800': '#3a4152',
          '900': '#343947',
          '950': '#22252e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
} 