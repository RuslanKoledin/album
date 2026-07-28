import type { ReactNode } from 'react'

interface MobileToolButtonProps {
  readonly active: boolean
  readonly disabled: boolean
  readonly icon: ReactNode
  readonly label: string
  readonly onSelect: () => void
}

export function MobileToolButton({
  active,
  disabled,
  icon,
  label,
  onSelect,
}: MobileToolButtonProps) {
  return (
    <button
      aria-pressed={active}
      className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-medium text-ink-500 transition-colors disabled:opacity-35 aria-pressed:bg-accent-50 aria-pressed:text-accent-700"
      disabled={disabled}
      type="button"
      onClick={onSelect}
    >
      <span aria-hidden="true" className="text-lg">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}
