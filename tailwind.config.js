const { text, head } = require("framer-motion/client");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        text: ["'Playfair Display', serif"],
        heading: ["'Lexend Semibold', sans-serif"],
        nameproject: ["'Playfair Display', serif"],
      },
      letterspacing: {
        text: ".1em",
      },
      colors: {
        black: "#0A0A0A",
        white: "#F4F3F2",
        accent: "#C8C7C6",
        accentHover: "#D9D9D9",
        backgroundWhite: "#F4F3F2",
        backgroundBlack: "#222222",
      },
    },
  },
  plugins: [],
};
