export const ACCOUNT_TABS = ['projects', 'orders', 'profile'] as const

export type AccountTab = (typeof ACCOUNT_TABS)[number]

export const isAccountTab = (value: string | null): value is AccountTab =>
  ACCOUNT_TABS.some((tab) => tab === value)
