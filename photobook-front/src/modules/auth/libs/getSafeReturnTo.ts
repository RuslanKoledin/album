const DEFAULT_AUTH_RETURN_TO = '/account'

const AUTH_ORIGIN = 'https://photobook.local'
const BLOCKED_AUTH_PATHS = new Set(['/login', '/login/verify'])

export const getSafeReturnTo = (value: string | null): string => {
  if (
    !value ||
    value.length > 512 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return DEFAULT_AUTH_RETURN_TO
  }

  try {
    const url = new URL(value, AUTH_ORIGIN)
    if (url.origin !== AUTH_ORIGIN || BLOCKED_AUTH_PATHS.has(url.pathname)) {
      return DEFAULT_AUTH_RETURN_TO
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_AUTH_RETURN_TO
  }
}
