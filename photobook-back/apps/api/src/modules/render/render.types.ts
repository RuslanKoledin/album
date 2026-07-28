export interface CreateRenderJobRequest {
  readonly approvalId: string
  readonly retryOfRenderJobId: string | null
  readonly type: 'print_pdf'
}
