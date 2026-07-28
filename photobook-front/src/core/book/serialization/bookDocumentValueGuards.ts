import { TEXT_ROLES } from '@core/book/model'

import {
  hasExactKeys,
  isFiniteNumber,
  isOpaqueId,
  isRecord,
} from './runtimeValueGuards'

const isPhysicalSizeMm = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['width', 'height']) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height)

const isPhysicalRectMm = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['x', 'y', 'width', 'height']) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height)

const isNormalizedPoint = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['x', 'y']) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y)

const isNormalizedRect = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['x', 'y', 'width', 'height']) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height)

const isProductOptionSelection = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['optionId', 'valueId']) &&
  isOpaqueId(value.optionId) &&
  isOpaqueId(value.valueId)

export const isProductSelection = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, [
    'productId',
    'productSpecId',
    'catalogVersion',
    'templateId',
    'themeId',
    'optionSelections',
  ]) &&
  isOpaqueId(value.productId) &&
  isOpaqueId(value.productSpecId) &&
  isOpaqueId(value.catalogVersion) &&
  isOpaqueId(value.templateId) &&
  isOpaqueId(value.themeId) &&
  Array.isArray(value.optionSelections) &&
  value.optionSelections.every(isProductOptionSelection)

export const isAssetReference = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['assetId']) &&
  isOpaqueId(value.assetId)

const isPhotoSlot = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, [
    'id',
    'layoutSlotKey',
    'frameMm',
    'assetId',
    'crop',
    'focalPoint',
  ]) &&
  isOpaqueId(value.id) &&
  isOpaqueId(value.layoutSlotKey) &&
  isPhysicalRectMm(value.frameMm) &&
  (value.assetId === null || isOpaqueId(value.assetId)) &&
  isNormalizedRect(value.crop) &&
  isNormalizedPoint(value.focalPoint)

const isTextBlock = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, [
    'id',
    'layoutSlotKey',
    'frameMm',
    'role',
    'textStyleId',
    'text',
  ]) &&
  isOpaqueId(value.id) &&
  isOpaqueId(value.layoutSlotKey) &&
  isPhysicalRectMm(value.frameMm) &&
  TEXT_ROLES.some((role) => role === value.role) &&
  isOpaqueId(value.textStyleId) &&
  typeof value.text === 'string'

const isSurfaceContent = (value: unknown) =>
  isRecord(value) &&
  isOpaqueId(value.layoutId) &&
  isPhysicalSizeMm(value.sizeMm) &&
  Array.isArray(value.photoSlots) &&
  value.photoSlots.every(isPhotoSlot) &&
  Array.isArray(value.textBlocks) &&
  value.textBlocks.every(isTextBlock)

export const isBookSurface = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['layoutId', 'sizeMm', 'photoSlots', 'textBlocks']) &&
  isSurfaceContent(value)

export const isSpread = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, [
    'id',
    'layoutId',
    'sizeMm',
    'photoSlots',
    'textBlocks',
  ]) &&
  isOpaqueId(value.id) &&
  isSurfaceContent(value)
