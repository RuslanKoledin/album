import type {
  PhysicalRectMm,
  TextAlign,
  TextRole,
  TextStyleSpec,
  ThemeSpec,
} from '@core/book'

const POINT_TO_MM = 0.3528

export const getTextFieldLabel = (role: TextRole) => {
  if (role === 'title') return 'Заголовок'
  if (role === 'subtitle') return 'Дата'
  if (role === 'caption') return 'Подпись'
  return 'Текст'
}

export const getTextFieldPlaceholder = (role: TextRole) => {
  if (role === 'subtitle') return 'Например, 12 июня 2026'
  if (role === 'caption') return 'Расскажите, что происходит на фотографии'
  return 'Введите текст'
}

export const getTextAlignLabel = (textAlign: TextAlign) => {
  if (textAlign === 'left') return 'по левому краю'
  if (textAlign === 'right') return 'по правому краю'
  return 'по центру'
}

export const getTextColorLabel = (colorToken: TextStyleSpec['colorToken']) =>
  colorToken === 'accent' ? 'акцентный цвет' : 'основной цвет'

export const getTextColor = (
  style: TextStyleSpec | undefined,
  theme: ThemeSpec | undefined,
) =>
  style?.colorToken === 'accent'
    ? (theme?.colors.accent ?? '#8e5737')
    : (theme?.colors.foreground ?? '#2d2926')

export const getTextAnchor = (textAlign: TextAlign | undefined) =>
  textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle'

export const getTextPositionX = (
  frame: PhysicalRectMm,
  textAlign: TextAlign | undefined,
) =>
  textAlign === 'left'
    ? frame.x
    : textAlign === 'right'
      ? frame.x + frame.width
      : frame.x + frame.width / 2

const splitLongWord = (word: string, limit: number) =>
  Array.from({ length: Math.ceil(word.length / limit) }, (_, index) =>
    word.slice(index * limit, (index + 1) * limit),
  )

export const getTextLines = (
  text: string,
  frame: PhysicalRectMm,
  style: TextStyleSpec | undefined,
) => {
  const fontSizeMm = (style?.fontSizePt ?? 12) * POINT_TO_MM
  const charactersPerLine = Math.max(
    1,
    Math.floor(frame.width / (fontSizeMm * 0.55)),
  )
  const words = text
    .trim()
    .split(/\s+/)
    .flatMap((word) => splitLongWord(word, charactersPerLine))

  return words.reduce<string[]>((lines, word) => {
    const last = lines.at(-1)
    if (!last || `${last} ${word}`.length > charactersPerLine) {
      return [...lines, word]
    }
    return [...lines.slice(0, -1), `${last} ${word}`]
  }, [])
}

export const getTextFontSizeMm = (style: TextStyleSpec | undefined) =>
  (style?.fontSizePt ?? 12) * POINT_TO_MM
