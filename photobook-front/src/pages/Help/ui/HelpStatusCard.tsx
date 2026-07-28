import type { ReactNode } from 'react'

interface HelpStatusCardProps {
  readonly icon: ReactNode
  readonly items: readonly string[]
  readonly title: string
}

export function HelpStatusCard({ icon, items, title }: HelpStatusCardProps) {
  return (
    <article className="rounded-3xl border border-border bg-surface/65 p-6 sm:p-8">
      <div className="flex items-center gap-3 text-accent-700">
        {icon}
        <h3 className="font-serif text-2xl text-ink-950">{title}</h3>
      </div>
      <ul className="mt-6 space-y-3 text-ink-700">
        {items.map((item) => (
          <li className="border-t border-border pt-3 leading-7" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
