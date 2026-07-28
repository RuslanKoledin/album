export type PreflightRunStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export type PreflightIssueSeverity = 'info' | 'warning' | 'blocking'

export interface PreflightIssueDetailsDto {
  readonly actualDpi?: number
  readonly requiredDpi?: number
}

export interface PreflightIssueDto {
  readonly id: string
  readonly code: string
  readonly severity: PreflightIssueSeverity
  readonly surfaceId: string | null
  readonly elementId: string | null
  readonly messageKey: string
  readonly details: PreflightIssueDetailsDto
}

export interface PreflightRunDto {
  readonly id: string
  readonly projectId: string
  readonly revisionId: string
  readonly status: PreflightRunStatus
  readonly issues: readonly PreflightIssueDto[]
  readonly createdAt: string
  readonly completedAt: string | null
}

export interface ApprovalChecklistDto {
  readonly namesChecked: boolean
  readonly datesChecked: boolean
  readonly captionsChecked: boolean
  readonly pageOrderChecked: boolean
  readonly cropUnderstood: boolean
  readonly readyForPrint: boolean
}

export type ApprovalChecklistKey = keyof ApprovalChecklistDto

export interface ApprovalDto {
  readonly id: string
  readonly projectId: string
  readonly approvedRevisionId: string
  readonly preflightRunId: string
  readonly checklist: ApprovalChecklistDto
  readonly acknowledgedWarningIds: readonly string[]
  readonly approvedAt: string
}

export interface CreatePreflightRunArgs {
  readonly projectId: string
  readonly csrfToken: string
  readonly body: { readonly revisionId: string }
}

export interface CreateApprovalArgs {
  readonly projectId: string
  readonly csrfToken: string
  readonly body: {
    readonly revisionId: string
    readonly preflightRunId: string
    readonly checklist: ApprovalChecklistDto
    readonly acknowledgedWarningIds: readonly string[]
  }
}
