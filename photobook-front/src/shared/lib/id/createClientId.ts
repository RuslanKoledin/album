const toHex = (value: number) => value.toString(16).padStart(2, '0')

const createRandomHex = () => {
  const cryptoSource = globalThis.crypto
  if (cryptoSource?.getRandomValues) {
    const bytes = new Uint8Array(16)
    cryptoSource.getRandomValues(bytes)
    return [...bytes].map(toHex).join('')
  }

  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
}

export const createClientId = (prefix = 'client') => {
  const randomUuid = globalThis.crypto?.randomUUID?.()
  return `${prefix}-${randomUuid ?? createRandomHex()}`
}
