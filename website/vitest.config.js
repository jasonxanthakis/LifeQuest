import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [
      'node_modules',
      'dist',
      '**/*.skip.test.js',
      '**/inventory.spec.js',
      '**/quest.spec.js',
      '**/shop.spec.js',
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'json'],
      include: ['**/*.{js,jsx,ts,tsx}'],
      exclude: ['node_modules', 'tests/helpers/**'],
      all: true,
    },
  },
});
