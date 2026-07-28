export const getCreatePhotoReturnTo = (pathname: string, search: string) => {
  const searchParams = new URLSearchParams(search)
  searchParams.set('step', 'photos')
  return `${pathname}?${searchParams.toString()}`
}
