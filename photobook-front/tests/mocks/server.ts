import { setupServer } from 'msw/node'

import { handlers } from '@app/mocks'

export const mockServer = setupServer(...handlers)
