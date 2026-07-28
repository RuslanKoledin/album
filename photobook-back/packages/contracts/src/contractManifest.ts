export interface ContractSourceManifest {
  readonly copiedAt: string
  readonly sourceDigest: string
  readonly sourceDirectory: string
}

export const CONTRACT_ARTIFACTS_DIRECTORY = new URL(
  '../artifacts/',
  import.meta.url,
)
