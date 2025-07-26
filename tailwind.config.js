/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        secondary:"#151312",
        accent:"#AB8BFF",
        light:{
          100:"#D6C6FF",
          200:"#A8B5DB",
          300:"#9CA4AB"
        },
        dark:{
          100:"#221f3d",
          200:"#0f0d23",
        },
        error: {
          100: "#ef7373ff",
          200: "#FF3333",
        },
        warning: "#FFA500",
        success: "#00FF00",
        info: "#0000FF",
      },
    },
  },
  plugins: [],
}
