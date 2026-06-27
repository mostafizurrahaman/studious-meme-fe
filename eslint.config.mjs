import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      react: {
        version: '19.2',
      },
    },
    rules: {
      'react/display-name': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.opencode/**',
  ]),
]);

export default eslintConfig;

// unused import auto remove command: pnpm eslint --ext .js,.ts,.jsx,.tsx . --fix OR pnpm eslint . --fix
// format all file using prettier: pnpm format
// all package latest install: pnpm add -D @eslint/js@latest eslint@latest globals@latest typescript-eslint@latest
// to check unused packages: npx depcheck OR npx knip OR npx npm-check
