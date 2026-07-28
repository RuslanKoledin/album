import { useDispatch } from 'react-redux'

import type { BookConfigurationBundle, BookDocumentV1 } from '@core/book'
import {
  createLocalPreflightReport,
  type LocalPreflightIssue,
  type ResolvePhotoPixelSize,
} from '@modules/preflight'

import { MOCK_MIN_PRINT_DPI } from '@editor/libs'
import { editorActions, type MobileEditorTool } from '@editor/model'

interface UseEditorPreflightInput {
  readonly configuration: BookConfigurationBundle | undefined
  readonly document: BookDocumentV1 | undefined
  readonly onClearPhotoAdjustmentPreview: () => void
  readonly onSelectMobileTool: (tool: MobileEditorTool) => void
  readonly resolvePhotoPixelSize: ResolvePhotoPixelSize
}

export const useEditorPreflight = ({
  configuration,
  document,
  onClearPhotoAdjustmentPreview,
  onSelectMobileTool,
  resolvePhotoPixelSize,
}: UseEditorPreflightInput) => {
  const dispatch = useDispatch()
  const report =
    document && configuration
      ? createLocalPreflightReport({
          configuration,
          document,
          minPrintDpi: MOCK_MIN_PRINT_DPI,
          resolvePhotoPixelSize,
        })
      : null
  const surfaceIds = new Set(
    report?.issues.flatMap(({ surfaceId }) => (surfaceId ? [surfaceId] : [])) ??
      [],
  )

  const selectIssue = (issue: LocalPreflightIssue) => {
    if (!issue.surfaceId) return

    onClearPhotoAdjustmentPreview()
    onSelectMobileTool(issue.elementKind ?? 'pages')
    dispatch(editorActions.surfaceSelected(issue.surfaceId))
    if (issue.elementId && issue.elementKind) {
      dispatch(
        editorActions.elementSelected({
          id: issue.elementId,
          kind: issue.elementKind,
        }),
      )
    }
  }

  return { report, selectIssue, surfaceIds }
}
