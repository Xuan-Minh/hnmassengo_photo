const { form } = require("framer-motion/client");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        lexend: ["var(--font-lexend)", "sans-serif"],
      },
      fontSize: {
        "playfair-24": ["1.5rem", { lineHeight: "1.2" }],
      },
      letterSpacing: {
        "neg-05": "-0.05em",
      },
      colors: {
        whiteCustom: "#F4F3F2",
        background: "#F4F3F2",
        accent: "#C8C7C6",
        accentHover: "#D9D9D9",
        blackCustom: "#222222",
        formBG: "#323232",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
