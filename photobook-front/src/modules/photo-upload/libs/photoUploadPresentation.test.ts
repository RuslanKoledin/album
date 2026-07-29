import { describe, expect, it } from 'vitest'

import type { PhotoUploadItem } from '@photo-upload/model'

import {
  canRetryPhotoUpload,
  getPhotoUploadStatusLabel,
} from './photoUploadPresentation'

const createUploadItem = (
  phase: PhotoUploadItem['phase'],
): PhotoUploadItem => ({
  assetId: 'mock-asset',
  localPhotoId: 'local-photo',
  phase,
  progress: 0,
})

describe('photo upload presentation', () => {
  it('does not describe failed uploads as saved files', () => {
    const label = getPhotoUploadStatusLabel(createUploadItem('failed'))

    expect(label).toContain('Повторить загрузку')
    expect(label).not.toContain('файл сохранён')
  })

  it('keeps retry available for recoverable upload phases', () => {
    expect(canRetryPhotoUpload(createUploadItem('failed'))).toBe(true)
    expect(canRetryPhotoUpload(createUploadItem('expired'))).toBe(true)
    expect(canRetryPhotoUpload(createUploadItem('ready'))).toBe(false)
  })
})
