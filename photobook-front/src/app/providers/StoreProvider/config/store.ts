import { configureStore } from '@reduxjs/toolkit'

import { editorReducer } from '@modules/editor'
import { baseApi } from '@shared/api'

export const createAppStore = () => {
  const store = configureStore({
    reducer: {
      editor: editorReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    devTools: import.meta.env.DEV,
  })

  return store
}
