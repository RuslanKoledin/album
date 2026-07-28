import {
  isTextStyleAllowed,
  type LayoutSpec,
  type ProductSpec,
  type ThemeSpec,
} from '@core/book/configuration'
import type { BookSurface } from '@core/book/model'

import type { BookDocumentValidationIssue } from './bookDocumentValidation'
import { hasSameRect } from './validationGeometry'

interface TextBlocksValidationInput {
  readonly surface: BookSurface
  readonly layout: LayoutSpec
  readonly path: string
  readonly product: ProductSpec | undefined
  readonly theme: ThemeSpec | undefined
  readonly issues: BookDocumentValidationIssue[]
}

export const validateTextBlocks = ({
  surface,
  layout,
  path,
  product,
  theme,
  issues,
}: TextBlocksValidationInput) => {
  const seenSlotKeys = new Set<string>()

  surface.textBlocks.forEach((textBlock, index) => {
    const textPath = `${path}/textBlocks/${index}`
    const slotSpec = layout.textSlots.find(
      ({ slotKey }) => slotKey === textBlock.layoutSlotKey,
    )

    if (seenSlotKeys.has(textBlock.layoutSlotKey) || !slotSpec) {
      issues.push({
        code: 'layout_slot_mismatch',
        path: `${textPath}/layoutSlotKey`,
        relatedId: textBlock.layoutSlotKey,
      })
      return
    }

    seenSlotKeys.add(textBlock.layoutSlotKey)
    if (!hasSameRect(textBlock.frameMm, slotSpec.frameMm)) {
      issues.push({
        code: 'layout_geometry_mismatch',
        path: `${textPath}/frameMm`,
      })
    }
    if (slotSpec.required && textBlock.text.trim().length === 0) {
      issues.push({ code: 'required_text_missing', path: `${textPath}/text` })
    }
    if (textBlock.text.length > slotSpec.maxCharacters) {
      issues.push({ code: 'text_overflow', path: `${textPath}/text` })
    }
    if (
      !slotSpec.allowedRoles.some((role) => role === textBlock.role) ||
      (product &&
        theme &&
        !isTextStyleAllowed(
          product,
          theme,
          textBlock.textStyleId,
          textBlock.role,
        ))
    ) {
      issues.push({
        code: 'text_style_invalid',
        path: `${textPath}/textStyleId`,
        relatedId: textBlock.textStyleId,
      })
    }
  })

  layout.textSlots
    .filter(({ required }) => required)
    .forEach((slotSpec) => {
      if (!seenSlotKeys.has(slotSpec.slotKey)) {
        issues.push({
          code: 'layout_slot_mismatch',
          path: `${path}/textBlocks`,
          relatedId: slotSpec.slotKey,
        })
      }
    })
}
