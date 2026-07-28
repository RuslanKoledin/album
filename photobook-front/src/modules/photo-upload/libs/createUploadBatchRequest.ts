import type {
  CreateUploadBatchRequestDto,
  LocalPhotoPreview,
} from '@photo-upload/model'

export const createUploadBatchRequest = (
  photos: readonly LocalPhotoPreview[],
): CreateUploadBatchRequestDto => ({
  files: photos.map((photo) => ({
    clientFileId: photo.id,
    fileName: photo.fileName,
    mediaType: photo.mediaType,
    sizeBytes: photo.sizeBytes,
    capturedAt: null,
  })),
})
