const KYRGYZ_COUNTRY_CODE = '996'
const KYRGYZ_NATIONAL_DIGITS = 9

export const normalizeKyrgyzPhone = (value: string): string | null => {
  const digits = value.replaceAll(/\D/g, '')

  if (
    digits.startsWith(KYRGYZ_COUNTRY_CODE) &&
    digits.length === KYRGYZ_COUNTRY_CODE.length + KYRGYZ_NATIONAL_DIGITS
  ) {
    return `+${digits}`
  }

  if (digits.startsWith('0') && digits.length === KYRGYZ_NATIONAL_DIGITS + 1) {
    return `+${KYRGYZ_COUNTRY_CODE}${digits.slice(1)}`
  }

  if (digits.length === KYRGYZ_NATIONAL_DIGITS) {
    return `+${KYRGYZ_COUNTRY_CODE}${digits}`
  }

  return null
}
