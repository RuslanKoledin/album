export interface ImageDimensions {
  readonly height: number
  readonly width: number
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
])

function readUint16(bytes: Uint8Array, offset: number) {
  return (bytes[offset] ?? 0) * 256 + (bytes[offset + 1] ?? 0)
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset] ?? 0) * 2 ** 24 +
      (bytes[offset + 1] ?? 0) * 2 ** 16 +
      (bytes[offset + 2] ?? 0) * 2 ** 8 +
      (bytes[offset + 3] ?? 0)) >>>
    0
  )
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    while (bytes[offset] === 0xff) offset += 1
    const marker = bytes[offset]
    offset += 1
    if (marker === undefined || marker === 0xd9 || marker === 0xda) break
    if (marker >= 0xd0 && marker <= 0xd7) continue
    const segmentLength = readUint16(bytes, offset)
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break
    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      const height = readUint16(bytes, offset + 3)
      const width = readUint16(bytes, offset + 5)
      return width > 0 && height > 0 ? { height, width } : null
    }
    offset += segmentLength
  }

  return null
}

function readPngDimensions(bytes: Uint8Array): ImageDimensions | null {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (signature.some((value, index) => bytes[index] !== value)) return null
  const width = readUint32(bytes, 16)
  const height = readUint32(bytes, 20)

  return width > 0 && height > 0 ? { height, width } : null
}

export function readImageDimensions(
  bytes: Uint8Array,
  mediaType: string,
): ImageDimensions | null {
  if (mediaType === 'image/png') return readPngDimensions(bytes)
  if (mediaType === 'image/jpeg') return readJpegDimensions(bytes)

  return null
}
