export default [
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      ".next",
      "dist",
      "node_modules",
    ],
  },
  {
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "warn",
    },
  },
  {
    files: ["lib/logger.js", "lib/hooks.js"],
    rules: {
      "no-console": "off",
    },
  },
];
