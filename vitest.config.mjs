import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const fromRoot = (relativePath) => {
  return fileURLToPath(new URL(relativePath, import.meta.url));
};

export default defineConfig({
  resolve: {
    alias: {
      '@repo/shared': fromRoot('./packages/shared/src/index.ts'),
      '@repo/utils': fromRoot('./packages/utils/src/index.ts'),
    },
  },
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts'],
  },
});
