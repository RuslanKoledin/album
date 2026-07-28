import type { LocalPhotoIssueCode } from '@photo-upload/model'

const ISSUE_MESSAGES: Readonly<Record<LocalPhotoIssueCode, string>> = {
  duplicate: 'Этот файл уже выбран.',
  empty: 'Файл пустой и не может быть добавлен.',
  limit_exceeded: 'Достигнут лимит тестовой версии — 50 фотографий.',
  too_large: 'Файл больше 25 МБ.',
  unsupported_type: 'Поддерживаются только JPEG, JPG и PNG.',
}

export const getLocalPhotoIssueMessage = (code: LocalPhotoIssueCode) =>
  ISSUE_MESSAGES[code]
