import { EditorScreen } from '@modules/editor'

interface ProjectEditorPageProps {
  readonly projectId: string
}

export function ProjectEditorPage({ projectId }: ProjectEditorPageProps) {
  return <EditorScreen projectId={projectId} />
}
