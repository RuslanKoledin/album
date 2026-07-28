import { describe, expect, it } from 'vitest'

import { createDemoProjectDetail } from '@mocks/project'

import { mapProjectDetailToEditorProject } from './mapProjectDetailToEditorProject'

describe('mapProjectDetailToEditorProject', () => {
  it('maps the server revision into an independent editor snapshot', () => {
    const project = createDemoProjectDetail()

    const result = mapProjectDetailToEditorProject(project)

    expect(result).toMatchObject({
      projectId: 'demo-project',
      revisionId: 'mock-revision-demo-01',
      title: 'Семейная история',
    })
    expect(result.document).toEqual(project.latestRevision.document)
    expect(result.document).not.toBe(project.latestRevision.document)
    expect(result.document.cover).not.toBe(
      project.latestRevision.document.cover,
    )
  })
})
