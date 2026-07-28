const JPEG_EXTENSION_PATTERN = /\.jpe?g$/i
const PNG_EXTENSION_PATTERN = /\.png$/i

export const getLocalPhotoMediaType = (
  file: Pick<File, 'name' | 'type'>,
): 'image/jpeg' | 'image/png' | null => {
  if (file.type === 'image/jpeg') return 'image/jpeg'
  if (file.type === 'image/png') return 'image/png'
  if (file.type) return null
  if (JPEG_EXTENSION_PATTERN.test(file.name)) return 'image/jpeg'
  if (PNG_EXTENSION_PATTERN.test(file.name)) return 'image/png'
  return null
}

export const getLocalPhotoSignature = (
  file: Pick<File, 'lastModified' | 'name' | 'size' | 'type'>,
) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`
