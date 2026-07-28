import type {
  ApprovalChecklistDto,
  CreateApprovalArgs,
  CreatePreflightRunArgs,
} from '@project-review/model'

type UnknownRecord = Record<string, unknown>

const CHECKLIST_KEYS: ReadonlyArray<keyof ApprovalChecklistDto> = [
  'namesChecked',
  'datesChecked',
  'captionsChecked',
  'pageOrderChecked',
  'cropUnderstood',
  'readyForPrint',
]

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const isChecklist = (value: unknown): value is ApprovalChecklistDto =>
  isRecord(value) &&
  hasExactKeys(value, CHECKLIST_KEYS) &&
  CHECKLIST_KEYS.every((key) => typeof value[key] === 'boolean')

export const isPreflightRunRequest = (
  value: unknown,
): value is CreatePreflightRunArgs['body'] =>
  isRecord(value) &&
  hasExactKeys(value, ['revisionId']) &&
  isNonEmptyString(value.revisionId)

export const isCreateApprovalRequest = (
  value: unknown,
): value is CreateApprovalArgs['body'] =>
  isRecord(value) &&
  hasExactKeys(value, [
    'revisionId',
    'preflightRunId',
    'checklist',
    'acknowledgedWarningIds',
  ]) &&
  isNonEmptyString(value.revisionId) &&
  isNonEmptyString(value.preflightRunId) &&
  isChecklist(value.checklist) &&
  Array.isArray(value.acknowledgedWarningIds) &&
  value.acknowledgedWarningIds.every(isNonEmptyString)
