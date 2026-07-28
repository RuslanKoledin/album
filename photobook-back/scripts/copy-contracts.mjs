import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const source = path.join(root, 'packages', 'contracts', 'artifacts')
const target = path.join(root, 'build', 'packages', 'contracts', 'artifacts')

await rm(target, { force: true, recursive: true })
await mkdir(path.dirname(target), { recursive: true })
await cp(source, target, { recursive: true })
