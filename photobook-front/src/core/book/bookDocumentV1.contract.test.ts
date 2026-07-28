import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { AnySchema } from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import type { BookDocumentV1 } from './index'
import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(resolve(relativePath), 'utf8')) as unknown

const schema = readJson(
  'docs/api/schemas/book-document-v1.schema.json',
) as AnySchema
const validFixture = readJson(
  'docs/api/fixtures/book-document/v1/valid/minimal-standard-hardcover.json',
)

const invalidFixturePaths = [
  'docs/api/fixtures/book-document/v1/invalid/crop-out-of-range.json',
  'docs/api/fixtures/book-document/v1/invalid/unsupported-schema-version.json',
  'docs/api/fixtures/book-document/v1/invalid/unknown-property.json',
] as const

const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateDocument = ajv.compile<BookDocumentV1>(schema)

describe('BookDocumentV1 contract', () => {
  it('creates a deterministic minimal document through the public core API', () => {
    const first = createMinimalBookDocumentV1Fixture()
    const second = createMinimalBookDocumentV1Fixture()

    expect(first).toEqual(validFixture)
    expect(second).toEqual(first)
    expect(second).not.toBe(first)
    expect(first.schemaVersion).toBe(1)
  })

  it('keeps physical geometry in millimetres and crop values normalized', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const firstSpread = document.spreads[0]
    const firstSlot = firstSpread?.photoSlots[0]

    expect(document.cover.sizeMm).toEqual({ width: 200, height: 200 })
    expect(firstSpread?.sizeMm).toEqual({ width: 400, height: 200 })
    expect(firstSlot?.frameMm).toEqual({
      x: 0,
      y: 0,
      width: 400,
      height: 200,
    })
    expect(firstSlot?.crop).toEqual({ x: 0, y: 0, width: 1, height: 1 })
    expect(firstSlot?.focalPoint).toEqual({ x: 0.5, y: 0.5 })
  })

  it('round-trips as plain JSON without editor, commerce or browser state', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const serialized = JSON.stringify(document)
    const restored = JSON.parse(serialized) as BookDocumentV1

    expect(restored).toEqual(document)
    expect(serialized).not.toMatch(
      /"(?:uiState|price|order|file|blob|localPreviewUrl)"/i,
    )
  })

  it('validates the shared valid fixture against the JSON Schema', () => {
    expect(
      validateDocument(validFixture),
      ajv.errorsText(validateDocument.errors),
    ).toBe(true)
  })

  it.each(invalidFixturePaths)(
    'rejects the shared invalid fixture %s',
    (fixturePath) => {
      expect(validateDocument(readJson(fixturePath))).toBe(false)
    },
  )
})
