import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createLocalPhotoRegistry,
  getLocalPhotoSignature,
  validateLocalPhotoFiles,
} from './index'

const createFile = (name: string, type: string, size = 4, lastModified = 1) =>
  new File([new Uint8Array(size)], name, { lastModified, type })

describe('local photo selection', () => {
  const createObjectUrl = vi.fn(() => 'blob:local-photo')
  const revokeObjectUrl = vi.fn()

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('accepts JPEG and PNG while preserving input order', () => {
    const jpeg = createFile('family.JPG', 'image/jpeg')
    const png = createFile('cover.png', 'image/png')

    const result = validateLocalPhotoFiles([jpeg, png], new Set())

    expect(result.accepted).toEqual([jpeg, png])
    expect(result.issues).toEqual([])
  })

  it('rejects duplicate, HEIC, empty and oversized files independently', () => {
    const duplicate = createFile('same.jpg', 'image/jpeg')
    const heic = createFile('phone.heic', 'image/heic')
    const empty = createFile('empty.png', 'image/png', 0)
    const oversized = createFile(
      'large.jpg',
      'image/jpeg',
      25 * 1024 * 1024 + 1,
    )

    const result = validateLocalPhotoFiles(
      [duplicate, heic, empty, oversized],
      new Set([getLocalPhotoSignature(duplicate)]),
    )

    expect(result.accepted).toEqual([])
    expect(result.issues.map(({ code }) => code)).toEqual([
      'duplicate',
      'unsupported_type',
      'empty',
      'too_large',
    ])
  })

  it('revokes every object URL when entries are removed or cleared', () => {
    const registry = createLocalPhotoRegistry()
    const first = registry.add(createFile('first.jpg', 'image/jpeg'))
    registry.add(createFile('second.png', 'image/png', 5, 2))

    expect(first).not.toBeNull()
    registry.remove(first?.id ?? '')
    registry.clear()

    expect(createObjectUrl).toHaveBeenCalledTimes(2)
    expect(revokeObjectUrl).toHaveBeenCalledTimes(2)
  })
})
