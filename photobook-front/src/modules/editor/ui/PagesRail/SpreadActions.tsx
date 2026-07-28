import { useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi'

import { SpreadRemovalConfirmation } from './SpreadRemovalConfirmation'

interface SpreadActionsProps {
  readonly activeSpreadLabel: string | undefined
  readonly canAdd: boolean
  readonly canDuplicate: boolean
  readonly canMoveAfter: boolean
  readonly canMoveBefore: boolean
  readonly canRemove: boolean
  readonly isAtMaximum: boolean
  readonly isAtMinimum: boolean
  readonly onAdd: () => void
  readonly onDuplicate: () => void
  readonly onMoveAfter: () => void
  readonly onMoveBefore: () => void
  readonly onRemove: () => void
}

const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-control-border bg-surface text-ink-700 transition-colors hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-40'

export function SpreadActions({
  activeSpreadLabel,
  canAdd,
  canDuplicate,
  canMoveAfter,
  canMoveBefore,
  canRemove,
  isAtMaximum,
  isAtMinimum,
  onAdd,
  onDuplicate,
  onMoveAfter,
  onMoveBefore,
  onRemove,
}: SpreadActionsProps) {
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false)

  return (
    <div className="border-t border-border p-3 md:p-4">
      <button
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-3 text-sm font-semibold text-surface transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canAdd}
        type="button"
        onClick={onAdd}
      >
        <FiPlus aria-hidden="true" />
        Добавить разворот
      </button>

      {isAtMaximum && (
        <p className="mt-2 text-xs leading-5 text-ink-500">
          Достигнут максимум разворотов для этого формата.
        </p>
      )}

      {activeSpreadLabel && !isConfirmingRemoval && (
        <div
          aria-label={`Действия: ${activeSpreadLabel}`}
          className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-2 lg:grid-cols-4"
          role="group"
        >
          <button
            aria-label="Переместить разворот раньше"
            className={secondaryButtonClass}
            disabled={!canMoveBefore}
            title="Переместить раньше"
            type="button"
            onClick={onMoveBefore}
          >
            <FiChevronLeft aria-hidden="true" />
          </button>
          <button
            aria-label="Переместить разворот позже"
            className={secondaryButtonClass}
            disabled={!canMoveAfter}
            title="Переместить позже"
            type="button"
            onClick={onMoveAfter}
          >
            <FiChevronRight aria-hidden="true" />
          </button>
          <button
            aria-label="Дублировать разворот"
            className={secondaryButtonClass}
            disabled={!canDuplicate}
            title="Дублировать"
            type="button"
            onClick={onDuplicate}
          >
            <FiCopy aria-hidden="true" />
          </button>
          <button
            aria-label="Удалить разворот"
            className={`${secondaryButtonClass} hover:border-danger hover:bg-danger-soft hover:text-danger`}
            disabled={!canRemove}
            title={
              isAtMinimum
                ? 'Нельзя удалить последний обязательный разворот'
                : 'Удалить'
            }
            type="button"
            onClick={() => setIsConfirmingRemoval(true)}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>
      )}

      {activeSpreadLabel && isAtMinimum && !isConfirmingRemoval && (
        <p className="mt-2 text-xs leading-5 text-ink-500">
          В книге должен остаться минимум один разворот.
        </p>
      )}

      {activeSpreadLabel && isConfirmingRemoval && (
        <SpreadRemovalConfirmation
          label={activeSpreadLabel}
          onCancel={() => setIsConfirmingRemoval(false)}
          onConfirm={() => {
            onRemove()
            setIsConfirmingRemoval(false)
          }}
        />
      )}
    </div>
  )
}
