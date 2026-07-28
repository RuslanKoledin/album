import { baseApi } from '@shared/api'

import type {
  ApprovalDto,
  CreateApprovalArgs,
  CreatePreflightRunArgs,
  PreflightRunDto,
} from '@project-review/model'

const api = baseApi.enhanceEndpoints({
  addTagTypes: ['Project', 'ProjectReview'] as const,
})

export const projectReviewApi = api.injectEndpoints({
  endpoints: (build) => ({
    createPreflightRun: build.mutation<PreflightRunDto, CreatePreflightRunArgs>(
      {
        query: ({ projectId, csrfToken, body }) => ({
          url: `/v1/projects/${encodeURIComponent(projectId)}/preflight-runs`,
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken },
          body,
        }),
      },
    ),
    createApproval: build.mutation<ApprovalDto, CreateApprovalArgs>({
      query: ({ projectId, csrfToken, body }) => ({
        url: `/v1/projects/${encodeURIComponent(projectId)}/approvals`,
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'ProjectReview', id: projectId },
      ],
    }),
  }),
})

export const { useCreateApprovalMutation, useCreatePreflightRunMutation } =
  projectReviewApi
