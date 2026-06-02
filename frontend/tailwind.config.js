/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C5CE7', light: '#A29BFE', dark: '#5A4BD1' },
        accent: { orange: '#FD9644', pink: '#FF6B9D', green: '#00B894' },
        surface: { DEFAULT: '#FFFFFF', card: '#F8F7FF', dark: '#2D3436' },
      },
      fontFamily: {
        display: ['"Pretendard Variable"', 'Pretendard', 'sans-serif'],
        body: ['"Pretendard Variable"', 'Pretendard', 'sans-serif'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
    },
  },
  plugins: [],
};
