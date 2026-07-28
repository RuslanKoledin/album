import { normalizeKyrgyzPhone } from './normalizeKyrgyzPhone'

export const formatKyrgyzPhone = (value: string): string => {
  const normalized = normalizeKyrgyzPhone(value)
  if (!normalized) return value

  const digits = normalized.slice(1)
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
}
