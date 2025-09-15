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
        secondary: "#151312",
        accent: "#AB8BFF",
        light: {
          100: "#D6C6FF",
          200: "#A8B5DB",
          300: "#9CA4AB"
        },
        dark: {
          100: "#221f3d",
          200: "#0f0d23",
        },
        error: {
          100: "#ef7373ff",
          200: "#FF3333",
        },
        warning: "#FFA500",
        success: "#00FF00",
        info: "#0000FF",
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'moveLine': 'moveLine 3s linear infinite',
        'progress': 'progress 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)' },
          '66%': { transform: 'translateY(20px) rotate(240deg)' },
        },
        moveLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        progress: {
          '0%': { width: '0%' },
          '50%': { width: '60%' },
          '100%': { width: '100%' },
        }
      }
    },
  },
  plugins: [],
}
