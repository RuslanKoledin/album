import { useState, type FormEvent } from 'react'

import type { LayoutTextSlotSpec, TextBlock, TextStyleSpec } from '@core/book'

import { getTextFieldLabel, getTextFieldPlaceholder } from '@editor/libs'

import { TextInputStatus } from './TextInputStatus'
import { TextStyleSummary } from './TextStyleSummary'

interface TextPropertiesPanelProps {
  readonly commandError: string | null
  readonly onApplyText: (text: string) => void
  readonly slot: LayoutTextSlotSpec
  readonly style: TextStyleSpec
  readonly textBlock: TextBlock
}

export function TextPropertiesPanel({
  commandError,
  onApplyText,
  slot,
  style,
  textBlock,
}: TextPropertiesPanelProps) {
  const [text, setText] = useState(textBlock.text)
  const normalizedText = text.trim()
  const label = getTextFieldLabel(textBlock.role)
  const hasOverflow = text.length > slot.maxCharacters
  const isRequiredEmpty = slot.required && normalizedText.length === 0
  const hasChanges = normalizedText !== textBlock.text

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (hasChanges && !hasOverflow && !isRequiredEmpty) {
      onApplyText(normalizedText)
    }
  }

  return (
    <form className="mt-5" onSubmit={submit}>
      <div>
        <h3 className="font-semibold">{label}</h3>
        <p className="mt-1 text-xs text-ink-500">
          {slot.required ? 'Обязательное поле макета' : 'Необязательное поле'}
        </p>
      </div>
      <label
        className="mt-4 block text-xs font-medium text-ink-700"
        htmlFor="book-text"
      >
        {label}
      </label>
      <textarea
        aria-describedby="book-text-error"
        aria-invalid={hasOverflow || isRequiredEmpty}
        className="mt-2 min-h-24 w-full resize-y rounded-xl border border-control-border bg-paper-50 px-3 py-3 text-sm transition-colors focus:border-accent-600 aria-invalid:border-danger"
        id="book-text"
        placeholder={getTextFieldPlaceholder(textBlock.role)}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <TextInputStatus
        isRequiredEmpty={isRequiredEmpty}
        length={text.length}
        maxCharacters={slot.maxCharacters}
      />
      <TextStyleSummary style={style} />
      {commandError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {commandError}
        </p>
      )}
      <button
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent-600 px-4 text-sm font-semibold text-surface transition-colors hover:bg-accent-700 disabled:opacity-50"
        disabled={!hasChanges || hasOverflow || isRequiredEmpty}
        type="submit"
      >
        {normalizedText ? 'Применить текст' : 'Убрать текст'}
      </button>
    </form>
  )
}
