export { meta } from '@pages/ProjectEditor'
import { ProjectEditorPage } from '@pages/ProjectEditor'

import type { Route } from './+types/project-editor'

export default function ProjectEditorRoute({ params }: Route.ComponentProps) {
  return <ProjectEditorPage projectId={params.projectId} />
}
