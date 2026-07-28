import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetMockState } from '@app/mocks'
import { MOCK_CSRF_TOKEN } from '@mocks/project'
import { setCsrfToken } from '@shared/api'

import { mockServer } from './mocks/server'

beforeAll(() => {
  setCsrfToken(MOCK_CSRF_TOKEN)
  mockServer.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  mockServer.resetHandlers()
  resetMockState()
})

afterAll(() => mockServer.close())
