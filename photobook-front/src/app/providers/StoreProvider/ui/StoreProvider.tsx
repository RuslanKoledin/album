import { setupListeners } from '@reduxjs/toolkit/query'

import { type ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'

import { createAppStore } from '@app/providers/StoreProvider/config'

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(createAppStore)

  useEffect(() => setupListeners(store.dispatch), [store])

  return <Provider store={store}>{children}</Provider>
}
