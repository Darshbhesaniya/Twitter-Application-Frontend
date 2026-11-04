/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1D9BF0',
          hover: '#1A8CD8',
          dark: '#0F1419',
          light: '#FFFFFF',
          border: '#EFF3F4',
          darkBorder: '#2F3336',
          grayBg: '#F7F9F9',
          dim: '#536471',
          danger: '#F4212E',
          success: '#00BA7C',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

