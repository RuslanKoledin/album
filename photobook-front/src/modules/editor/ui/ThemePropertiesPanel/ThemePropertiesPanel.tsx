import { FiLock } from 'react-icons/fi'

import type { ThemeSpec } from '@core/book'

import { ThemeColorSwatch } from './ThemeColorSwatch'

interface ThemePropertiesPanelProps {
  readonly separated: boolean
  readonly theme: ThemeSpec
}

export function ThemePropertiesPanel({
  separated,
  theme,
}: ThemePropertiesPanelProps) {
  return (
    <section
      aria-labelledby="theme-properties-title"
      className={separated ? 'mt-7 border-t border-border pt-6' : 'mt-5'}
    >
      <h3 className="font-semibold" id="theme-properties-title">
        Оформление
      </h3>
      <p className="mt-1 text-xs leading-5 text-ink-500">
        Фон, текст и акценты заданы проверенной темой и применяются ко всей
        книге.
      </p>
      <dl className="mt-4 grid gap-2">
        <ThemeColorSwatch
          color={theme.colors.background}
          label="Фон страницы"
          usage="Основа обложки и разворотов"
        />
        <ThemeColorSwatch
          color={theme.colors.foreground}
          label="Основной текст"
          usage="Заголовки и подписи"
        />
        <ThemeColorSwatch
          color={theme.colors.accent}
          label="Акцент"
          usage="Дата и выделение выбранного объекта"
        />
      </dl>
      <div className="mt-4 flex gap-2 rounded-xl bg-paper-100 p-3 text-xs leading-5 text-ink-700">
        <FiLock aria-hidden="true" className="mt-0.5 shrink-0" />
        <p>
          Для текущего продукта доступно одно проверенное оформление. Свободный
          выбор цветов отключён, чтобы сохранить качество печати.
        </p>
      </div>
    </section>
  )
}
