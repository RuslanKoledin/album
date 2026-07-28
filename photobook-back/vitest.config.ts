import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@photobook/config': `${root}packages/config/src/index.ts`,
      '@photobook/contracts': `${root}packages/contracts/src/index.ts`,
      '@photobook/database': `${root}packages/database/src/index.ts`,
      '@photobook/domain': `${root}packages/domain/src/index.ts`,
      '@api': `${root}apps/api/src`,
    },
  },
  test: {
    coverage: {
      reporter: ['text', 'html'],
    },
    environment: 'node',
    include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
  },
})
