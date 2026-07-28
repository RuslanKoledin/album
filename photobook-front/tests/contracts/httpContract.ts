import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { AnySchema, ValidateFunction } from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const HTTP_SCHEMA_PATH = resolve(
  'docs/api/schemas/http-contract-v1.schema.json',
)
const BOOK_DOCUMENT_SCHEMA_PATH = resolve(
  'docs/api/schemas/book-document-v1.schema.json',
)
const HTTP_SCHEMA_ID = pathToFileURL(HTTP_SCHEMA_PATH).href
const BOOK_DOCUMENT_SCHEMA_ID = pathToFileURL(BOOK_DOCUMENT_SCHEMA_PATH).href

type UnknownRecord = Record<string, unknown>

const readSchema = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as UnknownRecord

const createAjv = () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  ajv.addSchema({
    ...readSchema(BOOK_DOCUMENT_SCHEMA_PATH),
    $id: BOOK_DOCUMENT_SCHEMA_ID,
  } as AnySchema)
  ajv.addSchema({
    ...readSchema(HTTP_SCHEMA_PATH),
    $id: HTTP_SCHEMA_ID,
  } as AnySchema)
  return ajv
}

export function createHttpContractValidator(
  schemaName: string,
): ValidateFunction {
  return createAjv().compile({
    $ref: `${HTTP_SCHEMA_ID}#/$defs/${schemaName}`,
  })
}
