import { createProjectHandler } from './createProjectHandler'
import { getProjectHandler } from './getProjectHandler'
import { getProjectsHandler } from './getProjectsHandler'
import { saveProjectDocumentHandler } from './saveProjectDocumentHandler'

export const projectHandlers = [
  getProjectsHandler,
  getProjectHandler,
  createProjectHandler,
  saveProjectDocumentHandler,
]
