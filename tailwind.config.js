module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["'Playfair Display'", "serif"],
        lexend: ["'Lexend'", "sans-serif"],
      },
      fontSize: {
        "playfair-24": ["1.5rem", { lineHeight: "1.2" }],
      },
      letterSpacing: {
        "neg-05": "-0.05em",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
