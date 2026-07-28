export async function startMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return

  const { mockWorker } = await import('./browser')

  await mockWorker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}
