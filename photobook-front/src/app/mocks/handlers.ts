import { authHandlers, resetAuthMockState } from '@mocks/auth'
import { catalogHandlers } from '@mocks/catalog'
import { orderHandlers, resetOrderMockState } from '@mocks/order'
import { operatorHandlers } from '@mocks/operator'
import {
  photoUploadHandlers,
  resetPhotoUploadMockState,
} from '@mocks/photo-upload'
import { projectHandlers, resetProjectMockState } from '@mocks/project'
import { pricingHandlers, resetPricingMockState } from '@mocks/pricing'
import {
  projectReviewHandlers,
  resetProjectReviewMockState,
} from '@mocks/project-review'

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...pricingHandlers,
  ...projectHandlers,
  ...projectReviewHandlers,
  ...orderHandlers,
  ...operatorHandlers,
  ...photoUploadHandlers,
]

export function resetMockState() {
  resetAuthMockState()
  resetProjectMockState()
  resetPricingMockState()
  resetProjectReviewMockState()
  resetOrderMockState()
  resetPhotoUploadMockState()
}
