import type { BookDocumentV1, BookSurface } from '@core/book'

import type { PreflightIssueDto } from '@project-review/model'

export interface ReviewSurface {
  readonly id: string
  readonly label: string
  readonly surface: BookSurface
}

export interface ServerWarningPresentation {
  readonly description: string
  readonly title: string
}

export const getReviewSurfaces = (
  document: BookDocumentV1,
): readonly ReviewSurface[] => [
  { id: 'cover', label: 'Обложка', surface: document.cover },
  ...document.spreads.map((surface, index) => ({
    id: surface.id,
    label: `Разворот ${index * 2 + 2}–${index * 2 + 3}`,
    surface,
  })),
]

export const getServerWarningPresentation = (
  issue: PreflightIssueDto,
  surfaces: readonly ReviewSurface[],
): ServerWarningPresentation => {
  const surfaceLabel =
    surfaces.find(({ id }) => id === issue.surfaceId)?.label ?? 'Вся книга'

  if (issue.code === 'PHOTO_RESOLUTION_LOW') {
    const actualDpi = issue.details.actualDpi ?? 0
    const requiredDpi = issue.details.requiredDpi ?? 240

    return {
      title: `${surfaceLabel}: проверьте качество фотографии`,
      description: `Около ${actualDpi} DPI при рекомендации не ниже ${requiredDpi} DPI. Изображение может выглядеть нечётко при печати.`,
    }
  }

  return {
    title: `${surfaceLabel}: проверьте макет`,
    description:
      'Сервис нашёл рекомендацию, которую нужно учесть перед утверждением.',
  }
}
