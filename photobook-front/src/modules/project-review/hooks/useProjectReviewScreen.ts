import { useMemo, useState } from 'react'

import { useGetAuthSessionQuery } from '@modules/auth'
import { useGetCatalogVersionQuery } from '@modules/catalog'
import {
  createPhotoPixelSizeResolver,
  createPhotoSourceMap,
  MOCK_MIN_PRINT_DPI,
} from '@modules/editor'
import { useGetProjectAssetsQuery } from '@modules/photo-upload'
import { createLocalPreflightReport } from '@modules/preflight'
import { useGetProjectQuery } from '@modules/project'
import { useOnlineStatus } from '@shared/hooks'

import {
  useCreateApprovalMutation,
  useCreatePreflightRunMutation,
} from '@project-review/api'
import { getReviewErrorMessage } from '@project-review/libs'
import {
  EMPTY_APPROVAL_CHECKLIST,
  isApprovalChecklistComplete,
  type ApprovalChecklistDto,
  type ApprovalChecklistKey,
  type PreflightRunDto,
} from '@project-review/model'

export const useProjectReviewScreen = (projectId: string) => {
  const isOnline = useOnlineStatus()
  const projectQuery = useGetProjectQuery(projectId)
  const sessionQuery = useGetAuthSessionQuery()
  const assetQuery = useGetProjectAssetsQuery(
    { projectId },
    { skip: !sessionQuery.data?.authenticated },
  )
  const catalogVersion = projectQuery.data?.project.catalogVersion ?? ''
  const catalogQuery = useGetCatalogVersionQuery(catalogVersion, {
    skip: !catalogVersion,
  })
  const [checklist, setChecklist] = useState<ApprovalChecklistDto>(
    EMPTY_APPROVAL_CHECKLIST,
  )
  const [warningsAcknowledged, setWarningsAcknowledged] = useState(false)
  const [preflightRun, setPreflightRun] = useState<PreflightRunDto | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createPreflightRun, preflightMutation] =
    useCreatePreflightRunMutation()
  const [createApproval, approvalMutation] = useCreateApprovalMutation()

  const revision = projectQuery.data?.latestRevision
  const document = revision?.document
  const configuration = catalogQuery.data
  const assets = assetQuery.data?.items
  const report = useMemo(
    () =>
      document && configuration
        ? createLocalPreflightReport({
            configuration,
            document,
            minPrintDpi: MOCK_MIN_PRINT_DPI,
            resolvePhotoPixelSize: createPhotoPixelSizeResolver(assets ?? []),
          })
        : null,
    [assets, configuration, document],
  )
  const project = projectQuery.data?.project
  const isLatestApproved = Boolean(
    project && revision && project.approvedRevisionId === revision.id,
  )
  const requiresReapproval = Boolean(
    project?.approvedRevisionId && !isLatestApproved,
  )
  const serverWarnings =
    preflightRun?.issues.filter(({ severity }) => severity === 'warning') ?? []
  const hasServerBlockers =
    preflightRun?.issues.some(({ severity }) => severity === 'blocking') ??
    false
  const isSubmitting = preflightMutation.isLoading || approvalMutation.isLoading
  const canApprove = Boolean(
    isOnline &&
    assetQuery.isSuccess &&
    sessionQuery.data?.authenticated &&
    revision &&
    report?.isReady &&
    isApprovalChecklistComplete(checklist) &&
    !hasServerBlockers &&
    (!serverWarnings.length || warningsAcknowledged) &&
    !isSubmitting &&
    !isLatestApproved,
  )

  const toggleChecklistItem = (key: ApprovalChecklistKey) => {
    setChecklist((current) => ({ ...current, [key]: !current[key] }))
  }

  const approve = async () => {
    const session = sessionQuery.data
    if (!canApprove || !revision || !session?.authenticated) return

    setErrorMessage(null)
    try {
      const run =
        preflightRun?.revisionId === revision.id
          ? preflightRun
          : await createPreflightRun({
              projectId,
              csrfToken: session.csrfToken,
              body: { revisionId: revision.id },
            }).unwrap()
      setPreflightRun(run)

      const warnings = run.issues.filter(
        ({ severity }) => severity === 'warning',
      )
      if (run.issues.some(({ severity }) => severity === 'blocking')) {
        setErrorMessage(
          'Дополнительная проверка нашла ошибки. Вернитесь в редактор.',
        )
        return
      }
      if (warnings.length && !warningsAcknowledged) {
        setErrorMessage(
          'Ознакомьтесь с новыми рекомендациями, подтвердите их и повторите утверждение.',
        )
        return
      }

      await createApproval({
        projectId,
        csrfToken: session.csrfToken,
        body: {
          revisionId: revision.id,
          preflightRunId: run.id,
          checklist,
          acknowledgedWarningIds: warnings.map(({ id }) => id),
        },
      }).unwrap()
      await projectQuery.refetch()
    } catch (error) {
      setErrorMessage(getReviewErrorMessage(error))
      await projectQuery.refetch()
    }
  }

  return {
    assetQuery,
    approval: {
      canApprove,
      checklist,
      errorMessage,
      hasServerBlockers,
      isLatestApproved,
      isOnline,
      isSubmitting,
      requiresReapproval,
      serverWarnings,
      warningsAcknowledged,
      approve,
      setWarningsAcknowledged,
      toggleChecklistItem,
    },
    catalogQuery,
    configuration,
    document,
    project,
    projectQuery,
    photoSources: createPhotoSourceMap(assets ?? []),
    report,
    revision,
    sessionQuery,
  }
}
