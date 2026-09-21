import { useEffect, type ReactNode } from 'react'

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

/** Slide-over that shows how a derived data point was created. */
export function ProvenanceDrawer({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-obsidian/70" onClick={onClose} aria-label="Close" />
      <aside className="absolute right-0 top-0 h-full w-[min(92vw,480px)] bg-graphite border-l hairline p-6 overflow-y-auto fade-up" data-lenis-prevent>
        <div className="flex items-center justify-between">
          <p className="label label-cyan">Provenance</p>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        <h3 className="display-md text-xl mt-3">{title}</h3>
        <div className="mt-4 text-sm prose-block">{children}</div>
      </aside>
    </div>
  )
}
