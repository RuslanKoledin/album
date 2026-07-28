import { Link } from 'react-router'
import { LuArrowLeft } from 'react-icons/lu'

import { CenteredMessagePage } from '@shared/ui'

import { useProjectReviewScreen } from '@project-review/hooks'
import { ApprovalPanel } from '@project-review-ui/ApprovalPanel'
import { PreviewBookViewer } from '@project-review-ui/PreviewBookViewer'
import { getReviewSurfaces } from '@project-review/libs'

import { ApprovedRevisionPanel } from './ApprovedRevisionPanel'

interface ProjectReviewScreenProps {
  readonly projectId: string
}

export function ProjectReviewScreen({ projectId }: ProjectReviewScreenProps) {
  const screen = useProjectReviewScreen(projectId)
  const { assetQuery, catalogQuery, projectQuery, sessionQuery } = screen

  if (
    projectQuery.isLoading ||
    catalogQuery.isLoading ||
    sessionQuery.isLoading ||
    assetQuery.isLoading
  ) {
    return (
      <CenteredMessagePage
        description="Загружаем сохранённую версию и готовим её к проверке."
        eyebrow="Предпросмотр"
        title="Собираем книгу"
      />
    )
  }

  if (sessionQuery.data && !sessionQuery.data.authenticated) {
    return (
      <CenteredMessagePage
        description="Авторизация нужна, чтобы утверждение было связано с владельцем проекта."
        eyebrow="Предпросмотр"
        title="Войдите, чтобы продолжить"
      >
        <Link
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface"
          to={`/login?returnTo=${encodeURIComponent(`/projects/${projectId}/preview`)}`}
        >
          Войти
        </Link>
      </CenteredMessagePage>
    )
  }

  if (
    projectQuery.isError ||
    catalogQuery.isError ||
    sessionQuery.isError ||
    assetQuery.isError ||
    !screen.document ||
    !screen.configuration ||
    !screen.project ||
    !screen.revision ||
    !screen.report
  ) {
    return (
      <CenteredMessagePage
        description="Не удалось загрузить сохранённый макет. Проверьте подключение и попробуйте ещё раз."
        eyebrow="Предпросмотр"
        title="Книга пока не открылась"
      >
        <button
          className="mt-8 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => {
            void projectQuery.refetch()
            void assetQuery.refetch()
          }}
        >
          Повторить
        </button>
      </CenteredMessagePage>
    )
  }

  const theme = screen.configuration.themeSpecs.find(
    ({ id }) => id === screen.document?.productSelection.themeId,
  )

  return (
    <main className="min-h-dvh bg-paper-100 pb-16">
      <header className="border-b border-border bg-surface/90">
        <div className="page-container flex min-h-16 items-center gap-3">
          <Link
            aria-label="Вернуться в редактор"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-surface hover:bg-paper-100"
            to={`/projects/${encodeURIComponent(projectId)}/editor`}
          >
            <LuArrowLeft aria-hidden="true" size={20} />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-500">Название проекта</p>
            <h1 className="truncate text-sm font-semibold sm:text-base">
              {screen.project.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="page-container pt-8 sm:pt-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
            Сохранённая версия №{screen.revision.revisionNumber}
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Посмотрите книгу целиком
          </h2>
          <p className="text-ink-600 mt-4 leading-7">
            Проверьте обложку, развороты, тексты и кадрирование. Здесь нельзя
            случайно изменить макет — для правок вернитесь в редактор.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
          <PreviewBookViewer
            document={screen.document}
            photoSources={screen.photoSources}
            theme={theme}
          />
          {screen.approval.isLatestApproved ? (
            <ApprovedRevisionPanel
              projectId={projectId}
              revisionNumber={screen.revision.revisionNumber}
            />
          ) : (
            <ApprovalPanel
              canApprove={screen.approval.canApprove}
              checklist={screen.approval.checklist}
              editorPath={`/projects/${encodeURIComponent(projectId)}/editor`}
              errorMessage={screen.approval.errorMessage}
              isOnline={screen.approval.isOnline}
              isSubmitting={screen.approval.isSubmitting}
              report={screen.report}
              requiresReapproval={screen.approval.requiresReapproval}
              revisionNumber={screen.revision.revisionNumber}
              reviewSurfaces={getReviewSurfaces(screen.document)}
              serverWarnings={screen.approval.serverWarnings}
              warningsAcknowledged={screen.approval.warningsAcknowledged}
              onApprove={() => void screen.approval.approve()}
              onToggleChecklist={screen.approval.toggleChecklistItem}
              onWarningsAcknowledgedChange={
                screen.approval.setWarningsAcknowledged
              }
            />
          )}
        </div>
      </div>
    </main>
  )
}
