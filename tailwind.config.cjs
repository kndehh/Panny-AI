module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panny: {
          green1: '#CBF3BB',
          green2: '#ABE7B2',
          blue: '#93BFC7',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
