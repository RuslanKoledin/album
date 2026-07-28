import { createApprovalHandler } from './createApprovalHandler'
import { createPreflightRunHandler } from './createPreflightRunHandler'

export const projectReviewHandlers = [
  createPreflightRunHandler,
  createApprovalHandler,
]
