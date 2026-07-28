import { rm } from 'node:fs/promises'
import path from 'node:path'

const buildDirectory = path.resolve(import.meta.dirname, '..', 'build')

await rm(buildDirectory, { force: true, recursive: true })
