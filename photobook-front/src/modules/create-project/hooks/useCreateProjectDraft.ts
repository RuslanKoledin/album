import { useEffect, useMemo, useRef } from 'react'

import { useCreateProjectMutation } from '@modules/project'
import { useOnlineStatus } from '@shared/hooks'

import {
  getCreateProjectFailure,
  getCreateProjectRequest,
} from '@create-project/libs'
import type { CreateProjectSelection } from '@create-project/model'

interface UseCreateProjectDraftArgs {
  readonly catalogVersion: string
  readonly csrfToken: string | null
  readonly selection: CreateProjectSelection
}

interface IdempotencyRecord {
  readonly fingerprint: string
  readonly key: string
}

export function useCreateProjectDraft({
  catalogVersion,
  csrfToken,
  selection,
}: UseCreateProjectDraftArgs) {
  const isOnline = useOnlineStatus()
  const [createProject, { error, isError, isLoading: isCreating, reset }] =
    useCreateProjectMutation()
  const idempotency = useRef<IdempotencyRecord | null>(null)
  const request = useMemo(
    () => getCreateProjectRequest(selection, catalogVersion),
    [catalogVersion, selection],
  )
  const fingerprint = request ? JSON.stringify(request) : ''

  useEffect(() => {
    reset()
  }, [fingerprint, reset])

  const submit = async () => {
    if (!request || !csrfToken || !isOnline || isCreating) return null
    if (idempotency.current?.fingerprint !== fingerprint) {
      idempotency.current = {
        fingerprint,
        key: globalThis.crypto.randomUUID(),
      }
    }

    try {
      return await createProject({
        body: request,
        csrfToken,
        idempotencyKey: idempotency.current.key,
      }).unwrap()
    } catch {
      return null
    }
  }

  return {
    failure: isError ? getCreateProjectFailure(error) : null,
    isCreating,
    isOnline,
    isReady: request !== null && csrfToken !== null,
    submit,
  }
}
