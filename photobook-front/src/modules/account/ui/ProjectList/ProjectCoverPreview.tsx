import { LuBookOpen } from 'react-icons/lu'

interface ProjectCoverPreviewProps {
  readonly previewUrl: string | null
}

export function ProjectCoverPreview({ previewUrl }: ProjectCoverPreviewProps) {
  return (
    <div className="aspect-square rounded-2xl bg-cover-sand p-2 shadow-surface">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-surface/70 bg-cover-linen p-1.5">
        {previewUrl ? (
          <img
            alt=""
            className="min-h-0 flex-1 rounded-lg object-cover"
            decoding="async"
            loading="lazy"
            src={previewUrl}
          />
        ) : (
          <span className="text-ink-400 flex min-h-0 flex-1 items-center justify-center rounded-lg bg-paper-100">
            <LuBookOpen aria-hidden="true" size={28} />
          </span>
        )}
        <span className="mt-1 block truncate text-center font-serif text-[9px] text-ink-700">
          Фотокнига
        </span>
      </div>
    </div>
  )
}
