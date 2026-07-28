import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

import { startMocking } from '@app/mocks'

const hydrateApplication = () => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    )
  })
}

void startMocking()
  .catch((error: unknown) => {
    console.error('Failed to start the development API mock worker.', error)
  })
  .finally(hydrateApplication)
