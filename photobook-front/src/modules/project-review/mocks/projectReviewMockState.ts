import { createMockBookConfigurationBundle } from '@mocks/book'
import { approveMockProject, getMockProject } from '@mocks/project'
import { readMockSessionState, writeMockSessionState } from '@mocks/storage'
import { getMockPhotoPixelSize, MOCK_MIN_PRINT_DPI } from '@modules/editor'
import { createLocalPreflightReport } from '@modules/preflight'

import {
  isApprovalChecklistComplete,
  type ApprovalDto,
  type CreateApprovalArgs,
  type PreflightIssueDto,
  type PreflightRunDto,
} from '@project-review/model'

let preflightRuns = new Map<string, PreflightRunDto>()
let approvals = new Map<string, ApprovalDto>()

interface ProjectReviewMockSnapshot {
  readonly preflightRuns: [string, PreflightRunDto][]
  readonly approvals: [string, ApprovalDto][]
}

const PROJECT_REVIEW_MOCK_STORAGE_KEY = 'photobook:mock:project-review:v1'

const clone = <T>(value: T): T => structuredClone(value)

const isProjectReviewMockSnapshot = (
  value: unknown,
): value is ProjectReviewMockSnapshot => {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>

  return (
    Array.isArray(snapshot.preflightRuns) && Array.isArray(snapshot.approvals)
  )
}

const persistProjectReviewMockState = () => {
  writeMockSessionState(PROJECT_REVIEW_MOCK_STORAGE_KEY, {
    preflightRuns: [...preflightRuns.entries()],
    approvals: [...approvals.entries()],
  } satisfies ProjectReviewMockSnapshot)
}

const restoreProjectReviewMockState = () => {
  const snapshot = readMockSessionState(PROJECT_REVIEW_MOCK_STORAGE_KEY)
  if (!isProjectReviewMockSnapshot(snapshot)) {
    resetProjectReviewMockState()
    return
  }

  preflightRuns = new Map(snapshot.preflightRuns)
  approvals = new Map(snapshot.approvals)
}

const getMessageKey = (code: string) =>
  `preflight.${code.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())}`

export function resetProjectReviewMockState() {
  preflightRuns = new Map()
  approvals = new Map()
  persistProjectReviewMockState()
}

export function getMockApprovalForRevision(revisionId: string) {
  const approval = approvals.get(revisionId)
  return approval ? clone(approval) : undefined
}

export function getMockPreflightRun(preflightRunId: string) {
  const run = preflightRuns.get(preflightRunId)
  return run ? clone(run) : undefined
}

export function createMockPreflightRun(projectId: string, revisionId: string) {
  const project = getMockProject(projectId)
  if (!project) return { kind: 'not_found' as const }
  if (project.latestRevision.id !== revisionId) {
    return {
      kind: 'revision_conflict' as const,
      latestRevisionId: project.latestRevision.id,
    }
  }

  const report = createLocalPreflightReport({
    configuration: createMockBookConfigurationBundle(),
    document: project.latestRevision.document,
    minPrintDpi: MOCK_MIN_PRINT_DPI,
    resolvePhotoPixelSize: getMockPhotoPixelSize,
  })
  const sequence = preflightRuns.size + 1
  const id = `mock-preflight-${sequence.toString().padStart(2, '0')}`
  const issues: PreflightIssueDto[] = report.issues.map((issue) => ({
    id: `${id}-issue-${issue.id}`,
    code: issue.code.toUpperCase(),
    severity: issue.severity === 'error' ? 'blocking' : 'warning',
    surfaceId: issue.surfaceId,
    elementId: issue.elementId,
    messageKey: getMessageKey(issue.code),
    details:
      issue.effectiveDpi === undefined
        ? {}
        : {
            actualDpi: issue.effectiveDpi,
            requiredDpi: MOCK_MIN_PRINT_DPI,
          },
  }))
  const response: PreflightRunDto = {
    id,
    projectId,
    revisionId,
    status: 'succeeded',
    issues,
    createdAt: '2026-07-22T06:00:00Z',
    completedAt: '2026-07-22T06:00:01Z',
  }

  preflightRuns.set(id, response)
  persistProjectReviewMockState()
  return { kind: 'success' as const, value: clone(response) }
}

export function createMockApproval(
  projectId: string,
  request: CreateApprovalArgs['body'],
) {
  const project = getMockProject(projectId)
  const run = preflightRuns.get(request.preflightRunId)
  if (!project || !run) return { kind: 'not_found' as const }
  if (
    project.latestRevision.id !== request.revisionId ||
    run.projectId !== projectId ||
    run.revisionId !== request.revisionId
  ) {
    return {
      kind: 'revision_conflict' as const,
      latestRevisionId: project.latestRevision.id,
    }
  }

  const warningIds = run.issues
    .filter(({ severity }) => severity === 'warning')
    .map(({ id }) => id)
  const hasBlockingIssue = run.issues.some(
    ({ severity }) => severity === 'blocking',
  )
  const acknowledgedEveryWarning = warningIds.every((id) =>
    request.acknowledgedWarningIds.includes(id),
  )
  if (
    run.status !== 'succeeded' ||
    hasBlockingIssue ||
    !acknowledgedEveryWarning ||
    !isApprovalChecklistComplete(request.checklist)
  ) {
    return { kind: 'validation_failed' as const }
  }

  const existing = approvals.get(request.revisionId)
  if (existing) return { kind: 'existing' as const, value: clone(existing) }

  const response: ApprovalDto = {
    id: `mock-approval-${(approvals.size + 1).toString().padStart(2, '0')}`,
    projectId,
    approvedRevisionId: request.revisionId,
    preflightRunId: request.preflightRunId,
    checklist: request.checklist,
    acknowledgedWarningIds: request.acknowledgedWarningIds,
    approvedAt: '2026-07-22T06:01:00Z',
  }
  if (!approveMockProject(projectId, request.revisionId)) {
    return {
      kind: 'revision_conflict' as const,
      latestRevisionId: project.latestRevision.id,
    }
  }

  approvals.set(request.revisionId, response)
  persistProjectReviewMockState()
  return { kind: 'created' as const, value: clone(response) }
}

restoreProjectReviewMockState()
