import type {
  NormalizedPoint,
  NormalizedRect,
  OpaqueId,
  PhysicalRectMm,
  PhysicalSizeMm,
  TextRole,
} from '@core/book/model'

export type TextSizeToken = 'caption' | 'body' | 'title'
export type TextAlign = 'left' | 'center' | 'right'
export type ThemeTextColorToken = 'foreground' | 'accent'

export type ProductionStatus = 'mock' | 'approved'
export type ProductType = 'photo_book'
export type LayoutSurface = 'cover' | 'spread'

export interface SpreadCountRange {
  readonly min: number
  readonly max: number
  readonly default: number
}

export interface ProductOptionSpec {
  readonly id: OpaqueId
  readonly valueIds: readonly OpaqueId[]
}

export interface ProductSpec {
  readonly id: OpaqueId
  readonly productId: OpaqueId
  readonly productType: ProductType
  readonly productionStatus: ProductionStatus
  readonly coverSizeMm: PhysicalSizeMm
  readonly spreadSizeMm: PhysicalSizeMm
  readonly spreadCount: SpreadCountRange
  readonly optionSpecs: readonly ProductOptionSpec[]
  readonly allowedLayoutIds: readonly OpaqueId[]
  readonly allowedThemeIds: readonly OpaqueId[]
  readonly allowedTemplateIds: readonly OpaqueId[]
  readonly allowedTextRoles: readonly TextRole[]
  readonly allowedTextSizeTokens: readonly TextSizeToken[]
}

export interface LayoutPhotoSlotSpec {
  readonly slotKey: OpaqueId
  readonly frameMm: PhysicalRectMm
  readonly required: boolean
  readonly defaultCrop: NormalizedRect
  readonly defaultFocalPoint: NormalizedPoint
}

export interface LayoutTextSlotSpec {
  readonly slotKey: OpaqueId
  readonly frameMm: PhysicalRectMm
  readonly required: boolean
  readonly allowedRoles: readonly TextRole[]
  readonly defaultTextStyleId: OpaqueId
  readonly maxCharacters: number
}

export interface LayoutSpec {
  readonly id: OpaqueId
  readonly productionStatus: ProductionStatus
  readonly surface: LayoutSurface
  readonly supportedProductSpecIds: readonly OpaqueId[]
  readonly sizeMm: PhysicalSizeMm
  readonly photoSlots: readonly LayoutPhotoSlotSpec[]
  readonly textSlots: readonly LayoutTextSlotSpec[]
}

export interface ThemeColorPalette {
  readonly background: string
  readonly foreground: string
  readonly accent: string
}

export interface TextStyleSpec {
  readonly id: OpaqueId
  readonly role: TextRole
  readonly sizeToken: TextSizeToken
  readonly fontFamilyId: OpaqueId
  readonly fontWeight: 400 | 500 | 600
  readonly fontSizePt: number
  readonly lineHeight: number
  readonly textAlign: TextAlign
  readonly colorToken: ThemeTextColorToken
}

export interface ThemeSpec {
  readonly id: OpaqueId
  readonly productionStatus: ProductionStatus
  readonly supportedProductSpecIds: readonly OpaqueId[]
  readonly colors: ThemeColorPalette
  readonly textStyles: readonly TextStyleSpec[]
}

export interface TemplateSpec {
  readonly id: OpaqueId
  readonly productionStatus: ProductionStatus
  readonly supportedProductSpecIds: readonly OpaqueId[]
  readonly themeId: OpaqueId
  readonly categoryTags: readonly string[]
  readonly coverLayoutId: OpaqueId
  readonly initialSpreadLayoutIds: readonly OpaqueId[]
}

export interface BookConfigurationBundle {
  readonly catalogVersion: OpaqueId
  readonly productSpecs: readonly ProductSpec[]
  readonly layoutSpecs: readonly LayoutSpec[]
  readonly themeSpecs: readonly ThemeSpec[]
  readonly templateSpecs: readonly TemplateSpec[]
}
