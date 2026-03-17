import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = [
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
    },
  },
];

export default config;

