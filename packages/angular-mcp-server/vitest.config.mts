import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/angular-mcp-server/unit',
  root: __dirname,
  test: {
    include: ['src/**/*.spec.[jt]s?(x)'],
    environment: 'node',
    watch: false,
    globals: true,
    passWithNoTests: true,
    testTimeout: 25_000,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/angular-mcp-server/unit',
      exclude: ['**/mocks/**', '**/types.ts', '**/__snapshots__/**'],
    },

    reporters: ['default'],
  },
});
