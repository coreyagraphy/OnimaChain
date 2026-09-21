import { useEffect, type ReactNode } from 'react'

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

/**
 * Provenance drawer: looking behind the visible conclusion.
 * While open, <body data-depth-open="1"> pushes the page (the interpretation) backward and dims it;
 * the drawer (the evidence) comes forward as a layered glass surface. The 3D scene keeps moving behind.
 */
export function ProvenanceDrawer({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.dataset.depthOpen = '1'
    return () => { window.removeEventListener('keydown', onKey); delete document.body.dataset.depthOpen }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 veil" onClick={onClose} aria-label="Close" />
      <aside className="absolute right-0 top-0 h-full w-[min(92vw,500px)] glass border-l p-6 md:p-8 overflow-y-auto drawer-in" data-lenis-prevent style={{ borderRadius: 0 }}>
        <div className="relative flex items-center justify-between">
          <p className="label label-cyan">Behind the scenes · where this comes from</p>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        <h3 className="relative display-md text-xl md:text-2xl mt-4">{title}</h3>
        <div className="relative mt-4 text-sm prose-block">{children}</div>
        <p className="relative mt-8 mono text-[11px] text-bone/40 border-t hairline pt-4">What you see on the page comes only from the sources listed here. Nothing is made up to fill space.</p>
      </aside>
    </div>
  )
}
