export type MobileEditorTool = 'pages' | 'photo' | 'layout' | 'text'

export const MOBILE_EDITOR_TOOL_LABELS: Record<MobileEditorTool, string> = {
  pages: 'Страницы',
  photo: 'Фото',
  layout: 'Макет',
  text: 'Текст',
}

export interface MobileEditorToolAvailability {
  readonly layout: boolean
  readonly pages: boolean
  readonly photo: boolean
  readonly text: boolean
}
