const DB_NAME = 'photobook-mock-upload-blobs'
const DB_VERSION = 1
const STORE_NAME = 'uploads'

declare global {
  var __PHOTOBOOK_MOCK_UPLOAD_BYTES__: Map<string, Uint8Array> | undefined
}

const getMemoryStore = () => {
  globalThis.__PHOTOBOOK_MOCK_UPLOAD_BYTES__ ??= new Map()
  return globalThis.__PHOTOBOOK_MOCK_UPLOAD_BYTES__
}

const hasIndexedDb = () => typeof indexedDB !== 'undefined'

const openUploadDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })

const runStoreTransaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) => {
  const db = await openUploadDb()

  return await new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const request = operation(transaction.objectStore(STORE_NAME))

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    transaction.oncomplete = () => db.close()
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
    transaction.onabort = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

const normalizeBytes = (value: unknown) => {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  return null
}

export const putMockUploadBytes = async (
  assetId: string,
  bytes: Uint8Array,
) => {
  const storedBytes = bytes.slice()
  getMemoryStore().set(assetId, storedBytes)

  if (!hasIndexedDb()) return

  await runStoreTransaction('readwrite', (store) =>
    store.put(storedBytes, assetId),
  )
}

export const getMockUploadBytes = async (assetId: string) => {
  const memoryBytes = getMemoryStore().get(assetId)
  if (memoryBytes) return memoryBytes.slice()

  if (!hasIndexedDb()) return null

  const result = await runStoreTransaction('readonly', (store) =>
    store.get(assetId),
  )
  const storedBytes = normalizeBytes(result)
  if (!storedBytes) return null

  getMemoryStore().set(assetId, storedBytes)
  return storedBytes.slice()
}

export const hasMockUploadBytes = async (assetId: string) =>
  (await getMockUploadBytes(assetId)) !== null

export const clearMockUploadBytes = async () => {
  getMemoryStore().clear()

  if (!hasIndexedDb()) return

  await runStoreTransaction('readwrite', (store) => store.clear())
}
