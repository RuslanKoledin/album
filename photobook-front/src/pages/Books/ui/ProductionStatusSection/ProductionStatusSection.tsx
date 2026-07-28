import { FORMAT_PENDING_DECISIONS } from '@pages/Books/config'

export function ProductionStatusSection() {
  return (
    <section className="page-container py-16 sm:py-20 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
          Перед публичным запуском
        </p>
        <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          Что фиксируем с печатным партнёром
        </h2>
        <p className="mt-5 text-lg leading-8 text-ink-700">
          Эти данные станут публичными после выбора типографии и проверки
          физического образца.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {FORMAT_PENDING_DECISIONS.map((decision) => (
          <article
            className="rounded-3xl border border-border bg-surface/65 p-6"
            key={decision.title}
          >
            <h3 className="font-serif text-2xl">{decision.title}</h3>
            <p className="mt-3 leading-7 text-ink-700">
              {decision.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
