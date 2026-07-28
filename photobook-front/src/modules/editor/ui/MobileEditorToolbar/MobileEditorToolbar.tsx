import { FiBookOpen, FiGrid, FiImage, FiType } from 'react-icons/fi'

import type {
  MobileEditorTool,
  MobileEditorToolAvailability,
} from '@editor/model'
import { MOBILE_EDITOR_TOOL_LABELS } from '@editor/model'

import { MobileToolButton } from './MobileToolButton'

interface MobileEditorToolbarProps {
  readonly activeTool: MobileEditorTool
  readonly availability: MobileEditorToolAvailability
  readonly onSelectTool: (tool: MobileEditorTool) => void
}

export function MobileEditorToolbar({
  activeTool,
  availability,
  onSelectTool,
}: MobileEditorToolbarProps) {
  return (
    <nav
      aria-label="Инструменты редактора"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-border bg-surface/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-0.25rem_1rem_rgb(45_41_38_/_0.08)] backdrop-blur md:hidden"
    >
      <MobileToolButton
        active={activeTool === 'pages'}
        disabled={!availability.pages}
        icon={<FiBookOpen />}
        label={MOBILE_EDITOR_TOOL_LABELS.pages}
        onSelect={() => onSelectTool('pages')}
      />
      <MobileToolButton
        active={activeTool === 'photo'}
        disabled={!availability.photo}
        icon={<FiImage />}
        label={MOBILE_EDITOR_TOOL_LABELS.photo}
        onSelect={() => onSelectTool('photo')}
      />
      <MobileToolButton
        active={activeTool === 'layout'}
        disabled={!availability.layout}
        icon={<FiGrid />}
        label={MOBILE_EDITOR_TOOL_LABELS.layout}
        onSelect={() => onSelectTool('layout')}
      />
      <MobileToolButton
        active={activeTool === 'text'}
        disabled={!availability.text}
        icon={<FiType />}
        label={MOBILE_EDITOR_TOOL_LABELS.text}
        onSelect={() => onSelectTool('text')}
      />
    </nav>
  )
}
