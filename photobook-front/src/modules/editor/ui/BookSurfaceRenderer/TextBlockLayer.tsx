import type { KeyboardEvent } from 'react'

import type { TextBlock, TextStyleSpec, ThemeSpec } from '@core/book'

import {
  getTextAnchor,
  getTextColor,
  getTextFieldLabel,
  getTextFontSizeMm,
  getTextLines,
  getTextPositionX,
} from '@editor/libs'

interface TextBlockLayerProps {
  readonly accent: string
  readonly compact: boolean
  readonly onSelect: ((id: string, kind: 'photo' | 'text') => void) | undefined
  readonly selected: boolean
  readonly style: TextStyleSpec | undefined
  readonly textBlock: TextBlock
  readonly theme: ThemeSpec | undefined
}

export function TextBlockLayer({
  accent,
  compact,
  onSelect,
  selected,
  style,
  textBlock,
  theme,
}: TextBlockLayerProps) {
  const isEmpty = textBlock.text.trim().length === 0
  if (compact && isEmpty) return null

  const label = getTextFieldLabel(textBlock.role)
  const lines = getTextLines(textBlock.text, textBlock.frameMm, style)
  const fontSize = getTextFontSizeMm(style)
  const lineHeight = fontSize * (style?.lineHeight ?? 1.2)
  const firstLineY =
    textBlock.frameMm.y +
    (textBlock.frameMm.height - lineHeight * lines.length) / 2 +
    fontSize
  const textX = getTextPositionX(textBlock.frameMm, style?.textAlign)
  const selectText = () => onSelect?.(textBlock.id, 'text')
  const selectWithKeyboard = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    selectText()
  }

  return (
    <g
      aria-label={onSelect ? `Выбрать: ${label.toLowerCase()}` : undefined}
      className={onSelect ? 'cursor-pointer' : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={selectText}
      onFocus={selectText}
      onKeyDown={selectWithKeyboard}
    >
      {(selected || isEmpty) && (
        <rect
          fill="transparent"
          height={textBlock.frameMm.height}
          stroke={accent}
          strokeDasharray={selected ? undefined : '3 2'}
          strokeOpacity={selected ? 1 : 0.65}
          strokeWidth="1"
          width={textBlock.frameMm.width}
          x={textBlock.frameMm.x}
          y={textBlock.frameMm.y}
        />
      )}
      {isEmpty ? (
        <text
          dominantBaseline="middle"
          fill={accent}
          fontFamily="Inter, sans-serif"
          fontSize={Math.min(fontSize, 6)}
          textAnchor="middle"
          x={textBlock.frameMm.x + textBlock.frameMm.width / 2}
          y={textBlock.frameMm.y + textBlock.frameMm.height / 2}
        >
          Добавить: {label.toLowerCase()}
        </text>
      ) : (
        <text
          fill={getTextColor(style, theme)}
          fontFamily={
            textBlock.role === 'title' ? 'Georgia, serif' : 'Inter, sans-serif'
          }
          fontSize={fontSize}
          fontWeight={style?.fontWeight ?? 400}
          textAnchor={getTextAnchor(style?.textAlign)}
        >
          {lines.map((line, index) => (
            <tspan
              key={`${line}-${index}`}
              x={textX}
              y={firstLineY + lineHeight * index}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  )
}
