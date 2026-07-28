import { readdirSync, readFileSync } from 'node:fs'

import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

import { CONTRACT_ARTIFACTS_DIRECTORY } from './contractManifest.js'
import { ContractValidator } from './contractValidator.js'

type UnknownRecord = Record<string, unknown>

interface ExampleContract {
  readonly path: string
  readonly schemaName: string
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readArtifactJson(relativePath: string): unknown {
  const fileUrl = new URL(relativePath, CONTRACT_ARTIFACTS_DIRECTORY)
  return JSON.parse(readFileSync(fileUrl, 'utf8')) as unknown
}

function readOpenApi(): unknown {
  const fileUrl = new URL('openapi.yaml', CONTRACT_ARTIFACTS_DIRECTORY)
  return parse(readFileSync(fileUrl, 'utf8')) as unknown
}

function readComponentSchemaName(
  document: UnknownRecord,
  schemaReference: string,
) {
  const componentName = schemaReference.split('/').at(-1)
  const components = document.components
  if (
    !componentName ||
    !isRecord(components) ||
    !isRecord(components.schemas)
  ) {
    throw new Error(`Invalid OpenAPI schema reference: ${schemaReference}`)
  }

  const component = components.schemas[componentName]
  if (!isRecord(component) || typeof component.$ref !== 'string') {
    throw new Error(
      `OpenAPI component has no external schema: ${componentName}`,
    )
  }

  const schemaName = component.$ref.split('#/$defs/').at(1)
  if (!schemaName) throw new Error(`Unsupported schema: ${component.$ref}`)

  return schemaName
}

function collectContentExamples(
  document: UnknownRecord,
  content: unknown,
): ExampleContract[] {
  if (!isRecord(content)) return []

  return Object.values(content).flatMap((mediaType) => {
    if (
      !isRecord(mediaType) ||
      !isRecord(mediaType.schema) ||
      typeof mediaType.schema.$ref !== 'string' ||
      !isRecord(mediaType.examples)
    ) {
      return []
    }
    const schemaName = readComponentSchemaName(document, mediaType.schema.$ref)

    return Object.values(mediaType.examples).flatMap((example) =>
      isRecord(example) && typeof example.externalValue === 'string'
        ? [
            {
              path: example.externalValue.replace(/^\.\//, ''),
              schemaName,
            },
          ]
        : [],
    )
  })
}

function collectOperationExamples(
  document: UnknownRecord,
  operation: UnknownRecord,
) {
  const requestBody = operation.requestBody
  const requestExamples = isRecord(requestBody)
    ? collectContentExamples(document, requestBody.content)
    : []
  const responses = operation.responses
  const responseExamples = !isRecord(responses)
    ? []
    : Object.values(responses).flatMap((response) =>
        isRecord(response)
          ? collectContentExamples(document, response.content)
          : [],
      )

  return [...requestExamples, ...responseExamples]
}

function collectOpenApiExampleContracts(document: unknown) {
  if (!isRecord(document) || !isRecord(document.paths)) {
    throw new Error('OpenAPI paths are unavailable')
  }
  const contracts = Object.values(document.paths).flatMap((pathItem) =>
    isRecord(pathItem)
      ? Object.values(pathItem).flatMap((operation) =>
          isRecord(operation)
            ? collectOperationExamples(document, operation)
            : [],
        )
      : [],
  )

  return [
    ...new Map(
      contracts.map((contract) => [
        `${contract.path}:${contract.schemaName}`,
        contract,
      ]),
    ).values(),
  ]
}

function listJsonArtifacts(relativeDirectory: string) {
  const directoryUrl = new URL(relativeDirectory, CONTRACT_ARTIFACTS_DIRECTORY)

  return readdirSync(directoryUrl, {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => {
      const parentPath = entry.parentPath
        .replace(new URL('.', directoryUrl).pathname, '')
        .replace(/^\//, '')
      return `${relativeDirectory}${parentPath}${parentPath ? '/' : ''}${entry.name}`
    })
    .sort()
}

const STRUCTURALLY_INVALID_DOCUMENTS = [
  'fixtures/book-document/v1/invalid/crop-out-of-range.json',
  'fixtures/book-document/v1/invalid/unknown-property.json',
  'fixtures/book-document/v1/invalid/unsupported-schema-version.json',
] as const

const STRUCTURALLY_INVALID_COMMANDS = [
  'fixtures/book-command/v1/invalid/missing-required-property.json',
  'fixtures/book-command/v1/invalid/unknown-command.json',
  'fixtures/book-command/v1/invalid/unknown-property.json',
] as const

const validator = new ContractValidator()
const openApi = readOpenApi()
const exampleContracts = collectOpenApiExampleContracts(openApi)

describe('synchronized contract artifacts', () => {
  it('uses the frozen OpenAPI 3.1 namespace', () => {
    expect(isRecord(openApi)).toBe(true)
    if (!isRecord(openApi)) return

    expect(openApi.openapi).toBe('3.1.0')
    expect(openApi['x-contract-status']).toBe('FROZEN')
    expect(openApi.servers).toEqual([{ url: '/api/v1' }])
  })

  it('links and validates every HTTP example', () => {
    const linkedExamplePaths = exampleContracts
      .map(({ path }) => path)
      .filter((path) => path.startsWith('examples/'))
      .sort()

    expect(linkedExamplePaths).toEqual(
      listJsonArtifacts('examples/').filter(
        (path) => !path.startsWith('examples/analytics/'),
      ),
    )

    exampleContracts.forEach(({ path, schemaName }) => {
      const result = validator.validateHttp(schemaName, readArtifactJson(path))
      expect(result, `${path} -> ${schemaName}`).toEqual({ ok: true })
    })
  })

  it('accepts the valid document and rejects structural invalid vectors', () => {
    expect(
      validator.validateBookDocument(
        readArtifactJson(
          'fixtures/book-document/v1/valid/minimal-standard-hardcover.json',
        ),
      ),
    ).toEqual({ ok: true })

    STRUCTURALLY_INVALID_DOCUMENTS.forEach((path) => {
      expect(validator.validateBookDocument(readArtifactJson(path)).ok).toBe(
        false,
      )
    })
  })

  it('accepts every valid command and rejects structural invalid vectors', () => {
    const commands = readArtifactJson(
      'fixtures/book-command/v1/valid/all-command-types.json',
    )
    expect(Array.isArray(commands)).toBe(true)
    if (!Array.isArray(commands)) return

    commands.forEach((command) => {
      expect(validator.validateBookCommand(command)).toEqual({ ok: true })
    })

    STRUCTURALLY_INVALID_COMMANDS.forEach((path) => {
      expect(validator.validateBookCommand(readArtifactJson(path)).ok).toBe(
        false,
      )
    })
  })

  it('keeps domain-invalid vectors schema-valid for domain validation', () => {
    expect(
      validator.validateBookDocument(
        readArtifactJson(
          'fixtures/book-document/v1/invalid/domain/crop-rectangle-overflow.json',
        ),
      ),
    ).toEqual({ ok: true })
    expect(
      validator.validateBookCommand(
        readArtifactJson(
          'fixtures/book-command/v1/invalid/domain/unknown-cover-option.json',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('rejects unknown fields and undocumented error codes', () => {
    expect(
      validator.validateHttp('createProjectRequest', {
        catalogVersion: 'mock-catalog-v1',
        productId: 'mock-product',
        templateId: 'mock-template',
        title: 'Test',
        unknown: true,
      }).ok,
    ).toBe(false)
    expect(
      validator.validateHttp('errorEnvelope', {
        error: {
          code: 'INTERNAL_SQL_ERROR',
          fieldErrors: [],
          message: 'Unsafe',
          requestId: 'mock-request',
          retryable: false,
        },
      }).ok,
    ).toBe(false)
  })
})
