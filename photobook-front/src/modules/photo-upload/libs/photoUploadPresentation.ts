import type { PhotoUploadItem } from '@photo-upload/model'

const STATUS_LABELS: Readonly<Record<PhotoUploadItem['phase'], string>> = {
  queued: 'Ждёт загрузки',
  uploading: 'Загружаем оригинал',
  confirming: 'Подтверждаем файл',
  ready: 'Загружено',
  paused: 'Загрузка остановлена — файл доступен в этой вкладке',
  expired: 'Ссылка устарела — нажмите «Повторить загрузку»',
  failed: 'Не удалось загрузить — нажмите «Повторить загрузку»',
}

export const getPhotoUploadStatusLabel = (item: PhotoUploadItem) =>
  STATUS_LABELS[item.phase]

export const canCancelPhotoUpload = (item: PhotoUploadItem) =>
  ['queued', 'uploading', 'confirming'].includes(item.phase)

export const canRetryPhotoUpload = (item: PhotoUploadItem) =>
  ['paused', 'expired', 'failed'].includes(item.phase)
