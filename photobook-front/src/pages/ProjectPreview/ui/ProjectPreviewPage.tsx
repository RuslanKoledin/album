import { ProjectReviewScreen } from '@modules/project-review'

interface ProjectPreviewPageProps {
  readonly projectId: string
}

export function ProjectPreviewPage({ projectId }: ProjectPreviewPageProps) {
  return <ProjectReviewScreen projectId={projectId} />
}
