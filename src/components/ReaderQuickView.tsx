import { Link } from '@tanstack/react-router'
import { useEffect, useRef, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { descriptionFor, themeFor } from '~/data/commerce'
import { structurePresentation } from '~/data/structure-presentation'
import { useReaderStore } from '~/stores/reader'
import { StructureViewer } from './StructureViewer'

export function ReaderQuickView() {
  const slug = useReaderStore((state) => state.quickView)
  const close = useReaderStore((state) => state.setQuickView)
  const c = slug ? COMPOUND_BY_SLUG[slug] : undefined
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialogPanel = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!c) return
    const previous = document.activeElement as HTMLElement | null
    const priorOverflow = document.documentElement.style.overflow
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(null)
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialogPanel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [])
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(() => closeButton.current?.focus())
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = priorOverflow; previous?.focus?.() }
  }, [c, close])
  if (!c) return null
  const theme = themeFor(c)
  const presentation = structurePresentation(c)
  return <div className="commerce-modal fixed inset-0 z-[75] grid place-items-center p-3 md:p-8" role="dialog" aria-modal="true" aria-label={`${displayName(c)} research preview`}>
    <button className="absolute inset-0 veil w-full" aria-label="Close research preview" onClick={() => close(null)} />
    <section ref={dialogPanel} className="quick-view relative w-full max-w-5xl max-h-[90vh] overflow-y-auto" style={{ '--product': theme.primary, '--product-2': theme.secondary } as CSSProperties}>
      <button ref={closeButton} className="btn btn-sm absolute right-4 top-4 z-20" onClick={() => close(null)}>Close</button>
      <div className="grid md:grid-cols-[1.1fr_.9fr] min-h-[500px]">
        <div className="relative min-h-[320px] quick-view-scene"><StructureViewer compound={c} tint={theme.primary} accent={theme.secondary} /></div>
        <div className="p-7 md:p-10 flex flex-col justify-center min-w-0">
          <p className="label label-cyan">Research preview · {presentation.label}</p>
          <h2 className="display-md text-4xl mt-4">{displayName(c)}</h2>
          <p className="text-sm text-bone/82 leading-relaxed mt-5">{descriptionFor(c)}</p>
          <p className="text-sm muted mt-5">Citation details and scientific conclusions are separate. Open the full record to inspect the sources attached to this identity.</p>
          <Link to="/compound/$slug" params={{ slug: c.slug }} onClick={() => close(null)} className="btn btn-primary mt-7 self-start">Open research record →</Link>
        </div>
      </div>
    </section>
  </div>
}
