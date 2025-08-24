import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'node_modules',
      'dist',
      '**/*.skip.test.js',
      '**/inventory.test.js',
      '**/quest.test.js',
      '**/shop.test.js',
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'json'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['node_modules', 'tests/helpers/**'],
      all: true,
    },
  },
});
