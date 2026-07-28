import { Link } from 'react-router'

import type { BookConfigurationBundle } from '@core/book'
import {
  LOCAL_PHOTO_SET_ID,
  useLocalPhotoSelection,
} from '@modules/photo-upload'

import {
  useCreateProjectAccess,
  useCreatePhotoSubmission,
  useCreateProjectFlow,
} from '@create-project/hooks'
import { CreateDetailsStep } from '@create-project-ui/CreateDetailsStep'
import { CreatePhotoAccessState } from '@create-project-ui/CreatePhotoAccessState'
import { CreatePhotoStep } from '@create-project-ui/CreatePhotoStep'
import { CreateProductStep } from '@create-project-ui/CreateProductStep'
import { CreateProjectSummary } from '@create-project-ui/CreateProjectSummary'
import { CreateStepProgress } from '@create-project-ui/CreateStepProgress'
import { CreateTemplateStep } from '@create-project-ui/CreateTemplateStep'

interface CreateProjectWizardProps {
  readonly catalog: BookConfigurationBundle
}

export function CreateProjectWizard({ catalog }: CreateProjectWizardProps) {
  const flow = useCreateProjectFlow(catalog)
  const { selection } = flow
  const access = useCreateProjectAccess()
  const localPhotos = useLocalPhotoSelection()
  const submission = useCreatePhotoSubmission({
    catalogVersion: catalog.catalogVersion,
    csrfToken: access.session?.authenticated ? access.session.csrfToken : null,
    getFile: localPhotos.getFile,
    photos: localPhotos.photos,
    selection,
  })

  const continueLabel = access.isChecking
    ? 'Проверяем вход…'
    : access.isError
      ? 'Повторить проверку'
      : access.isAuthenticated
        ? 'Перейти к фото'
        : 'Войти и перейти к фото'

  return (
    <main className="min-h-dvh bg-paper-50 py-6 sm:py-8">
      <div className="page-container">
        <header className="flex items-center justify-between gap-4">
          <Link className="font-serif text-2xl" to="/">
            Photobook
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-control-border bg-surface px-5 text-sm font-semibold hover:bg-paper-100"
            to="/account"
          >
            Мои проекты
          </Link>
        </header>

        <CreateStepProgress currentStep={selection.step} />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
          <div className="rounded-4xl border border-border bg-surface/80 p-6 shadow-surface sm:p-9 lg:p-10">
            {selection.step === 'product' ? (
              <CreateProductStep
                productSpecs={catalog.productSpecs}
                selectedProductSpecId={selection.productSpec?.id ?? null}
                onContinue={() => flow.goToStep('template')}
                onSelect={flow.selectProduct}
              />
            ) : null}

            {selection.step === 'template' ? (
              <CreateTemplateStep
                categoryTags={selection.categoryTags}
                selectedTemplateId={selection.template?.id ?? null}
                templates={flow.templates}
                onBack={() => flow.goToStep('product')}
                onContinue={() => flow.goToStep('details')}
                onSelectTemplate={flow.selectTemplate}
                onToggleCategory={flow.toggleCategory}
              />
            ) : null}

            {selection.step === 'details' &&
            selection.productSpec &&
            selection.spreadCount !== null ? (
              <CreateDetailsStep
                coverValueId={selection.coverValueId}
                priceEstimate={flow.priceEstimate}
                isPriceError={flow.priceQuery.isError}
                isPriceLoading={flow.priceQuery.isFetching}
                productSpec={selection.productSpec}
                spreadCount={selection.spreadCount}
                continueLabel={continueLabel}
                onBack={() => flow.goToStep('template')}
                onContinue={() =>
                  access.continueToPhotos(() => flow.goToStep('photos'))
                }
                onSelectCover={flow.selectCover}
                onSelectSpreadCount={flow.selectSpreadCount}
                onRetryPrice={() => void flow.priceQuery.refetch()}
              />
            ) : null}

            {selection.step === 'photos' &&
            (!access.isAuthenticated || access.isChecking || access.isError) ? (
              <CreatePhotoAccessState
                isError={access.isError}
                isLoading={access.isChecking}
                onBack={() => flow.goToStep('details')}
                onRetry={access.retry}
                onSignIn={access.signInForPhotos}
              />
            ) : null}

            {selection.step === 'photos' &&
            access.isAuthenticated &&
            !access.isChecking &&
            !access.isError ? (
              <CreatePhotoStep
                failure={submission.failure}
                isCreating={submission.isCreating}
                isOnline={submission.isOnline}
                isReady={submission.isReady}
                isSubmitting={submission.isSubmitting}
                localIssues={localPhotos.issues}
                localPhotos={localPhotos.photos}
                selectedPhotoSetId={selection.photoSetId}
                uploadAllReady={submission.upload.allReady}
                uploadBatchFailed={submission.upload.batchFailed}
                uploadHasStarted={submission.upload.hasStarted}
                uploadItems={submission.upload.items}
                uploadReadyCount={submission.upload.readyCount}
                onAddLocalFiles={(files) => {
                  if (localPhotos.addFiles(files) > 0) {
                    flow.selectPhotoSet(LOCAL_PHOTO_SET_ID)
                  }
                }}
                onBack={() => flow.goToStep('details')}
                onCancelUpload={submission.upload.cancel}
                onClearLocalPhotos={localPhotos.clear}
                onDismissLocalIssues={localPhotos.clearIssues}
                onCreate={() => void submission.submit()}
                onRemoveLocalPhoto={localPhotos.removePhoto}
                onRetryUpload={(id) => void submission.upload.retry(id)}
                onSelectPhotoSet={flow.selectPhotoSet}
                onSignIn={access.signInForPhotos}
              />
            ) : null}
          </div>

          <CreateProjectSummary
            isPriceError={flow.priceQuery.isError}
            isPriceLoading={flow.priceQuery.isFetching}
            localPhotoCount={localPhotos.photos.length}
            priceEstimate={flow.priceEstimate}
            selection={selection}
          />
        </div>
      </div>
    </main>
  )
}
