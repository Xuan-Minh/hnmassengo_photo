module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a202c", // Exemple : bleu foncé
        secondary: "#fbbf24", // Exemple : jaune
        accent: "#e53e3e", // Exemple : rouge
        background: "#f7fafc", // Exemple : gris clair
      },
    },
  },
  plugins: [],
};
