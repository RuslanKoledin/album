import { readFileSync } from 'node:fs'

import {
  Ajv2020,
  type AnySchemaObject,
  type ErrorObject,
  type ValidateFunction,
} from 'ajv/dist/2020.js'
import { fullFormats } from 'ajv-formats/dist/formats.js'

import { CONTRACT_ARTIFACTS_DIRECTORY } from './contractManifest.js'

const BOOK_COMMAND_SCHEMA = 'schemas/book-command-v1.schema.json'
const BOOK_DOCUMENT_SCHEMA = 'schemas/book-document-v1.schema.json'
const HTTP_SCHEMA = 'schemas/http-contract-v1.schema.json'
const BOOK_DOCUMENT_SCHEMA_URL = new URL(
  BOOK_DOCUMENT_SCHEMA,
  CONTRACT_ARTIFACTS_DIRECTORY,
).href
const HTTP_SCHEMA_URL = new URL(HTTP_SCHEMA, CONTRACT_ARTIFACTS_DIRECTORY).href
const REQUIRED_FORMATS = ['date', 'date-time', 'email', 'uri'] as const

export interface ContractValidationIssue {
  readonly instancePath: string
  readonly keyword: string
  readonly message: string
}

export type ContractValidationResult =
  | { readonly ok: true }
  | {
      readonly issues: readonly ContractValidationIssue[]
      readonly ok: false
    }

export function readContractArtifactJson(relativePath: string): unknown {
  const fileUrl = new URL(relativePath, CONTRACT_ARTIFACTS_DIRECTORY)
  return JSON.parse(readFileSync(fileUrl, 'utf8')) as unknown
}

function readSchema(relativePath: string) {
  return readContractArtifactJson(relativePath) as AnySchemaObject
}

function mapIssues(
  errors: readonly ErrorObject[] | null | undefined,
): readonly ContractValidationIssue[] {
  return (errors ?? []).map(({ instancePath, keyword, message }) => ({
    instancePath,
    keyword,
    message: message ?? 'Contract validation failed',
  }))
}

export class ContractValidator {
  private readonly ajv: Ajv2020
  private readonly bookCommand: ValidateFunction<unknown>
  private readonly bookDocument: ValidateFunction<unknown>
  private readonly httpValidators = new Map<string, ValidateFunction<unknown>>()

  constructor() {
    this.ajv = new Ajv2020({ allErrors: true, strict: true })
    REQUIRED_FORMATS.forEach((formatName) => {
      this.ajv.addFormat(formatName, fullFormats[formatName])
    })
    const documentSchema = readSchema(BOOK_DOCUMENT_SCHEMA)
    this.ajv.addSchema(documentSchema)
    this.ajv.addSchema({
      ...documentSchema,
      $id: BOOK_DOCUMENT_SCHEMA_URL,
    })
    this.ajv.addSchema(readSchema(BOOK_COMMAND_SCHEMA))
    this.ajv.addSchema({
      ...readSchema(HTTP_SCHEMA),
      $id: HTTP_SCHEMA_URL,
    })
    this.bookDocument = this.requireSchema(
      'urn:photobook:schema:book-document:v1',
    )
    this.bookCommand = this.requireSchema(
      'urn:photobook:schema:book-command:v1',
    )
  }

  validateBookCommand(value: unknown) {
    return this.validate(this.bookCommand, value)
  }

  validateBookDocument(value: unknown) {
    return this.validate(this.bookDocument, value)
  }

  validateHttp(schemaName: string, value: unknown) {
    const validator =
      this.httpValidators.get(schemaName) ??
      this.createHttpValidator(schemaName)

    return this.validate(validator, value)
  }

  private createHttpValidator(schemaName: string) {
    const validator = this.ajv.compile<unknown>({
      $ref: `${HTTP_SCHEMA_URL}#/$defs/${schemaName}`,
    })
    this.httpValidators.set(schemaName, validator)
    return validator
  }

  private requireSchema(schemaId: string) {
    const validator = this.ajv.getSchema<unknown>(schemaId)
    if (!validator)
      throw new Error(`Contract schema is unavailable: ${schemaId}`)
    return validator
  }

  private validate(
    validator: ValidateFunction<unknown>,
    value: unknown,
  ): ContractValidationResult {
    if (validator(value)) return { ok: true }

    return {
      issues: mapIssues(validator.errors),
      ok: false,
    }
  }
}
