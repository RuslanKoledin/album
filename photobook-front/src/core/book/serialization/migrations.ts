export interface BookDocumentMigration {
  readonly fromVersion: number
  readonly toVersion: number
  migrate(value: unknown): unknown
}

export const BOOK_DOCUMENT_MIGRATIONS =
  [] as const satisfies readonly BookDocumentMigration[]
