module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        lexend: ['var(--font-lexend)', 'sans-serif'],
      },
      fontSize: {
        'playfair-24': ['1.5rem', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        'neg-05': '-0.05em',
      },
      colors: {
        whiteCustom: '#F4F3F2',
        background: '#e0e0e0',
        accent: 'rgba(34, 34, 34, 0.6)',
        accentHover: '#D9D9D9',
        blackCustom: '#222222',
        formBG: '#323232',
      },
      gridTemplateRows: {
        8: 'repeat(8, minmax(0, 1fr))',
        10: 'repeat(10, minmax(0, 1fr))',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
