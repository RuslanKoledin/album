import { FiCheck } from 'react-icons/fi'

import {
  CREATE_PROJECT_STEPS,
  type CreateProjectStep,
} from '@create-project/model'

const STEP_LABELS: Readonly<Record<CreateProjectStep, string>> = {
  product: 'Формат',
  template: 'История',
  details: 'Настройки',
  photos: 'Фото',
}

interface CreateStepProgressProps {
  readonly currentStep: CreateProjectStep
}

export function CreateStepProgress({ currentStep }: CreateStepProgressProps) {
  const currentIndex = CREATE_PROJECT_STEPS.indexOf(currentStep)

  return (
    <nav aria-label="Этапы создания книги" className="mt-8">
      <ol className="grid grid-cols-4 gap-2">
        {CREATE_PROJECT_STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = step === currentStep

          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              className="min-w-0"
            >
              <div
                className={`h-1 rounded-full ${
                  isComplete || isCurrent ? 'bg-accent-600' : 'bg-paper-200'
                }`}
              />
              <div className="mt-3 flex min-w-0 flex-col items-start gap-1.5 text-xs font-semibold sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                    isComplete || isCurrent
                      ? 'border-accent-600 bg-accent-50 text-accent-700'
                      : 'border-border text-ink-500'
                  }`}
                >
                  {isComplete ? <FiCheck aria-hidden="true" /> : index + 1}
                </span>
                <span className="max-w-full truncate text-[10px] leading-tight sm:text-sm">
                  {STEP_LABELS[step]}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
