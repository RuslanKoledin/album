import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const excludedLibraries = [
  'axios',
  'antd',
  'i18next',
  'next',
  'zod',
  'zustand',
  '@sentry/react',
  '@tanstack/react-query',
  '@tanstack/react-router',
].map((name) => ({
  name,
  message: `${name} is excluded by the current Photobook architecture.`,
}))

const restrictedImports = (patterns = []) => [
  'error',
  {
    paths: excludedLibraries,
    patterns,
  },
]

export default tseslint.config(
  {
    ignores: [
      'build',
      'node_modules',
      '.react-router',
      'coverage',
      'frontend-agents-master',
      '*.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': restrictedImports(),
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['@app/*', '@pages/*', '@modules/*', '@core/*'],
          message:
            'Shared must stay domain-agnostic and cannot import upper layers.',
        },
      ]),
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: [
            '@app/*',
            '@pages/*',
            '@modules/*',
            '@shared/*',
            'react',
            'react-*',
            'react-router*',
            '@reduxjs/*',
          ],
          message:
            'Core must stay deterministic and independent from UI, state, routing, and networking.',
        },
      ]),
    },
  },
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['@app/*', '@pages/*'],
          message: 'Modules cannot depend on app or page composition layers.',
        },
      ]),
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['@app/*', '@core/*'],
          message:
            'Pages compose modules and shared UI; they cannot depend on app or core directly.',
        },
      ]),
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}', '*.config.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
)
