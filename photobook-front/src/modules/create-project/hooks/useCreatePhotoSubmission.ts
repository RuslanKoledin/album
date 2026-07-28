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
  const saveMutationId = useRef<string | null>(null)
  const [saveDocument, saveState] = useSaveProjectDocumentMutation()
  const creation = useCreateProjectDraft({
    catalogVersion,
    csrfToken,
    selection,
  })
  const upload = useProjectPhotoUpload({ csrfToken, getFile })
  const isLocal = selection.photoSetId === LOCAL_PHOTO_SET_ID

  const submit = async () => {
    if (isLocal && upload.allReady && upload.projectId) {
      if (!project.current || !csrfToken) return
      if (!saveMutationId.current) {
        saveMutationId.current = globalThis.crypto.randomUUID()
      }
      const assetIds = upload.items.flatMap(({ assetId }) =>
        assetId ? [assetId] : [],
      )
      try {
        await saveDocument({
          projectId: upload.projectId,
          csrfToken,
          body: {
            baseRevisionId: project.current.latestRevision.id,
            clientMutationId: saveMutationId.current,
            document: createUploadedPhotoDocument(
              project.current.latestRevision.document,
              assetIds,
            ),
          },
        }).unwrap()
        void navigate(`/projects/${upload.projectId}/editor`)
      } catch {
        // RTK Query state is translated to safe recovery copy below.
      }
      return
    }
    if (isLocal && upload.hasStarted && !upload.batchFailed) return

    const createdProject = upload.projectId ? null : await creation.submit()
    if (createdProject) project.current = createdProject
    const projectId = upload.projectId ?? createdProject?.project.id
    if (!projectId) return

    if (isLocal) {
      await upload.start({ projectId, photos })
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
