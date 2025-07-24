// tailwind.config.js
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mbts: {
          blue: '#1D3557',       // Navy Blue
          blueHover: '#457B9D',  // Lighter Blue for hover
          orange: '#f85924',     // Main Orange
          orangeHover: '#d13602',// Darker Orange for hover
          light: '#F1FAEE',
          lightmore: '#051a38',
          gray: '#A8A8A8',
          dark: '#2C2C2C',
        },
      },
    },
  },
  plugins: [],
};
