export const formatLocalPhotoSize = (sizeBytes: number) => {
  const megabytes = sizeBytes / (1024 * 1024)
  return `${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} МБ`
}
