import {
  hasSameRect,
  hasSameSize,
  isNormalizedPoint,
  isNormalizedRect,
} from './bookValidation.geometry.js'
import type {
  BookSurface,
  BookValidationIssue,
  LayoutSpec,
  ProductSpec,
  ThemeSpec,
} from './bookValidation.types.js'

interface ValidateSurfaceInput {
  readonly assetIds: ReadonlySet<string>
  readonly expectedSurface: LayoutSpec['surface']
  readonly issues: BookValidationIssue[]
  readonly layouts: readonly LayoutSpec[]
  readonly path: string
  readonly product: ProductSpec | undefined
  readonly surface: BookSurface
  readonly theme: ThemeSpec | undefined
}

function validatePhotoValues(
  surface: BookSurface,
  path: string,
  assetIds: ReadonlySet<string>,
  issues: BookValidationIssue[],
) {
  surface.photoSlots.forEach((slot, index) => {
    const slotPath = `${path}/photoSlots/${index}`
    if (slot.assetId && !assetIds.has(slot.assetId)) {
      issues.push({
        code: 'unknown_asset',
        path: `${slotPath}/assetId`,
        relatedId: slot.assetId,
      })
    }
    if (!isNormalizedRect(slot.crop)) {
      issues.push({ code: 'crop_out_of_bounds', path: `${slotPath}/crop` })
    }
    if (!isNormalizedPoint(slot.focalPoint)) {
      issues.push({
        code: 'focal_point_out_of_bounds',
        path: `${slotPath}/focalPoint`,
      })
    }
  })
}

function validatePhotoSlots(
  surface: BookSurface,
  layout: LayoutSpec,
  path: string,
  issues: BookValidationIssue[],
) {
  const seenKeys = new Set<string>()
  surface.photoSlots.forEach((slot, index) => {
    const slotPath = `${path}/photoSlots/${index}`
    const spec = layout.photoSlots.find(
      ({ slotKey }) => slotKey === slot.layoutSlotKey,
    )
    if (seenKeys.has(slot.layoutSlotKey) || !spec) {
      issues.push({
        code: 'layout_slot_mismatch',
        path: `${slotPath}/layoutSlotKey`,
        relatedId: slot.layoutSlotKey,
      })
      return
    }
    seenKeys.add(slot.layoutSlotKey)
    if (!hasSameRect(slot.frameMm, spec.frameMm)) {
      issues.push({
        code: 'layout_geometry_mismatch',
        path: `${slotPath}/frameMm`,
      })
    }
    if (spec.required && !slot.assetId) {
      issues.push({
        code: 'required_photo_missing',
        path: `${slotPath}/assetId`,
      })
    }
  })
  layout.photoSlots
    .filter(({ required }) => required)
    .forEach(({ slotKey }) => {
      if (!seenKeys.has(slotKey)) {
        issues.push({
          code: 'layout_slot_mismatch',
          path: `${path}/photoSlots`,
          relatedId: slotKey,
        })
      }
    })
}

function isTextStyleAllowed(
  textStyleId: string,
  role: string,
  product: ProductSpec | undefined,
  theme: ThemeSpec | undefined,
) {
  const style = theme?.textStyles.find(({ id }) => id === textStyleId)
  return Boolean(
    product &&
    theme &&
    style?.role === role &&
    product.allowedTextRoles.includes(role) &&
    product.allowedTextSizeTokens.includes(style.sizeToken),
  )
}

function validateTextBlocks(
  surface: BookSurface,
  layout: LayoutSpec,
  path: string,
  product: ProductSpec | undefined,
  theme: ThemeSpec | undefined,
  issues: BookValidationIssue[],
) {
  const seenKeys = new Set<string>()
  surface.textBlocks.forEach((block, index) => {
    const blockPath = `${path}/textBlocks/${index}`
    const spec = layout.textSlots.find(
      ({ slotKey }) => slotKey === block.layoutSlotKey,
    )
    if (seenKeys.has(block.layoutSlotKey) || !spec) {
      issues.push({
        code: 'layout_slot_mismatch',
        path: `${blockPath}/layoutSlotKey`,
        relatedId: block.layoutSlotKey,
      })
      return
    }
    seenKeys.add(block.layoutSlotKey)
    if (!hasSameRect(block.frameMm, spec.frameMm)) {
      issues.push({
        code: 'layout_geometry_mismatch',
        path: `${blockPath}/frameMm`,
      })
    }
    if (spec.required && block.text.trim().length === 0) {
      issues.push({ code: 'required_text_missing', path: `${blockPath}/text` })
    }
    if (block.text.length > spec.maxCharacters) {
      issues.push({ code: 'text_overflow', path: `${blockPath}/text` })
    }
    if (
      !spec.allowedRoles.includes(block.role) ||
      !isTextStyleAllowed(block.textStyleId, block.role, product, theme)
    ) {
      issues.push({
        code: 'text_style_invalid',
        path: `${blockPath}/textStyleId`,
        relatedId: block.textStyleId,
      })
    }
  })
  layout.textSlots
    .filter(({ required }) => required)
    .forEach(({ slotKey }) => {
      if (!seenKeys.has(slotKey)) {
        issues.push({
          code: 'layout_slot_mismatch',
          path: `${path}/textBlocks`,
          relatedId: slotKey,
        })
      }
    })
}

export function validateBookSurface({
  assetIds,
  expectedSurface,
  issues,
  layouts,
  path,
  product,
  surface,
  theme,
}: ValidateSurfaceInput) {
  const layout = layouts.find(({ id }) => id === surface.layoutId)
  validatePhotoValues(surface, path, assetIds, issues)
  if (!layout) {
    issues.push({
      code: 'unknown_layout',
      path: `${path}/layoutId`,
      relatedId: surface.layoutId,
    })
    return
  }
  const expectedSize =
    expectedSurface === 'cover' ? product?.coverSizeMm : product?.spreadSizeMm
  if (
    layout.surface !== expectedSurface ||
    !product?.allowedLayoutIds.includes(layout.id) ||
    !layout.supportedProductSpecIds.includes(product.id)
  ) {
    issues.push({ code: 'layout_incompatible', path: `${path}/layoutId` })
  }
  if (
    !hasSameSize(surface.sizeMm, layout.sizeMm) ||
    (expectedSize && !hasSameSize(layout.sizeMm, expectedSize))
  ) {
    issues.push({ code: 'layout_geometry_mismatch', path: `${path}/sizeMm` })
  }
  validatePhotoSlots(surface, layout, path, issues)
  validateTextBlocks(surface, layout, path, product, theme, issues)
}
