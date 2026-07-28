import { setupWorker } from 'msw/browser'

import { MOCK_AUTH_CSRF_TOKEN } from '@mocks/auth'
import { setCsrfToken } from '@shared/api'

import { handlers } from './handlers'

setCsrfToken(MOCK_AUTH_CSRF_TOKEN)

export const mockWorker = setupWorker(...handlers)
