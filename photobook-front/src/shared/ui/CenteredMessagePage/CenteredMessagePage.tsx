import { useId } from 'react'
import type { ReactNode } from 'react'

interface CenteredMessagePageProps {
  children?: ReactNode
  description: string
  eyebrow: string
  title: string
}

export function CenteredMessagePage({
  children,
  description,
  eyebrow,
  title,
}: CenteredMessagePageProps) {
  const titleId = useId()

  return (
    <main className="page-container flex min-h-dvh items-center py-16">
      <section
        aria-labelledby={titleId}
        className="max-w-2xl rounded-4xl border border-border bg-surface/75 p-8 shadow-surface sm:p-12"
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-accent-600 uppercase">
          {eyebrow}
        </p>
        <h1
          id={titleId}
          className="mt-4 font-serif text-4xl leading-tight sm:text-5xl"
        >
          {title}
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-ink-700">{description}</p>
        {children}
      </section>
    </main>
  )
}
