const { text, head } = require("framer-motion/client");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "font-playfair",
    "font-lexend",
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-red-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "text-[24px]",
    "md:text-[36px]",
    "tracking-[-0.05em]",
    "italic",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        lexend: ["var(--font-lexend)", "sans-serif"],
      },
      fontSize: {
        // nom personnalisé pour 24px
        "playfair-24": ["1.5rem", { lineHeight: "1.2" }], // 24px = 1.5rem si base 16px
      },
      letterSpacing: {
        "neg-05": "-0.05em", // -5%
      },
    },
  },
  plugins: [],
};
