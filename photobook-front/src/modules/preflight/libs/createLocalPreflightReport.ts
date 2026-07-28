import {
  validateBookDocumentV1,
  type BookConfigurationBundle,
  type BookDocumentV1,
} from '@core/book'

import type {
  LocalPreflightReport,
  ResolvePhotoPixelSize,
} from '@preflight/model'

import { createPhotoResolutionIssues } from './createPhotoResolutionIssues'
import { createValidationPreflightIssue } from './resolvePreflightTarget'

interface CreateLocalPreflightReportInput {
  readonly configuration: BookConfigurationBundle
  readonly document: BookDocumentV1
  readonly minPrintDpi: number
  readonly resolvePhotoPixelSize: ResolvePhotoPixelSize
}

export const createLocalPreflightReport = ({
  configuration,
  document,
  minPrintDpi,
  resolvePhotoPixelSize,
}: CreateLocalPreflightReportInput): LocalPreflightReport => {
  const validationIssues = validateBookDocumentV1(
    document,
    configuration,
  ).issues.map((issue) => createValidationPreflightIssue(document, issue))
  const resolutionIssues = createPhotoResolutionIssues({
    document,
    minPrintDpi,
    resolvePhotoPixelSize,
  })
  const issues = [...validationIssues, ...resolutionIssues]
  const errorCount = issues.filter(
    ({ severity }) => severity === 'error',
  ).length
  const warningCount = issues.length - errorCount

  return {
    errorCount,
    isReady: errorCount === 0,
    issues,
    warningCount,
  }
}
