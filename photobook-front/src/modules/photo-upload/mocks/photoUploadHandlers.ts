import { completeUploadHandler } from './completeUploadHandler'
import { createUploadBatchHandler } from './createUploadBatchHandler'
import { getProjectAssetsHandler } from './getProjectAssetsHandler'
import { getThumbnailHandler } from './getThumbnailHandler'
import { putUploadObjectHandler } from './putUploadObjectHandler'
import { renewUploadHandler } from './renewUploadHandler'

export const photoUploadHandlers = [
  getProjectAssetsHandler,
  createUploadBatchHandler,
  putUploadObjectHandler,
  completeUploadHandler,
  renewUploadHandler,
  getThumbnailHandler,
]
