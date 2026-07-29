import { useRef } from 'react'
import { useNavigate } from 'react-router'

import {
  useSaveProjectDocumentMutation,
  type ProjectDetailDto,
} from '@modules/project'
import {
  createUploadedPhotoDocument,
  getCreateProjectFailure,
} from '@create-project/libs'
import {
  LOCAL_PHOTO_SET_ID,
  useProjectPhotoUpload,
  type LocalPhotoPreview,
} from '@modules/photo-upload'

import type { CreateProjectSelection } from '@create-project/model'

import { useCreateProjectDraft } from './useCreateProjectDraft'

interface SaveIdentity {
  readonly fingerprint: string
  readonly key: string
}

interface UseCreatePhotoSubmissionArgs {
  readonly catalogVersion: string
  readonly csrfToken: string | null
  readonly getFile: (id: string) => File | undefined
  readonly photos: readonly LocalPhotoPreview[]
  readonly selection: CreateProjectSelection
}

export function useCreatePhotoSubmission({
  catalogVersion,
  csrfToken,
  getFile,
  photos,
  selection,
}: UseCreatePhotoSubmissionArgs) {
  const navigate = useNavigate()
  const project = useRef<ProjectDetailDto | null>(null)
  const saveIdentity = useRef<SaveIdentity | null>(null)
  const [saveDocument, saveState] = useSaveProjectDocumentMutation()
  const creation = useCreateProjectDraft({
    catalogVersion,
    csrfToken,
    selection,
  })
  const upload = useProjectPhotoUpload({ csrfToken, getFile })
  const isLocal = selection.photoSetId === LOCAL_PHOTO_SET_ID

  const saveUploadedAssets = async (
    projectId: string,
    assetIds: readonly string[],
  ) => {
    if (!project.current || !csrfToken) return false
    const baseRevisionId = project.current.latestRevision.id
    const fingerprint = JSON.stringify({ assetIds, baseRevisionId, projectId })
    if (saveIdentity.current?.fingerprint !== fingerprint) {
      saveIdentity.current = {
        fingerprint,
        key: globalThis.crypto.randomUUID(),
      }
    }

    try {
      await saveDocument({
        projectId,
        csrfToken,
        body: {
          baseRevisionId,
          clientMutationId: saveIdentity.current.key,
          document: createUploadedPhotoDocument(
            project.current.latestRevision.document,
            assetIds,
          ),
        },
      }).unwrap()
      void navigate(`/projects/${projectId}/editor`)
      return true
    } catch {
      // RTK Query state is translated to safe recovery copy below.
      return false
    }
  }

  const submit = async () => {
    if (isLocal && upload.allReady && upload.projectId) {
      const assetIds = upload.items.flatMap(({ assetId }) =>
        assetId ? [assetId] : [],
      )
      await saveUploadedAssets(upload.projectId, assetIds)
      return
    }
    if (isLocal && upload.hasStarted && !upload.batchFailed) return

    const createdProject = upload.projectId ? null : await creation.submit()
    if (createdProject) project.current = createdProject
    const projectId = upload.projectId ?? createdProject?.project.id
    if (!projectId) return

    if (isLocal) {
      const result = await upload.start({ projectId, photos })
      if (result.kind === 'ready') {
        await saveUploadedAssets(projectId, result.assetIds)
      }
      return
    }
    void navigate(`/projects/${projectId}/editor`)
  }

  return {
    failure: saveState.isError
      ? getCreateProjectFailure(saveState.error)
      : creation.failure,
    isCreating: creation.isCreating,
    isOnline: creation.isOnline,
    isReady: creation.isReady && (!isLocal || photos.length > 0),
    isSubmitting: creation.isCreating || upload.isBusy || saveState.isLoading,
    submit,
    upload,
  }
}
