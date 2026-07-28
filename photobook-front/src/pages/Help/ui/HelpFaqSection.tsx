import { HiOutlineChevronDown } from 'react-icons/hi2'

import { HELP_FAQ_ITEMS } from '@pages/Help/config'

export function HelpFaqSection() {
  return (
    <section className="border-y border-border bg-paper-100/65 py-16 sm:py-20">
      <div className="page-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
            Важные вопросы
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Что нужно знать сейчас
          </h2>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {HELP_FAQ_ITEMS.map((item, index) => (
            <details
              className="group py-1"
              key={item.question}
              open={index === 0}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 font-semibold marker:content-none">
                <span>{item.question}</span>
                <HiOutlineChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="max-w-2xl pb-6 leading-7 text-ink-700">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
