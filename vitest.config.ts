import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub the `server-only` package — its real implementation throws in
      // any non-react-server environment (including vitest). Shimming with
      // an empty module lets server-only modules be unit-tested directly.
      'server-only': path.resolve(__dirname, 'src/tests/_shims/server-only.ts'),
    },
  },
});
