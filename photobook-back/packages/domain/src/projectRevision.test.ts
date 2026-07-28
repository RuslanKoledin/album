import { describe, expect, it } from 'vitest'

import { canonicalizeJson, createJsonHash } from './canonicalJson.js'
import {
  createDocumentHash,
  createRevisionRequestHash,
} from './projectRevision.js'

describe('revision fingerprints', () => {
  it('is stable when JSON object keys have a different order', () => {
    const first = {
      metadata: { title: 'Book', locale: 'ru' },
      schemaVersion: 1,
    }
    const second = {
      schemaVersion: 1,
      metadata: { locale: 'ru', title: 'Book' },
    }

    expect(canonicalizeJson(first)).toBe(canonicalizeJson(second))
    expect(createDocumentHash(first)).toBe(createDocumentHash(second))
  })

  it('binds a mutation fingerprint to its base revision and document', () => {
    const document = { schemaVersion: 1 }
    const original = createRevisionRequestHash({
      baseRevisionId: 'revision-1',
      document,
    })

    expect(
      createRevisionRequestHash({
        baseRevisionId: 'revision-2',
        document,
      }),
    ).not.toBe(original)
    expect(
      createRevisionRequestHash({
        baseRevisionId: 'revision-1',
        document: { schemaVersion: 2 },
      }),
    ).not.toBe(original)
  })

  it('rejects values that cannot be persisted as JSON', () => {
    expect(() => createJsonHash({ value: undefined })).toThrow(TypeError)
    expect(() => createJsonHash(Number.NaN)).toThrow(TypeError)
    expect(() => createJsonHash(new Date())).toThrow(TypeError)
  })
})
