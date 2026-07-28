import { describe, expect, it } from 'vitest'

import { readContractArtifactJson } from '@photobook/contracts'

import {
  validateBookDocument,
  type BookConfiguration,
  type BookDocument,
} from './index.js'

const configuration = readContractArtifactJson(
  'fixtures/catalog/v1/valid/mock-book-config-bundle.json',
) as BookConfiguration

describe('authoritative book validation', () => {
  it('accepts the shared valid document fixture', () => {
    const document = readContractArtifactJson(
      'fixtures/book-document/v1/valid/minimal-standard-hardcover.json',
    ) as BookDocument

    expect(validateBookDocument(document, configuration)).toEqual({
      isValid: true,
      issues: [],
    })
  })

  it('rejects the shared domain-invalid crop rectangle', () => {
    const document = readContractArtifactJson(
      'fixtures/book-document/v1/invalid/domain/crop-rectangle-overflow.json',
    ) as BookDocument

    expect(validateBookDocument(document, configuration).issues).toContainEqual(
      {
        code: 'crop_out_of_bounds',
        path: '/spreads/0/photoSlots/0/crop',
      },
    )
  })
})
