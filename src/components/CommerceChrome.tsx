import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { descriptionFor, themeFor, wordmarkStyle } from '~/data/commerce'
import { defaultVariantId, priceFor, variantFor } from '~/data/variants'
import { DOMAIN_BY_ID } from '~/data/domains'
import { buildChain } from '~/scenes/chain/geometry'
import { SequenceSVG } from './SequenceSVG'
import { useCommerceStore } from '~/stores/commerce'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { useFitText } from '~/motion/useFitText'
import { MoveHint } from './MoveHint'
import type { Drag } from '~/scenes/quick/QuickScene'
import { brand } from '~/brand'
import { structurePresentation } from '~/data/structure-presentation'
import { CompositeStructure } from './CompositeStructure'
import { getLenis } from '~/motion/lenis'
import { StrengthPrice } from './StrengthPrice'

export function CommerceChrome() {
  const hydrate = useCommerceStore((s) => s.hydrate)
  useEffect(() => hydrate(), [hydrate])
  return <><CartDrawer /><QuickView /><MolecularCursor /></>
}

function CartDrawer() {
  const { items, cartOpen, setCartOpen, setQuantity, remove } = useCommerceStore()
  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [cartOpen, setCartOpen])
  if (!cartOpen) return null
  return (
    <div className="commerce-modal fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={brand.cartLabel}>
      <button className="absolute inset-0 veil w-full" aria-label="Close cart" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer drawer-in absolute right-0 top-0 h-full w-full max-w-[480px] p-5 md:p-7 flex flex-col" data-lenis-prevent>
        <header className="flex items-center justify-between border-b hairline pb-5">
          <div><p className="label label-cyan">Your selection</p><h2 className="display-md text-3xl mt-1">Cart</h2></div>
          <button className="btn btn-sm" onClick={() => setCartOpen(false)} aria-label="Close cart">Close</button>
        </header>
        {items.length === 0 ? (
          <div className="grow grid place-items-center text-center py-12">
            <div><div className="empty-orbit mx-auto" aria-hidden /><h3 className="display-md text-2xl mt-8">Your cart is waiting.</h3><p className="muted text-sm mt-3 max-w-xs">Add a compound from the collection to begin.</p><button className="btn btn-primary mt-7" onClick={() => setCartOpen(false)}>Continue shopping</button></div>
          </div>
        ) : (
          <>
            <div className="grow overflow-y-auto py-5 grid content-start gap-3">
              {items.map((line) => {
                const c = COMPOUND_BY_SLUG[line.slug]
                if (!c) return null
                const theme = themeFor(c), geometry = c.sequence ? buildChain(c) : null
                const presentation = structurePresentation(c)
                return (
                  <div key={`${line.slug}:${line.variantId ?? ''}`} className="cart-line" style={{ '--product': theme.primary } as CSSProperties}>
                    {presentation.kind === 'blend' ? <div className="w-20 h-20 flex shrink-0">{(['bpc-157', 'tb-500'] as const).map((slug) => <SequenceSVG key={slug} geometry={buildChain(COMPOUND_BY_SLUG[slug])} tint={themeFor(COMPOUND_BY_SLUG[slug]).primary} className="w-10 h-20 p-1" />)}</div> : geometry ? <SequenceSVG geometry={geometry} tint={theme.primary} className="w-20 h-20 p-2" /> : <div className="w-20 h-20 grid place-items-center text-[10px] text-bone/60 text-center">No model</div>}
                    <div className="min-w-0 grow">
                      <Link to="/compound/$slug" params={{ slug: c.slug }} onClick={() => setCartOpen(false)} className="display-md text-lg hover:text-cyan">{displayName(c)}</Link>
                      <p className="mono text-[12px] mt-1" style={{ color: theme.primary }}>{variantFor(c.slug, line.variantId)?.label ?? 'Dosage pending'} · {priceFor(c.slug, line.variantId)} <span className="text-bone/45">placeholder</span></p>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="quantity-btn" onClick={() => setQuantity(c.slug, line.quantity - 1, line.variantId)} aria-label={`Decrease ${displayName(c)} quantity`}>−</button>
                        <span className="mono text-sm w-6 text-center">{line.quantity}</span>
                        <button className="quantity-btn" onClick={() => setQuantity(c.slug, line.quantity + 1, line.variantId)} aria-label={`Increase ${displayName(c)} quantity`}>+</button>
                        <button className="text-[11px] text-bone/45 hover:text-bone underline ml-auto" onClick={() => remove(c.slug, line.variantId)}>Remove</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <footer className="border-t hairline pt-5">
              <div className="flex justify-between items-end"><span className="label">Subtotal</span><strong className="display-md text-2xl">Pricing pending</strong></div>
              <p className="text-[12px] muted mt-2">Online ordering is not open yet. Prices and shipping details will appear here before you can pay.</p>
              <button className="btn btn-primary w-full justify-center mt-5 opacity-65" disabled title="Online ordering is not open yet">Checkout unavailable</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

const QuickScene = lazy(() => import('~/scenes/quick/QuickScene').then((m) => ({ default: m.QuickScene })))

function QuickView() {
  const slug = useCommerceStore((s) => s.quickView)
  const setQuickView = useCommerceStore((s) => s.setQuickView)
  const add = useCommerceStore((s) => s.add)
  const canvasOk = useCanvasAllowed()
  const c = slug ? COMPOUND_BY_SLUG[slug] : undefined
  const presentation = c ? structurePresentation(c) : null
  const geometry = useMemo(() => c ? buildChain(c) : null, [c])
  const drag = useRef<Drag>({ active: false, vx: 0, vy: 0, dx: 0, dy: 0 })
  const last = useRef({ x: 0, y: 0, t: 0 })
  const [touched, setTouched] = useState(false)
  const [variantId, setVariantId] = useState<string | null>(null)
  const nameRef = useFitText<HTMLHeadingElement>([slug])
  const reduced = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    if (!c) return
    setTouched(false)
    setVariantId(defaultVariantId(c.slug))
    drag.current = { active: false, vx: 0, vy: 0, dx: 0, dy: 0 }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setQuickView(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [c, setQuickView])
  useEffect(() => {
    if (!c) return
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    getLenis()?.stop()
    return () => { document.documentElement.style.overflow = previousOverflow; getLenis()?.start() }
  }, [!!c])
  if (!c || !geometry) return null
  const theme = themeFor(c), domain = DOMAIN_BY_ID[c.domain]
  const down = (e: React.PointerEvent) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); drag.current.active = true; last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp }; setTouched(true) }
  const move = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    e.preventDefault(); e.stopPropagation()
    const dx = e.clientX - last.current.x, dy = e.clientY - last.current.y, dt = Math.max(8, e.timeStamp - last.current.t)
    drag.current.dx += dx; drag.current.dy += dy; drag.current.vx = (dx / dt) * 60; drag.current.vy = (dy / dt) * 60
    last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp }
  }
  const up = (e: React.PointerEvent) => { drag.current.active = false; drag.current.dx = 0; drag.current.dy = 0; if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) }
  return (
    <div className="commerce-modal fixed inset-0 z-[75] grid place-items-center p-3 md:p-8" role="dialog" aria-modal="true" aria-label={`${displayName(c)} quick view`}>
      <button className="absolute inset-0 veil w-full" aria-label="Close quick view" onClick={() => setQuickView(null)} />
      <section className="quick-view relative w-full max-w-5xl overflow-hidden" style={{ '--product': theme.primary, '--product-2': theme.secondary } as CSSProperties} data-lenis-prevent>
        <button className="btn btn-sm absolute right-4 top-4 z-20" onClick={() => setQuickView(null)}>Close</button>
        <div className="grid md:grid-cols-[1.1fr_.9fr] min-h-[560px]">
          <div className="relative min-h-[320px] quick-view-scene" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} style={{ touchAction: 'none', cursor: 'grab' }}>
            {presentation?.kind === 'blend' ? <CompositeStructure dedicated /> : !c.sequence ? <div className="structure-unavailable" role="img" aria-label={presentation?.detail}><strong>{presentation?.label}</strong><p>{presentation?.detail}</p></div> : canvasOk ? (
              <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={7.5} dpr={[1, 1.25]} preserveDrawingBuffer={false}>
                <Suspense fallback={null}><QuickScene slug={c.slug} tint={theme.primary} accent={theme.secondary} drag={drag} reduced={reduced} /></Suspense>
              </Lod0Canvas>
            ) : <div className="quick-molecule absolute inset-0"><SequenceSVG geometry={geometry} tint={theme.primary} className="w-full h-full p-12 md:p-16" /></div>}
            {c.sequence && <MoveHint hidden={touched} />}
          </div>
          <div className="p-7 md:p-10 flex flex-col justify-center min-w-0">
            <p className="label" style={{ color: theme.primary }}>{domain.name}</p>
            <h2 ref={nameRef} className="wordmark text-[clamp(2.4rem,6vw,5.5rem)] mt-3 whitespace-nowrap" style={wordmarkStyle(theme)}>{displayName(c)}</h2>
            <div className="quick-price-row mt-5">
              <StrengthPrice compound={c} value={variantId} onChange={setVariantId} />
              <Link to="/compound/$slug" params={{ slug: c.slug }} onClick={() => setQuickView(null)} className="research-beacon">Explore this peptide <span aria-hidden>→</span></Link>
            </div>
            <p className="text-sm font-semibold text-bone/82 leading-relaxed mt-5">{descriptionFor(c)}</p>
            <dl className="mini-specs mt-6">
              <div><dt>Explore by topic</dt><dd>{domain.name}</dd></div>
              <div><dt>Structure</dt><dd>{presentation?.detail}</dd></div>
              <div><dt>Want to know more?</dt><dd>Open the product page for studies and safety details.</dd></div>
            </dl>
            <div className="mt-7 flex flex-wrap gap-2">
              <button className="btn commerce-btn" onClick={() => { add(c.slug, 1, variantId); setQuickView(null) }} data-cursor="add">Add to cart</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MolecularCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const ok = window.matchMedia('(pointer:fine) and (hover:hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(ok)
    if (!ok) return
    const el = ref.current
    if (!el) return
    let x = -30, y = -30, tx = x, ty = y, raf = 0
    const tick = () => { x += (tx - x) * .22; y += (ty - y) * .22; el.style.transform = `translate3d(${x}px,${y}px,0)`; raf = requestAnimationFrame(tick) }
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; const target = (e.target as HTMLElement).closest('[data-cursor],a,button'); el.dataset.mode = target?.getAttribute('data-cursor') ?? (target ? 'link' : 'normal') }
    const down = () => el.dataset.down = '1', up = () => el.dataset.down = '0'
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointerdown', down); window.addEventListener('pointerup', up); tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up) }
  }, [])
  if (!enabled) return null
  return <div ref={ref} className="molecular-cursor" aria-hidden><i /><i /><i /><b>+</b></div>
}
