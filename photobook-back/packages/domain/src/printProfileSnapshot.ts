import { createJsonHash } from './canonicalJson.js'
import type {
  PrintProfileSnapshot,
  PrintProfileV1,
} from './printProfile.types.js'
import { assertValidPrintProfile } from './printProfileValidation.js'

export function createPrintProfileSnapshot(
  profile: PrintProfileV1,
): PrintProfileSnapshot {
  assertValidPrintProfile(profile)
  const hash = createJsonHash(profile)

  return {
    contentHash: `sha256:${hash}`,
    profile: structuredClone(profile),
    renderProfileVersion: `rpf_${hash}`,
  }
}
