import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    restoreMocks: true,
    setupFiles: ['./tests/setup-test.ts'],
    unstubGlobals: true,
  },
})
