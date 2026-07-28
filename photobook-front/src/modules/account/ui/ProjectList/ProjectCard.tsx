import { Link } from 'react-router'

import type { ProjectDto } from '@modules/project'

import { ProjectCoverPreview } from './ProjectCoverPreview'

interface ProjectCardProps {
  readonly project: ProjectDto
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-KG', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bishkek',
  }).format(new Date(value))

export function ProjectCard({ project }: ProjectCardProps) {
  const approved = project.approvedRevisionId === project.latestRevisionId

  return (
    <article className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 rounded-3xl border border-border bg-surface p-4 shadow-surface sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:p-5">
      <ProjectCoverPreview previewUrl={project.coverPreviewUrl} />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.14em] text-accent-600 uppercase">
          {approved ? 'Макет утверждён' : 'В работе'}
        </p>
        <h2 className="mt-2 truncate font-serif text-2xl">{project.title}</h2>
        <p className="mt-1 text-sm text-ink-500">
          Обновлён {formatDate(project.updatedAt)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="inline-flex min-h-11 items-center rounded-full bg-ink-950 px-4 text-sm font-semibold text-surface"
            to={`/projects/${encodeURIComponent(project.id)}/editor`}
          >
            {approved ? 'Изменить макет' : 'Продолжить'}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-control-border px-4 text-sm font-semibold hover:bg-paper-100"
            to={`/projects/${encodeURIComponent(project.id)}/preview`}
          >
            Предпросмотр
          </Link>
        </div>
      </div>
    </article>
  )
}
