import type { PhotoUploadItem } from '@photo-upload/model'

const STATUS_LABELS: Readonly<Record<PhotoUploadItem['phase'], string>> = {
  queued: 'Ждёт загрузки',
  uploading: 'Загружаем оригинал',
  confirming: 'Подтверждаем файл',
  ready: 'Загружено',
  paused: 'Загрузка остановлена — файл сохранён',
  expired: 'Ссылка устарела — файл сохранён',
  failed: 'Не удалось загрузить — файл сохранён',
}

export const getPhotoUploadStatusLabel = (item: PhotoUploadItem) =>
  STATUS_LABELS[item.phase]

export const canCancelPhotoUpload = (item: PhotoUploadItem) =>
  ['queued', 'uploading', 'confirming'].includes(item.phase)

export const canRetryPhotoUpload = (item: PhotoUploadItem) =>
  ['paused', 'expired', 'failed'].includes(item.phase)
