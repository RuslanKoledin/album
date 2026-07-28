import {
  BOOK_DOCUMENT_SCHEMA_VERSION,
  type BookDocumentV1,
} from '@core/book/model'

import {
  isAssetReference,
  isBookSurface,
  isProductSelection,
  isSpread,
} from './bookDocumentValueGuards'
import { hasExactKeys, isRecord } from './runtimeValueGuards'

export const isBookDocumentV1 = (value: unknown): value is BookDocumentV1 =>
  isRecord(value) &&
  hasExactKeys(value, [
    'schemaVersion',
    'metadata',
    'productSelection',
    'assets',
    'cover',
    'spreads',
  ]) &&
  value.schemaVersion === BOOK_DOCUMENT_SCHEMA_VERSION &&
  isRecord(value.metadata) &&
  hasExactKeys(value.metadata, ['title']) &&
  typeof value.metadata.title === 'string' &&
  isProductSelection(value.productSelection) &&
  Array.isArray(value.assets) &&
  value.assets.every(isAssetReference) &&
  isBookSurface(value.cover) &&
  Array.isArray(value.spreads) &&
  value.spreads.every(isSpread)

export const readSchemaVersion = (value: unknown): unknown =>
  isRecord(value) ? value.schemaVersion : undefined
