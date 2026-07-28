import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { LuPencil } from 'react-icons/lu'

interface EditableProjectTitleProps {
  readonly title: string
  readonly onChange: (title: string) => void
}

export function EditableProjectTitle({
  title,
  onChange,
}: EditableProjectTitleProps) {
  const [draft, setDraft] = useState(title)
  const [editing, setEditing] = useState(false)

  const finish = () => {
    const nextTitle = draft.trim()
    setEditing(false)
    if (!nextTitle) {
      setDraft(title)
      return
    }
    if (nextTitle !== title) onChange(nextTitle)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
    if (event.key === 'Escape') {
      setDraft(title)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        aria-label="Название проекта"
        className="h-8 w-full rounded-lg border border-accent-600 bg-surface px-2 text-sm font-semibold outline-none"
        maxLength={80}
        value={draft}
        onBlur={finish}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
    )
  }

  return (
    <button
      aria-label={`Изменить название проекта: ${title}`}
      className="flex h-8 max-w-full items-center gap-1.5 rounded-lg px-1 text-left hover:bg-paper-100"
      title="Изменить название проекта"
      type="button"
      onClick={() => setEditing(true)}
    >
      <span className="truncate text-sm font-semibold sm:text-base">
        {title}
      </span>
      <LuPencil
        aria-hidden="true"
        className="shrink-0 text-ink-500"
        size={14}
      />
    </button>
  )
}
