const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  {
    ignores: [
      '.next/**',
      'dist/**',
      'node_modules/**',
      '.next',
      'dist',
      'node_modules',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        alert: 'readonly',
        FormData: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        IntersectionObserver: 'readonly',
        PerformanceObserver: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        Image: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      ...(nextPlugin.configs.recommended?.rules || {}),
      ...(nextPlugin.configs['core-web-vitals']?.rules || {}),
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: ['.'],
      },
    },
  },
  {
    files: ['lib/logger.js', 'lib/hooks.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
