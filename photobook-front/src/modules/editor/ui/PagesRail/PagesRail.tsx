import type { BookDocumentV1, ThemeSpec } from '@core/book'

import { PageThumbnail } from './PageThumbnail'
import { SpreadActions } from './SpreadActions'

interface PagesRailProps {
  readonly activeSurfaceId: string
  readonly canAddSpread: boolean
  readonly canDuplicateSpread: boolean
  readonly canMoveSpreadAfter: boolean
  readonly canMoveSpreadBefore: boolean
  readonly canRemoveSpread: boolean
  readonly document: BookDocumentV1
  readonly isAtMaximumSpreadCount: boolean
  readonly isAtMinimumSpreadCount: boolean
  readonly mobileVisible: boolean
  readonly onAddSpread: () => void
  readonly onDuplicateSpread: () => void
  readonly onMoveSpreadAfter: () => void
  readonly onMoveSpreadBefore: () => void
  readonly onRemoveSpread: () => void
  readonly onSelectSurface: (surfaceId: string) => void
  readonly photoSources: Readonly<Record<string, string>>
  readonly theme: ThemeSpec | undefined
  readonly warningSurfaceIds: ReadonlySet<string>
}

export function PagesRail({
  activeSurfaceId,
  canAddSpread,
  canDuplicateSpread,
  canMoveSpreadAfter,
  canMoveSpreadBefore,
  canRemoveSpread,
  document,
  isAtMaximumSpreadCount,
  isAtMinimumSpreadCount,
  mobileVisible,
  onAddSpread,
  onDuplicateSpread,
  onMoveSpreadAfter,
  onMoveSpreadBefore,
  onRemoveSpread,
  onSelectSurface,
  photoSources,
  theme,
  warningSurfaceIds,
}: PagesRailProps) {
  const surfaces = [
    { id: 'cover', label: 'Обложка', surface: document.cover },
    ...document.spreads.map((spread, index) => ({
      id: spread.id,
      label: `${index * 2 + 2}–${index * 2 + 3}`,
      surface: spread,
    })),
  ]
  const activeSpreadIndex = document.spreads.findIndex(
    ({ id }) => id === activeSurfaceId,
  )
  const activeSpreadLabel =
    activeSpreadIndex >= 0
      ? `Разворот ${activeSpreadIndex * 2 + 2}–${activeSpreadIndex * 2 + 3}`
      : undefined

  return (
    <aside
      className={`${mobileVisible ? 'flex' : 'hidden'} order-2 min-w-0 flex-col border-t border-border bg-paper-50 pb-20 md:order-none md:row-span-2 md:flex md:min-h-0 md:border-t-0 md:border-r md:pb-0 lg:row-auto`}
    >
      <div className="hidden px-4 pt-5 pb-3 md:block">
        <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-ink-500 uppercase">
          Страницы
        </p>
        <p className="mt-1 text-xs text-ink-700">
          Разворотов: {document.spreads.length}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-3 md:block md:space-y-3 md:overflow-y-auto md:p-4 md:pt-1">
        {surfaces.map(({ id, label, surface }) => (
          <PageThumbnail
            active={activeSurfaceId === id}
            key={id}
            label={label}
            photoSources={photoSources}
            surface={surface}
            theme={theme}
            warning={warningSurfaceIds.has(id)}
            onSelect={() => onSelectSurface(id)}
          />
        ))}
      </div>

      <SpreadActions
        activeSpreadLabel={activeSpreadLabel}
        canAdd={canAddSpread}
        canDuplicate={canDuplicateSpread}
        canMoveAfter={canMoveSpreadAfter}
        canMoveBefore={canMoveSpreadBefore}
        canRemove={canRemoveSpread}
        isAtMaximum={isAtMaximumSpreadCount}
        isAtMinimum={isAtMinimumSpreadCount}
        key={activeSurfaceId}
        onAdd={onAddSpread}
        onDuplicate={onDuplicateSpread}
        onMoveAfter={onMoveSpreadAfter}
        onMoveBefore={onMoveSpreadBefore}
        onRemove={onRemoveSpread}
      />
    </aside>
  )
}
