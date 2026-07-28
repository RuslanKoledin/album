import type { CreateProjectRequestDto } from '@modules/project'
import { LOCAL_PHOTO_SET_ID } from '@modules/photo-upload'

import {
  SEEDED_PHOTO_SET,
  type CreateProjectSelection,
} from '@create-project/model'

export const getCreateProjectRequest = (
  selection: CreateProjectSelection,
  catalogVersion: string,
): CreateProjectRequestDto | null => {
  const { coverValueId, photoSetId, productSpec, spreadCount, template } =
    selection
  if (
    !productSpec ||
    !template ||
    spreadCount === null ||
    ![SEEDED_PHOTO_SET.id, LOCAL_PHOTO_SET_ID].includes(photoSetId ?? '')
  ) {
    return null
  }

  const coverOption = productSpec.optionSpecs[0]
  if (coverOption && !coverValueId) return null

  return {
    productId: productSpec.productId,
    templateId: template.id,
    catalogVersion,
    categoryTags: selection.categoryTags,
    spreadCount,
    optionSelections:
      coverOption && coverValueId
        ? [{ optionId: coverOption.id, valueId: coverValueId }]
        : [],
  }
}
