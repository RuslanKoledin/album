import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useGetCatalogVersionQuery } from '@modules/catalog'
import { useGetProjectAssetsQuery } from '@modules/photo-upload'
import {
  editorActions,
  mapProjectDetailToEditorProject,
  readEditorDraft,
} from '@editor/model'
import { useGetProjectQuery } from '@modules/project'

export const useEditorProjectBootstrap = (
  projectId: string,
  currentProjectId: string | null,
) => {
  const dispatch = useDispatch()
  const projectQuery = useGetProjectQuery(projectId)
  const assetQuery = useGetProjectAssetsQuery({ projectId })
  const catalogVersion = projectQuery.data?.project.catalogVersion ?? ''
  const catalogQuery = useGetCatalogVersionQuery(catalogVersion, {
    skip: !catalogVersion,
  })

  useEffect(() => {
    if (
      !projectQuery.data ||
      !catalogQuery.data ||
      currentProjectId === projectId
    ) {
      return
    }

    const snapshot = mapProjectDetailToEditorProject(projectQuery.data)
    const draft = readEditorDraft(
      window.localStorage,
      projectId,
      catalogQuery.data,
    )

    if (draft && draft.baseRevisionId === snapshot.revisionId) {
      dispatch(
        editorActions.draftRestored({
          ...draft,
          title: snapshot.title,
        }),
      )
      return
    }

    dispatch(editorActions.projectLoaded(snapshot))
  }, [
    catalogQuery.data,
    currentProjectId,
    dispatch,
    projectId,
    projectQuery.data,
  ])

  return { assetQuery, catalogQuery, catalogVersion, projectQuery }
}
