import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { AnySchema, ValidateFunction } from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

import { openapiExampleContracts } from '@tests/contracts/openapiExampleContracts'

type UnknownRecord = Record<string, unknown>

const HTTP_SCHEMA_PATH = resolve(
  'docs/api/schemas/http-contract-v1.schema.json',
)
const BOOK_DOCUMENT_SCHEMA_PATH = resolve(
  'docs/api/schemas/book-document-v1.schema.json',
)
const HTTP_SCHEMA_ID = pathToFileURL(HTTP_SCHEMA_PATH).href
const BOOK_DOCUMENT_SCHEMA_ID = pathToFileURL(BOOK_DOCUMENT_SCHEMA_PATH).href

const readText = (relativePath: string) =>
  readFileSync(resolve('docs/api', relativePath), 'utf8')

const readJson = (relativePath: string): unknown =>
  JSON.parse(readText(relativePath)) as unknown

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const collectExternalValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectExternalValues)
  }
  if (!isRecord(value)) {
    return []
  }

  return [
    ...(typeof value.externalValue === 'string' ? [value.externalValue] : []),
    ...Object.values(value).flatMap(collectExternalValues),
  ]
}

const getSchemaValidator = (
  ajv: Ajv2020,
  schemaName: string,
): ValidateFunction =>
  ajv.compile({ $ref: `${HTTP_SCHEMA_ID}#/$defs/${schemaName}` })

const createContractAjv = () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const documentSchema = readJson(
    'schemas/book-document-v1.schema.json',
  ) as UnknownRecord
  const httpSchema = readJson(
    'schemas/http-contract-v1.schema.json',
  ) as UnknownRecord

  ajv.addSchema({
    ...documentSchema,
    $id: BOOK_DOCUMENT_SCHEMA_ID,
  } as AnySchema)
  ajv.addSchema({ ...httpSchema, $id: HTTP_SCHEMA_ID } as AnySchema)

  return ajv
}

const openApiDocument = parse(readText('openapi.yaml')) as unknown

const getOpenApiOperation = (path: string, method: string) => {
  if (!isRecord(openApiDocument) || !isRecord(openApiDocument.paths)) {
    throw new Error('OpenAPI paths are unavailable')
  }
  const pathItem = openApiDocument.paths[path]
  if (!isRecord(pathItem) || !isRecord(pathItem[method])) {
    throw new Error(`OpenAPI operation is unavailable: ${method} ${path}`)
  }
  return pathItem[method]
}

describe('OpenAPI frozen contract slices', () => {
  it('uses OpenAPI 3.1 and exposes the agreed contract paths', () => {
    expect(isRecord(openApiDocument)).toBe(true)

    if (!isRecord(openApiDocument)) {
      throw new Error('OpenAPI document is not an object')
    }

    expect(openApiDocument.openapi).toBe('3.1.0')
    expect(openApiDocument.info).toMatchObject({
      title: 'Photobook API',
      version: '0.1.0',
    })
    expect(openApiDocument['x-contract-status']).toBe('FROZEN')
    expect(openApiDocument.servers).toEqual([{ url: '/api/v1' }])
    expect(Object.keys(openApiDocument.paths as UnknownRecord)).toEqual([
      '/auth/challenges',
      '/auth/challenges/{challengeId}/verify',
      '/auth/challenges/{challengeId}/resend',
      '/auth/session',
      '/auth/logout',
      '/catalog/versions/{catalogVersion}',
      '/price-quotes',
      '/projects',
      '/projects/{projectId}',
      '/projects/{projectId}/document',
      '/projects/{projectId}/assets',
      '/projects/{projectId}/upload-batches',
      '/projects/{projectId}/assets/{assetId}/complete',
      '/projects/{projectId}/assets/{assetId}/renew-upload',
      '/projects/{projectId}/preflight-runs',
      '/projects/{projectId}/approvals',
      '/projects/{projectId}/render-jobs',
      '/projects/{projectId}/render-jobs/{renderJobId}',
      '/orders',
      '/orders/{orderId}',
      '/admin/orders/{orderId}',
    ])
    expect(
      getOpenApiOperation('/projects/{projectId}/render-jobs', 'post')[
        'x-contract-status'
      ],
    ).toBe('DRAFT')
    expect(
      getOpenApiOperation(
        '/projects/{projectId}/render-jobs/{renderJobId}',
        'get',
      )['x-contract-status'],
    ).toBe('DRAFT')
  })

  it('links every shared success and error example from OpenAPI', () => {
    const linkedExamples = collectExternalValues(openApiDocument).map((path) =>
      path.replace(/^\.\//, ''),
    )

    expect(new Set(linkedExamples)).toEqual(
      new Set(openapiExampleContracts.map(([path]) => path)),
    )
  })

  it('requires the agreed authorization, CSRF and retry controls', () => {
    const protectedWrites = [
      ['/projects', 'post'],
      ['/projects/{projectId}/document', 'put'],
      ['/projects/{projectId}/upload-batches', 'post'],
      ['/projects/{projectId}/assets/{assetId}/complete', 'post'],
      ['/projects/{projectId}/assets/{assetId}/renew-upload', 'post'],
      ['/projects/{projectId}/approvals', 'post'],
      ['/projects/{projectId}/render-jobs', 'post'],
      ['/orders', 'post'],
    ] as const
    protectedWrites.forEach(([path, method]) => {
      expect(getOpenApiOperation(path, method).security).toEqual([
        { SessionCookie: [] },
      ])
    })

    expect(getOpenApiOperation('/projects', 'post').parameters).toEqual([
      { $ref: '#/components/parameters/CsrfTokenHeader' },
      { $ref: '#/components/parameters/IdempotencyKeyHeader' },
    ])
    expect(
      getOpenApiOperation('/projects/{projectId}/document', 'put').parameters,
    ).toEqual([
      { $ref: '#/components/parameters/ProjectIdPath' },
      { $ref: '#/components/parameters/CsrfTokenHeader' },
    ])
    expect(
      getOpenApiOperation('/projects/{projectId}/upload-batches', 'post')
        .parameters,
    ).toEqual([
      { $ref: '#/components/parameters/ProjectIdPath' },
      { $ref: '#/components/parameters/CsrfTokenHeader' },
      { $ref: '#/components/parameters/IdempotencyKeyHeader' },
    ])
    expect(
      getOpenApiOperation('/projects/{projectId}/approvals', 'post').parameters,
    ).toEqual([
      { $ref: '#/components/parameters/ProjectIdPath' },
      { $ref: '#/components/parameters/CsrfTokenHeader' },
    ])
    expect(
      getOpenApiOperation('/projects/{projectId}/render-jobs', 'post')
        .parameters,
    ).toEqual([
      { $ref: '#/components/parameters/ProjectIdPath' },
      { $ref: '#/components/parameters/CsrfTokenHeader' },
      { $ref: '#/components/parameters/IdempotencyKeyHeader' },
    ])
    expect(getOpenApiOperation('/orders', 'post').parameters).toEqual([
      { $ref: '#/components/parameters/CsrfTokenHeader' },
      { $ref: '#/components/parameters/IdempotencyKeyHeader' },
    ])
  })

  it('documents the complete first-slice recovery surface', () => {
    const responseMatrix = [
      ['/auth/challenges', 'post', ['201', '422', '429', '503']],
      [
        '/auth/challenges/{challengeId}/verify',
        'post',
        ['200', '401', '422', '429'],
      ],
      ['/auth/session', 'get', ['200', '429']],
      ['/auth/logout', 'post', ['204', '401', '403']],
      ['/catalog/versions/{catalogVersion}', 'get', ['200', '404']],
      ['/price-quotes', 'post', ['201', '422']],
      ['/projects', 'post', ['201', '401', '403', '409', '422']],
      ['/projects/{projectId}', 'get', ['200', '401', '404']],
      ['/projects/{projectId}/assets', 'get', ['200', '401', '404']],
      [
        '/projects/{projectId}/document',
        'put',
        ['200', '401', '403', '404', '409', '422'],
      ],
      [
        '/projects/{projectId}/upload-batches',
        'post',
        ['201', '401', '403', '404', '409', '422'],
      ],
      [
        '/projects/{projectId}/assets/{assetId}/complete',
        'post',
        ['200', '401', '403', '404', '409', '422'],
      ],
      [
        '/projects/{projectId}/assets/{assetId}/renew-upload',
        'post',
        ['200', '401', '403', '404', '409'],
      ],
      [
        '/projects/{projectId}/preflight-runs',
        'post',
        ['201', '401', '403', '404', '409', '422'],
      ],
      [
        '/projects/{projectId}/approvals',
        'post',
        ['200', '201', '401', '403', '404', '409', '422'],
      ],
      [
        '/projects/{projectId}/render-jobs',
        'post',
        ['202', '401', '403', '404', '409', '422'],
      ],
      [
        '/projects/{projectId}/render-jobs/{renderJobId}',
        'get',
        ['200', '401', '404'],
      ],
      ['/orders', 'post', ['201', '401', '403', '404', '409', '422']],
      ['/orders/{orderId}', 'get', ['200', '401', '404']],
      ['/admin/orders/{orderId}', 'get', ['200', '401', '403', '404']],
    ] as const

    responseMatrix.forEach(([path, method, responses]) => {
      const operation = getOpenApiOperation(path, method)
      expect(Object.keys(operation.responses as UnknownRecord)).toEqual(
        responses,
      )
    })
  })

  it.each(openapiExampleContracts)(
    'validates %s against %s',
    (path, schema) => {
      const ajv = createContractAjv()
      const validate = getSchemaValidator(ajv, schema)
      const example = readJson(path)

      expect(validate(example), ajv.errorsText(validate.errors)).toBe(true)
    },
  )

  it('rejects undocumented error codes and unsafe detail fields', () => {
    const ajv = createContractAjv()
    const validate = getSchemaValidator(ajv, 'errorEnvelope')

    expect(
      validate({
        error: {
          code: 'INTERNAL_SQL_ERROR',
          message: 'Unsafe error',
          requestId: 'mock-request-unsafe',
          retryable: false,
          fieldErrors: [],
          details: { sql: 'select * from users' },
        },
      }),
    ).toBe(false)
  })

  it('keeps all example identifiers explicitly mock-only', () => {
    const serialized = JSON.stringify(
      openapiExampleContracts.map(([path]) => readJson(path)),
    )
    const ids = serialized.match(/"(?:[^"\\]|\\.)*Id":"([^"]+)"/g) ?? []

    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((match) => match.includes('mock-'))).toBe(true)
  })
})
