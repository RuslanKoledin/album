import { baseApi } from '@shared/api'

import type {
  AssetDto,
  CompleteAssetUploadArgs,
  CreateUploadBatchArgs,
  CreateUploadBatchResponseDto,
  AssetListResponseDto,
  GetProjectAssetsArgs,
  RenewAssetUploadArgs,
  UploadInstructionDto,
} from '@photo-upload/model'

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Asset'] as const })

export const photoUploadApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectAssets: build.query<AssetListResponseDto, GetProjectAssetsArgs>({
      query: ({ projectId }) =>
        `/v1/projects/${encodeURIComponent(projectId)}/assets`,
      providesTags: (result, _error, { projectId }) => [
        { type: 'Asset', id: `LIST:${projectId}` },
        ...(result?.items.map(({ assetId }) => ({
          type: 'Asset' as const,
          id: assetId,
        })) ?? []),
      ],
    }),
    createUploadBatch: build.mutation<
      CreateUploadBatchResponseDto,
      CreateUploadBatchArgs
    >({
      query: ({ projectId, csrfToken, idempotencyKey, body }) => ({
        url: `/v1/projects/${encodeURIComponent(projectId)}/upload-batches`,
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Idempotency-Key': idempotencyKey,
        },
        body,
      }),
    }),
    completeAssetUpload: build.mutation<AssetDto, CompleteAssetUploadArgs>({
      query: ({ projectId, assetId, csrfToken, body }) => ({
        url: `/v1/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}/complete`,
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body,
      }),
      invalidatesTags: (result, _error, { projectId }) =>
        result
          ? [
              { type: 'Asset', id: result.assetId },
              { type: 'Asset', id: `LIST:${projectId}` },
            ]
          : [],
    }),
    renewAssetUpload: build.mutation<
      UploadInstructionDto,
      RenewAssetUploadArgs
    >({
      query: ({ projectId, assetId, csrfToken }) => ({
        url: `/v1/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}/renew-upload`,
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      }),
    }),
  }),
})

export const {
  useCompleteAssetUploadMutation,
  useCreateUploadBatchMutation,
  useGetProjectAssetsQuery,
  useRenewAssetUploadMutation,
} = photoUploadApi
