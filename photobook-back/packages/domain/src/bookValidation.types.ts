export interface PhysicalSize {
  readonly height: number
  readonly width: number
}

export interface PhysicalRect extends PhysicalSize {
  readonly x: number
  readonly y: number
}

export type NormalizedRect = PhysicalRect

export interface PhotoSlot {
  readonly assetId: string | null
  readonly crop: NormalizedRect
  readonly focalPoint: { readonly x: number; readonly y: number }
  readonly frameMm: PhysicalRect
  readonly id: string
  readonly layoutSlotKey: string
}

export interface TextBlock {
  readonly frameMm: PhysicalRect
  readonly id: string
  readonly layoutSlotKey: string
  readonly role: string
  readonly text: string
  readonly textStyleId: string
}

export interface BookSurface {
  readonly layoutId: string
  readonly photoSlots: readonly PhotoSlot[]
  readonly sizeMm: PhysicalSize
  readonly textBlocks: readonly TextBlock[]
}

export interface BookDocument {
  readonly assets: readonly { readonly assetId: string }[]
  readonly cover: BookSurface
  readonly productSelection: {
    readonly catalogVersion: string
    readonly optionSelections: readonly {
      readonly optionId: string
      readonly valueId: string
    }[]
    readonly productId: string
    readonly productSpecId: string
    readonly templateId: string
    readonly themeId: string
  }
  readonly spreads: readonly (BookSurface & { readonly id: string })[]
}

export interface ProductSpec {
  readonly allowedLayoutIds: readonly string[]
  readonly allowedTemplateIds: readonly string[]
  readonly allowedTextRoles: readonly string[]
  readonly allowedTextSizeTokens: readonly string[]
  readonly allowedThemeIds: readonly string[]
  readonly coverSizeMm: PhysicalSize
  readonly id: string
  readonly optionSpecs: readonly {
    readonly id: string
    readonly valueIds: readonly string[]
  }[]
  readonly productId: string
  readonly spreadCount: { readonly max: number; readonly min: number }
  readonly spreadSizeMm: PhysicalSize
}

export interface LayoutSpec {
  readonly id: string
  readonly photoSlots: readonly {
    readonly frameMm: PhysicalRect
    readonly required: boolean
    readonly slotKey: string
  }[]
  readonly sizeMm: PhysicalSize
  readonly supportedProductSpecIds: readonly string[]
  readonly surface: 'cover' | 'spread'
  readonly textSlots: readonly {
    readonly allowedRoles: readonly string[]
    readonly frameMm: PhysicalRect
    readonly maxCharacters: number
    readonly required: boolean
    readonly slotKey: string
  }[]
}

export interface ThemeSpec {
  readonly id: string
  readonly supportedProductSpecIds: readonly string[]
  readonly textStyles: readonly {
    readonly id: string
    readonly role: string
    readonly sizeToken: string
  }[]
}

export interface TemplateSpec {
  readonly id: string
  readonly supportedProductSpecIds: readonly string[]
  readonly themeId: string
}

export interface BookConfiguration {
  readonly catalogVersion: string
  readonly layoutSpecs: readonly LayoutSpec[]
  readonly productSpecs: readonly ProductSpec[]
  readonly templateSpecs: readonly TemplateSpec[]
  readonly themeSpecs: readonly ThemeSpec[]
}

export type BookValidationIssueCode =
  | 'catalog_version_mismatch'
  | 'crop_out_of_bounds'
  | 'duplicate_id'
  | 'focal_point_out_of_bounds'
  | 'layout_geometry_mismatch'
  | 'layout_incompatible'
  | 'layout_slot_mismatch'
  | 'product_mismatch'
  | 'product_option_invalid'
  | 'required_photo_missing'
  | 'required_text_missing'
  | 'spread_count_out_of_range'
  | 'text_style_invalid'
  | 'text_overflow'
  | 'unknown_asset'
  | 'unknown_layout'
  | 'unknown_product_spec'
  | 'unknown_template'
  | 'unknown_theme'

export interface BookValidationIssue {
  readonly code: BookValidationIssueCode
  readonly path: string
  readonly relatedId?: string
}

export interface BookValidationResult {
  readonly isValid: boolean
  readonly issues: readonly BookValidationIssue[]
}
