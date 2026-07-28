import type { TextRole } from './text'

export const BOOK_DOCUMENT_SCHEMA_VERSION = 1 as const

export type BookDocumentSchemaVersion = typeof BOOK_DOCUMENT_SCHEMA_VERSION

export type OpaqueId = string

export interface PhysicalSizeMm {
  readonly width: number
  readonly height: number
}

export interface PhysicalRectMm extends PhysicalSizeMm {
  readonly x: number
  readonly y: number
}

export interface NormalizedPoint {
  readonly x: number
  readonly y: number
}

export interface NormalizedRect extends NormalizedPoint {
  readonly width: number
  readonly height: number
}

export interface BookMetadata {
  readonly title: string
}

export interface ProductOptionSelection {
  readonly optionId: OpaqueId
  readonly valueId: OpaqueId
}

export interface ProductSelection {
  readonly productId: OpaqueId
  readonly productSpecId: OpaqueId
  readonly catalogVersion: OpaqueId
  readonly templateId: OpaqueId
  readonly themeId: OpaqueId
  readonly optionSelections: readonly ProductOptionSelection[]
}

export interface AssetReference {
  readonly assetId: OpaqueId
}

export interface PhotoSlot {
  readonly id: OpaqueId
  readonly layoutSlotKey: OpaqueId
  readonly frameMm: PhysicalRectMm
  readonly assetId: OpaqueId | null
  readonly crop: NormalizedRect
  readonly focalPoint: NormalizedPoint
}

export interface TextBlock {
  readonly id: OpaqueId
  readonly layoutSlotKey: OpaqueId
  readonly frameMm: PhysicalRectMm
  readonly role: TextRole
  readonly textStyleId: OpaqueId
  readonly text: string
}

export interface BookSurface {
  readonly layoutId: OpaqueId
  readonly sizeMm: PhysicalSizeMm
  readonly photoSlots: readonly PhotoSlot[]
  readonly textBlocks: readonly TextBlock[]
}

export type Cover = BookSurface

export interface Spread extends BookSurface {
  readonly id: OpaqueId
}

export interface BookDocumentV1 {
  readonly schemaVersion: BookDocumentSchemaVersion
  readonly metadata: BookMetadata
  readonly productSelection: ProductSelection
  readonly assets: readonly AssetReference[]
  readonly cover: Cover
  readonly spreads: readonly Spread[]
}
