export { meta } from '@pages/ProjectPreview'
import { ProjectPreviewPage } from '@pages/ProjectPreview'

import type { Route } from './+types/project-preview'

export default function ProjectPreviewRoute({ params }: Route.ComponentProps) {
  return <ProjectPreviewPage projectId={params.projectId} />
}
