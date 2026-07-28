import { expect, it } from 'vitest'

import {
  readMockSessionState,
  writeMockSessionState,
} from './sessionMockStorage'

const STORAGE_KEY = 'photobook:test:mock-state'

it('restores serializable mock state and discards a corrupted snapshot', () => {
  writeMockSessionState(STORAGE_KEY, { ids: ['project-01', 'order-01'] })
  expect(readMockSessionState(STORAGE_KEY)).toEqual({
    ids: ['project-01', 'order-01'],
  })

  window.sessionStorage.setItem(STORAGE_KEY, '{broken')
  expect(readMockSessionState(STORAGE_KEY)).toBeNull()
  expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull()
})
