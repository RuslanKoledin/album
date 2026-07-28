import { baseApi } from '@shared/api'

import type {
  CreateProjectArgs,
  ProjectDetailDto,
  ProjectListResponseDto,
  SaveProjectDocumentArgs,
  SaveProjectDocumentResponseDto,
} from '@project/model'

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Project'] as const })

export const projectApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<ProjectListResponseDto, void>({
      query: () => '/v1/projects',
      providesTags: (result) => [
        { type: 'Project', id: 'LIST' },
        ...(result?.items.map(({ id }) => ({
          type: 'Project' as const,
          id,
        })) ?? []),
      ],
    }),
    getProject: build.query<ProjectDetailDto, string>({
      query: (projectId) => `/v1/projects/${encodeURIComponent(projectId)}`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Project', id: projectId },
      ],
    }),
    createProject: build.mutation<ProjectDetailDto, CreateProjectArgs>({
      query: ({ body, csrfToken, idempotencyKey }) => ({
        url: '/v1/projects',
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Idempotency-Key': idempotencyKey,
        },
        body,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: 'Project', id: result.project.id }] : [],
    }),
    saveProjectDocument: build.mutation<
      SaveProjectDocumentResponseDto,
      SaveProjectDocumentArgs
    >({
      query: ({ projectId, csrfToken, body }) => ({
        url: `/v1/projects/${encodeURIComponent(projectId)}/document`,
        method: 'PUT',
        headers: { 'X-CSRF-Token': csrfToken },
        body,
      }),
      invalidatesTags: (result, _error, { projectId }) =>
        result ? [{ type: 'Project', id: projectId }] : [],
    }),
  }),
})

export const {
  useCreateProjectMutation,
  useGetProjectQuery,
  useGetProjectsQuery,
  useSaveProjectDocumentMutation,
} = projectApi
