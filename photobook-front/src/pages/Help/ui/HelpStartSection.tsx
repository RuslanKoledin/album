import { HELP_START_STEPS } from '@pages/Help/config'

export function HelpStartSection() {
  return (
    <section className="border-y border-border bg-surface/55 py-16 sm:py-20">
      <div className="page-container">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
            Быстрый старт
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Три шага до готового макета
          </h2>
        </div>

        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-5">
          {HELP_START_STEPS.map((step) => (
            <li className="border-t border-ink-300 pt-5" key={step.number}>
              <p className="text-sm font-semibold text-accent-600">
                {step.number}
              </p>
              <h3 className="mt-5 font-serif text-2xl">{step.title}</h3>
              <p className="mt-3 max-w-sm leading-7 text-ink-700">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
