/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],

  theme: {
    extend: {

      colors: {

        primary: '#f59e0b',

        secondary: '#1f8f78',

        accent: '#4fb59f',

        dark: '#2f2f2f',

        light: '#f8f8f8'
      }
    }
  },

  plugins: []
}
