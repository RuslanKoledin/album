import { FiAlertTriangle } from 'react-icons/fi'

interface TextInputStatusProps {
  readonly isRequiredEmpty: boolean
  readonly length: number
  readonly maxCharacters: number
}

export function TextInputStatus({
  isRequiredEmpty,
  length,
  maxCharacters,
}: TextInputStatusProps) {
  const overflow = Math.max(0, length - maxCharacters)

  return (
    <div className="mt-2 flex items-start justify-between gap-3 text-xs">
      <div className="min-h-5 text-danger" id="book-text-error">
        {overflow > 0 && (
          <span className="flex items-start gap-1" role="alert">
            <FiAlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" />
            Сократите текст на {overflow} симв.
          </span>
        )}
        {overflow === 0 && isRequiredEmpty && (
          <span role="alert">Это обязательное поле.</span>
        )}
      </div>
      <span className={overflow > 0 ? 'text-danger' : 'text-ink-500'}>
        {length} / {maxCharacters}
      </span>
    </div>
  )
}
