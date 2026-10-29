import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        statements: 35,
        branches: 30,
        functions: 30,
        lines: 35,
      },
      exclude: [
        'node_modules/',
        'test/',
        '*.config.js',
      ],
    },
  },
});
