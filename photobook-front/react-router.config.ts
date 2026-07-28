import type { Config } from '@react-router/dev/config'

export default {
  appDirectory: 'src/app',
  buildDirectory: 'build',
  ssr: false,
  prerender: ['/', '/books', '/help'],
} satisfies Config
