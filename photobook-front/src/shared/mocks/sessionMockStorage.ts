const getSessionStorage = () => {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export const readMockSessionState = (key: string): unknown => {
  const storage = getSessionStorage()
  if (!storage) return null

  try {
    const value = storage.getItem(key)
    return value === null ? null : JSON.parse(value)
  } catch {
    storage.removeItem(key)
    return null
  }
}

export const writeMockSessionState = (key: string, value: unknown) => {
  const storage = getSessionStorage()
  if (!storage) return

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    storage.removeItem(key)
  }
}
