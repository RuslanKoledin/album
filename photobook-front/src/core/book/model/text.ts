export const TEXT_ROLES = ['title', 'subtitle', 'body', 'caption'] as const

export type TextRole = (typeof TEXT_ROLES)[number]
