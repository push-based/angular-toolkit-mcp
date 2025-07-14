import { defineConfig } from 'vite';
import { resolve } from 'path';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { createSharedVitestConfig } from '../../../testing/vitest-setup/src/lib/configuration';

const sharedConfig = createSharedVitestConfig({
  projectRoot: __dirname,
  workspaceRoot: '../../../',
  environment: 'jsdom',
});

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/shared/utils',
  plugins: [],
  resolve: {
    alias: {
      '@push-based/testing-utils': resolve(
        __dirname,
        '../../../testing/utils/src/index.ts',
      ),
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: sharedConfig.test,
}));
