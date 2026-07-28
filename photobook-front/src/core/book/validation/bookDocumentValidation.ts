export type BookDocumentValidationIssueCode =
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

export interface BookDocumentValidationIssue {
  readonly code: BookDocumentValidationIssueCode
  readonly path: string
  readonly relatedId?: string
}

export interface BookDocumentValidationResult {
  readonly isValid: boolean
  readonly issues: readonly BookDocumentValidationIssue[]
}
