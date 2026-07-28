import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { AnySchema } from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import { applyBookCommand, BOOK_COMMAND_TYPES, type BookCommand } from './index'
import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(resolve(relativePath), 'utf8')) as unknown

const documentSchema = readJson(
  'docs/api/schemas/book-document-v1.schema.json',
) as AnySchema
const commandSchema = readJson(
  'docs/api/schemas/book-command-v1.schema.json',
) as AnySchema
const validCommands = readJson(
  'docs/api/fixtures/book-command/v1/valid/all-command-types.json',
) as readonly BookCommand[]
const domainInvalidCommand = readJson(
  'docs/api/fixtures/book-command/v1/invalid/domain/unknown-cover-option.json',
) as BookCommand

const invalidFixturePaths = [
  'docs/api/fixtures/book-command/v1/invalid/missing-required-property.json',
  'docs/api/fixtures/book-command/v1/invalid/unknown-command.json',
  'docs/api/fixtures/book-command/v1/invalid/unknown-property.json',
] as const

const ajv = new Ajv2020({ allErrors: true, strict: true })
ajv.addSchema(documentSchema)
const validateCommand = ajv.compile<BookCommand>(commandSchema)

describe('BookCommandV1 contract', () => {
  it('contains one valid shared test vector for every command type', () => {
    expect(validCommands.map(({ type }) => type)).toEqual(BOOK_COMMAND_TYPES)

    validCommands.forEach((command) => {
      expect(
        validateCommand(command),
        ajv.errorsText(validateCommand.errors),
      ).toBe(true)
    })
  })

  it.each(invalidFixturePaths)(
    'rejects the shared invalid fixture %s',
    (fixturePath) => {
      expect(validateCommand(readJson(fixturePath))).toBe(false)
    },
  )

  it('shares a schema-valid command that the catalog domain rejects', () => {
    expect(
      validateCommand(domainInvalidCommand),
      ajv.errorsText(validateCommand.errors),
    ).toBe(true)
    expect(
      applyBookCommand(
        createMinimalBookDocumentV1Fixture(),
        domainInvalidCommand,
        createMockBookConfigurationBundle(),
      ),
    ).toMatchObject({
      ok: false,
      error: {
        code: 'document_invalid',
        commandType: 'set_cover_option',
        issues: [{ code: 'product_option_invalid' }],
      },
    })
  })

  it('keeps commands serializable and free from UI or browser state', () => {
    const serialized = JSON.stringify(validCommands)

    expect(JSON.parse(serialized)).toEqual(validCommands)
    expect(serialized).not.toMatch(
      /"(?:uiState|history|price|order|file|blob|objectUrl|localPreviewUrl)"/i,
    )
  })
})
