import { Link } from 'react-router'

import type { ProjectDto } from '@modules/project'

import { AccountListState } from '@account-ui/AccountListState'

import { ProjectCard } from './ProjectCard'

interface ProjectListProps {
  readonly isError: boolean
  readonly isLoading: boolean
  readonly projects: readonly ProjectDto[]
  readonly retry: () => void
}

export function ProjectList({
  isError,
  isLoading,
  projects,
  retry,
}: ProjectListProps) {
  if (isLoading) {
    return (
      <AccountListState
        description="Получаем сохранённые книги и последние версии макетов."
        title="Загружаем проекты…"
      />
    )
  }
  if (isError) {
    return (
      <AccountListState
        action={
          <button
            className="mt-6 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
            type="button"
            onClick={retry}
          >
            Повторить
          </button>
        }
        description="Проверьте подключение. Сохранённые макеты не изменились."
        title="Проекты пока недоступны"
      />
    )
  }
  if (projects.length === 0) {
    return (
      <AccountListState
        action={
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
            to="/create"
          >
            Создать первую книгу
          </Link>
        }
        description="Выберите формат и стиль — первый сохранённый макет появится здесь."
        title="Проектов пока нет"
      />
    )
  }

  return (
    <section aria-label="Проекты" className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  )
}
