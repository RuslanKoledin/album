import {
  LOCAL_PHOTO_MAX_FILES,
  LOCAL_PHOTO_MAX_SIZE_BYTES,
  type LocalPhotoIssue,
  type LocalPhotoValidationResult,
} from '@photo-upload/model'

import {
  getLocalPhotoMediaType,
  getLocalPhotoSignature,
} from './localPhotoIdentity'

export const validateLocalPhotoFiles = (
  files: readonly File[],
  existingSignatures: ReadonlySet<string>,
): LocalPhotoValidationResult => {
  const accepted: File[] = []
  const issues: LocalPhotoIssue[] = []
  const signatures = new Set(existingSignatures)

  files.forEach((file) => {
    const signature = getLocalPhotoSignature(file)
    let code: LocalPhotoIssue['code'] | null = null

    if (signatures.has(signature)) code = 'duplicate'
    else if (existingSignatures.size + accepted.length >= LOCAL_PHOTO_MAX_FILES)
      code = 'limit_exceeded'
    else if (!getLocalPhotoMediaType(file)) code = 'unsupported_type'
    else if (file.size === 0) code = 'empty'
    else if (file.size > LOCAL_PHOTO_MAX_SIZE_BYTES) code = 'too_large'

    if (code) {
      issues.push({ code, fileName: file.name })
      return
    }

    signatures.add(signature)
    accepted.push(file)
  })

  return { accepted, issues }
}
