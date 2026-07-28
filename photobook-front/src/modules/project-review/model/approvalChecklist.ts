import type {
  ApprovalChecklistDto,
  ApprovalChecklistKey,
} from './projectReview'

export const EMPTY_APPROVAL_CHECKLIST: ApprovalChecklistDto = {
  namesChecked: false,
  datesChecked: false,
  captionsChecked: false,
  pageOrderChecked: false,
  cropUnderstood: false,
  readyForPrint: false,
}

export const APPROVAL_CHECKLIST_ITEMS: ReadonlyArray<{
  readonly key: ApprovalChecklistKey
  readonly label: string
}> = [
  { key: 'namesChecked', label: 'Имена и названия проверены' },
  { key: 'datesChecked', label: 'Даты проверены или в книге их нет' },
  { key: 'captionsChecked', label: 'Все подписи и тексты проверены' },
  { key: 'pageOrderChecked', label: 'Порядок страниц правильный' },
  { key: 'cropUnderstood', label: 'Кадрирование фотографий меня устраивает' },
  {
    key: 'readyForPrint',
    label: 'Макет закончен и подходит для тестовой заявки',
  },
]

export const isApprovalChecklistComplete = (checklist: ApprovalChecklistDto) =>
  APPROVAL_CHECKLIST_ITEMS.every(({ key }) => checklist[key])
