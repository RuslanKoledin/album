interface ThemeColorSwatchProps {
  readonly color: string
  readonly label: string
  readonly usage: string
}

export function ThemeColorSwatch({
  color,
  label,
  usage,
}: ThemeColorSwatchProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <span
        aria-hidden="true"
        className="size-9 shrink-0 rounded-full border border-black/10 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <dt className="text-sm font-medium text-ink-950">{label}</dt>
        <dd className="mt-0.5 text-xs leading-4 text-ink-500">{usage}</dd>
      </div>
    </div>
  )
}
