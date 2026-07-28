import type { PreflightIssueDto } from '@modules/project-review'

export const formatOperatorDate = (value: string) =>
  new Intl.DateTimeFormat('ru-KG', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Bishkek',
  }).format(new Date(value))

export const getPreflightIssueLabel = (issue: PreflightIssueDto) => {
  if (issue.code === 'LOW_RESOLUTION') return 'Низкое разрешение фотографии'
  if (issue.code === 'MISSING_PHOTO') return 'Не добавлена фотография'
  if (issue.code === 'MISSING_TEXT') return 'Не заполнен обязательный текст'
  return 'Замечание проверки макета'
}
