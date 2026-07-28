import type { ReactNode } from 'react'

interface AccountListStateProps {
  readonly action?: ReactNode
  readonly description: string
  readonly title: string
}

export function AccountListState({
  action,
  description,
  title,
}: AccountListStateProps) {
  return (
    <section className="rounded-3xl border border-dashed border-border bg-surface/70 p-6 sm:p-8">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mt-3 max-w-xl leading-7 text-ink-700">{description}</p>
      {action}
    </section>
  )
}
