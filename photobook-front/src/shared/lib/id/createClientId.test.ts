import { afterEach, describe, expect, it, vi } from 'vitest'

import { createClientId } from './createClientId'

describe('createClientId', () => {
  const originalCrypto = globalThis.crypto

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto,
    })
    vi.restoreAllMocks()
  })

  it('uses randomUUID when the current browser exposes it', () => {
    const randomUUID = vi.fn(() => 'uuid-1')
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID },
    })

    expect(createClientId('photo')).toBe('photo-uuid-1')
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  it('falls back to getRandomValues when randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {
        getRandomValues: (bytes: Uint8Array) => {
          bytes.fill(10)
          return bytes
        },
      },
    })

    expect(createClientId('photo')).toBe(
      'photo-0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a',
    )
  })
})
