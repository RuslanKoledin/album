import type {
  ApprovedPrintProfileV1,
  ManufacturingApproval,
  PrintEdgeInsetsMm,
  PrintProfileV1,
  PrintProfileValidationIssue,
  PrintProfileValidationResult,
} from './printProfile.types.js'

const UTC_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/

function isNonEmpty(value: string) {
  return value.trim().length > 0
}

function isFiniteNonNegative(value: number) {
  return Number.isFinite(value) && value >= 0
}

function isFinitePositive(value: number) {
  return Number.isFinite(value) && value > 0
}

function addIssue(
  issues: PrintProfileValidationIssue[],
  code: PrintProfileValidationIssue['code'],
  path: string,
) {
  issues.push({ code, path })
}

function validateIdentifiers(
  profile: PrintProfileV1,
  issues: PrintProfileValidationIssue[],
) {
  const identifiers = [
    ['catalogVersionId', profile.catalogVersionId],
    ['productSpecId', profile.productSpecId],
    ['profileId', profile.profileId],
  ] as const
  identifiers.forEach(([field, value]) => {
    if (!isNonEmpty(value)) addIssue(issues, 'identifier_invalid', `/${field}`)
  })
}

function validateInsets(
  insets: PrintEdgeInsetsMm,
  path: string,
  issues: PrintProfileValidationIssue[],
) {
  const entries: readonly (readonly [keyof PrintEdgeInsetsMm, number])[] = [
    ['bottom', insets.bottom],
    ['left', insets.left],
    ['right', insets.right],
    ['top', insets.top],
  ]
  entries.forEach(([edge, value]) => {
    if (!isFiniteNonNegative(value)) {
      addIssue(issues, 'geometry_invalid', `${path}/${edge}`)
    }
  })
}

function validateGeometry(
  profile: PrintProfileV1,
  issues: PrintProfileValidationIssue[],
) {
  const { page, cover } = profile
  if (!isFinitePositive(page.trimSizeMm.width)) {
    addIssue(issues, 'geometry_invalid', '/page/trimSizeMm/width')
  }
  if (!isFinitePositive(page.trimSizeMm.height)) {
    addIssue(issues, 'geometry_invalid', '/page/trimSizeMm/height')
  }
  validateInsets(page.bleedMm, '/page/bleedMm', issues)
  validateInsets(page.safeZoneMm, '/page/safeZoneMm', issues)
  if (
    page.safeZoneMm.left + page.safeZoneMm.right >= page.trimSizeMm.width ||
    page.safeZoneMm.top + page.safeZoneMm.bottom >= page.trimSizeMm.height
  ) {
    addIssue(issues, 'geometry_invalid', '/page/safeZoneMm')
  }
  if (!isFiniteNonNegative(page.gutterSafeZoneMm)) {
    addIssue(issues, 'geometry_invalid', '/page/gutterSafeZoneMm')
  }

  if (!isFinitePositive(cover.canvasSizeMm.width)) {
    addIssue(issues, 'geometry_invalid', '/cover/canvasSizeMm/width')
  }
  if (!isFinitePositive(cover.canvasSizeMm.height)) {
    addIssue(issues, 'geometry_invalid', '/cover/canvasSizeMm/height')
  }
  validateInsets(cover.safeZoneMm, '/cover/safeZoneMm', issues)
  if (
    cover.safeZoneMm.left + cover.safeZoneMm.right >=
      cover.canvasSizeMm.width ||
    cover.safeZoneMm.top + cover.safeZoneMm.bottom >= cover.canvasSizeMm.height
  ) {
    addIssue(issues, 'geometry_invalid', '/cover/safeZoneMm')
  }
  if (
    !isFiniteNonNegative(cover.spineWidthMm) ||
    cover.spineWidthMm >= cover.canvasSizeMm.width
  ) {
    addIssue(issues, 'geometry_invalid', '/cover/spineWidthMm')
  }
}

function validateSpreadCount(
  profile: PrintProfileV1,
  issues: PrintProfileValidationIssue[],
) {
  const { min, max, step } = profile.spreadCount
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    !Number.isInteger(step) ||
    min < 1 ||
    max < min ||
    step < 1 ||
    (max - min) % step !== 0
  ) {
    addIssue(issues, 'spread_count_invalid', '/spreadCount')
  }
}

function validateOutput(
  profile: PrintProfileV1,
  issues: PrintProfileValidationIssue[],
) {
  const requiredStrings = [
    ['blackPolicy', profile.output.blackPolicy],
    ['colorSpace', profile.output.colorSpace],
    ['iccProfileId', profile.output.iccProfileId],
    ['pdfStandard', profile.output.pdfStandard],
  ] as const
  requiredStrings.forEach(([field, value]) => {
    if (!isNonEmpty(value)) {
      addIssue(issues, 'output_requirement_invalid', `/output/${field}`)
    }
  })
  if (
    !Number.isInteger(profile.output.minimumEffectiveDpi) ||
    profile.output.minimumEffectiveDpi < 1
  ) {
    addIssue(
      issues,
      'output_requirement_invalid',
      '/output/minimumEffectiveDpi',
    )
  }
}

function validateApproval(
  profile: PrintProfileV1,
  issues: PrintProfileValidationIssue[],
) {
  if (profile.productionStatus === 'mock') {
    if (profile.manufacturingApproval !== null) {
      addIssue(issues, 'approval_invalid', '/manufacturingApproval')
    }
    return
  }
  const approval = profile.manufacturingApproval
  if (!approval) {
    addIssue(issues, 'approval_invalid', '/manufacturingApproval')
    return
  }
  const identifiers: (keyof Omit<ManufacturingApproval, 'approvedAt'>)[] = [
    'evidenceId',
    'partnerId',
    'productionOwnerId',
  ]
  identifiers.forEach((field) => {
    if (!isNonEmpty(approval[field])) {
      addIssue(issues, 'approval_invalid', `/manufacturingApproval/${field}`)
    }
  })
  if (
    !UTC_DATE_TIME.test(approval.approvedAt) ||
    Number.isNaN(Date.parse(approval.approvedAt))
  ) {
    addIssue(issues, 'approval_invalid', '/manufacturingApproval/approvedAt')
  }
}

export function validatePrintProfile(
  profile: PrintProfileV1,
): PrintProfileValidationResult {
  const issues: PrintProfileValidationIssue[] = []
  if (profile.schemaVersion !== 1) {
    addIssue(issues, 'version_invalid', '/schemaVersion')
  }
  if (!Number.isInteger(profile.revision) || profile.revision < 1) {
    addIssue(issues, 'version_invalid', '/revision')
  }
  validateIdentifiers(profile, issues)
  validateGeometry(profile, issues)
  validateSpreadCount(profile, issues)
  validateOutput(profile, issues)
  validateApproval(profile, issues)

  return { isValid: issues.length === 0, issues }
}

export class InvalidPrintProfileError extends Error {
  readonly issues: readonly PrintProfileValidationIssue[]

  constructor(issues: readonly PrintProfileValidationIssue[]) {
    super('Print profile validation failed')
    this.name = 'InvalidPrintProfileError'
    this.issues = issues
  }
}

export function assertValidPrintProfile(profile: PrintProfileV1) {
  const result = validatePrintProfile(profile)
  if (!result.isValid) throw new InvalidPrintProfileError(result.issues)
}

export function assertApprovedPrintProfile(
  profile: PrintProfileV1,
): asserts profile is ApprovedPrintProfileV1 {
  assertValidPrintProfile(profile)
  if (profile.productionStatus !== 'approved') {
    throw new InvalidPrintProfileError([
      { code: 'approval_invalid', path: '/productionStatus' },
    ])
  }
}
