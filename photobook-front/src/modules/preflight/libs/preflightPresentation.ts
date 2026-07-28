import type {
  LocalPreflightIssue,
  LocalPreflightReport,
} from '@preflight/model'

interface PreflightIssuePresentation {
  readonly description: string
  readonly surfaceLabel: string
  readonly title: string
}

interface PreflightSummaryPresentation {
  readonly description: string
  readonly title: string
  readonly tone: 'ready' | 'warning' | 'error'
}

const getSurfaceLabel = ({ spreadIndex, surfaceId }: LocalPreflightIssue) => {
  if (surfaceId === 'cover') return 'Обложка'
  if (spreadIndex === null) return 'Вся книга'

  return `Разворот ${spreadIndex * 2 + 2}–${spreadIndex * 2 + 3}`
}

export const getPreflightIssuePresentation = (
  issue: LocalPreflightIssue,
): PreflightIssuePresentation => {
  const surfaceLabel = getSurfaceLabel(issue)

  if (issue.code === 'required_photo_missing') {
    return {
      surfaceLabel,
      title: 'Добавьте фотографию',
      description: 'Обязательное место в макете пока пустое.',
    }
  }
  if (issue.code === 'required_text_missing') {
    return {
      surfaceLabel,
      title: 'Заполните обязательный текст',
      description: 'В макете осталось пустое обязательное поле.',
    }
  }
  if (issue.code === 'photo_resolution_low') {
    return {
      surfaceLabel,
      title: 'Проверьте качество фотографии',
      description: `Около ${issue.effectiveDpi ?? 0} DPI — изображение может выглядеть нечётко при печати.`,
    }
  }
  if (issue.code === 'spread_count_out_of_range') {
    return {
      surfaceLabel,
      title: 'Проверьте количество разворотов',
      description: 'Количество страниц не соответствует тестовому формату.',
    }
  }
  if (issue.code === 'text_overflow') {
    return {
      surfaceLabel,
      title: 'Сократите текст',
      description: 'Текст не помещается в выбранное поле макета.',
    }
  }

  return {
    surfaceLabel,
    title: 'Проверьте настройки макета',
    description: 'Эта часть книги не соответствует выбранной конфигурации.',
  }
}

export const getPreflightSummaryPresentation = (
  report: LocalPreflightReport,
): PreflightSummaryPresentation => {
  if (report.errorCount > 0) {
    return {
      title: `Нужно исправить: ${report.errorCount}`,
      description:
        'Откройте отмеченные страницы и заполните обязательные места.',
      tone: 'error',
    }
  }
  if (report.warningCount > 0) {
    return {
      title: `Есть рекомендации: ${report.warningCount}`,
      description:
        'Макет не заблокирован, но качество фотографий стоит проверить.',
      tone: 'warning',
    }
  }

  return {
    title: 'Основные проверки пройдены',
    description: 'Обязательные места заполнены, явных проблем не найдено.',
    tone: 'ready',
  }
}
