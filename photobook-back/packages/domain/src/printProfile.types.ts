import type { PhysicalSize } from './bookValidation.types.js'

export type PrintDocumentLayout = 'individual_pages' | 'spreads'
export type PrintProfileProductionStatus = 'approved' | 'mock'

export interface PrintEdgeInsetsMm {
  readonly bottom: number
  readonly left: number
  readonly right: number
  readonly top: number
}

export interface PrintPageGeometry {
  readonly bleedMm: PrintEdgeInsetsMm
  readonly gutterSafeZoneMm: number
  readonly safeZoneMm: PrintEdgeInsetsMm
  readonly trimSizeMm: PhysicalSize
}

export interface PrintCoverGeometry {
  readonly canvasSizeMm: PhysicalSize
  readonly safeZoneMm: PrintEdgeInsetsMm
  readonly spineWidthMm: number
}

export interface PrintSpreadCount {
  readonly max: number
  readonly min: number
  readonly step: number
}

export interface PrintOutputRequirements {
  readonly allowOverprint: boolean
  readonly allowTransparency: boolean
  readonly blackPolicy: string
  readonly colorSpace: string
  readonly documentLayout: PrintDocumentLayout
  readonly embedFonts: boolean
  readonly iccProfileId: string
  readonly minimumEffectiveDpi: number
  readonly pdfStandard: string
}

export interface ManufacturingApproval {
  readonly approvedAt: string
  readonly evidenceId: string
  readonly partnerId: string
  readonly productionOwnerId: string
}

export interface PrintProfileV1 {
  readonly catalogVersionId: string
  readonly cover: PrintCoverGeometry
  readonly manufacturingApproval: ManufacturingApproval | null
  readonly output: PrintOutputRequirements
  readonly page: PrintPageGeometry
  readonly productSpecId: string
  readonly productionStatus: PrintProfileProductionStatus
  readonly profileId: string
  readonly revision: number
  readonly schemaVersion: 1
  readonly spreadCount: PrintSpreadCount
}

export interface ApprovedPrintProfileV1 extends PrintProfileV1 {
  readonly manufacturingApproval: ManufacturingApproval
  readonly productionStatus: 'approved'
}

export type PrintProfileValidationCode =
  | 'approval_invalid'
  | 'geometry_invalid'
  | 'identifier_invalid'
  | 'output_requirement_invalid'
  | 'spread_count_invalid'
  | 'version_invalid'

export interface PrintProfileValidationIssue {
  readonly code: PrintProfileValidationCode
  readonly path: string
}

export interface PrintProfileValidationResult {
  readonly isValid: boolean
  readonly issues: readonly PrintProfileValidationIssue[]
}

export interface PrintProfileSnapshot {
  readonly contentHash: string
  readonly profile: PrintProfileV1
  readonly renderProfileVersion: string
}
