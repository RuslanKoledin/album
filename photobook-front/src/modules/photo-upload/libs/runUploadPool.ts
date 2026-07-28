const MAX_CONCURRENT_UPLOADS = 3

export async function runUploadPool<T>(
  items: readonly T[],
  run: (item: T) => Promise<void>,
) {
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex]
      nextIndex += 1
      if (item) await run(item)
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, items.length) },
      worker,
    ),
  )
}
