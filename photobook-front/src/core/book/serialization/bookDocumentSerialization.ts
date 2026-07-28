import type { BookConfigurationBundle } from '@core/book/configuration'
import {
  BOOK_DOCUMENT_SCHEMA_VERSION,
  type BookDocumentV1,
} from '@core/book/model'
import {
  validateBookDocumentV1,
  type BookDocumentValidationIssue,
} from '@core/book/validation'
import { isBookDocumentV1, readSchemaVersion } from './isBookDocumentV1'

export type BookDocumentPersistenceError =
  | {
      readonly code:
        'invalid_json' | 'invalid_structure' | 'unsupported_schema_version'
    }
  | {
      readonly code: 'invalid_document'
      readonly issues: readonly BookDocumentValidationIssue[]
    }

export type BookDocumentPersistenceResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: BookDocumentPersistenceError }

export const serializeBookDocumentV1 = (
  document: BookDocumentV1,
  configuration: BookConfigurationBundle,
): BookDocumentPersistenceResult<string> => {
  if (!isBookDocumentV1(document)) {
    return { ok: false, error: { code: 'invalid_structure' } }
  }

  const validation = validateBookDocumentV1(document, configuration)

  if (!validation.isValid) {
    return {
      ok: false,
      error: { code: 'invalid_document', issues: validation.issues },
    }
  }

  return { ok: true, value: JSON.stringify(document) }
}

export const deserializeBookDocumentV1 = (
  serialized: string,
  configuration: BookConfigurationBundle,
): BookDocumentPersistenceResult<BookDocumentV1> => {
  let value: unknown

  try {
    value = JSON.parse(serialized) as unknown
  } catch {
    return { ok: false, error: { code: 'invalid_json' } }
  }

  const schemaVersion = readSchemaVersion(value)

  if (
    schemaVersion !== undefined &&
    schemaVersion !== BOOK_DOCUMENT_SCHEMA_VERSION
  ) {
    return { ok: false, error: { code: 'unsupported_schema_version' } }
  }
  if (!isBookDocumentV1(value)) {
    return { ok: false, error: { code: 'invalid_structure' } }
  }

  const validation = validateBookDocumentV1(value, configuration)

  if (!validation.isValid) {
    return {
      ok: false,
      error: { code: 'invalid_document', issues: validation.issues },
    }
  }

  return { ok: true, value }
}
