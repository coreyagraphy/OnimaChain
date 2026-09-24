import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { displayName, type Compound } from '~/data/compounds'
import { descriptionFor, themeFor, wordmarkStyle } from '~/data/commerce'
import { DOMAIN_BY_ID } from '~/data/domains'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas } from '~/scenes/Canvas'
import { SequenceSVG } from './SequenceSVG'
import { useReaderStore } from '~/stores/reader'
import { useFitText } from '~/motion/useFitText'
import { structurePresentation } from '~/data/structure-presentation'
import { useCanvasAllowed, useReducedMotion } from '~/motion/useReducedMotion'

const CardMoleculeScene = lazy(() => import('~/scenes/card/CardMoleculeScene').then((m) => ({ default: m.CardMoleculeScene })))
export type CardLayout = 'portrait' | 'wide' | 'square'
const SIZE: Record<CardLayout, string> = { portrait: 'w-[300px] h-[500px]', wide: 'w-[430px] h-[410px]', square: 'w-[340px] h-[450px]' }
interface Props { compound: Compound; index: number; layout?: CardLayout; fluid?: boolean; /** Brighter animation in the featured orbit. */ lively?: boolean }

export function CompoundCard({ compound, index, layout, fluid = false, lively = false }: Props) {
  const lay = layout ?? (['portrait', 'wide', 'square'] as const)[index % 3]
  const domain = DOMAIN_BY_ID[compound.domain]
  const theme = themeFor(compound)
  const presentation = structurePresentation(compound)
  const geometry = useMemo(() => buildChain(compound), [compound])
  const setQuickView = useReaderStore((s) => s.setQuickView)
  const [hover, setHover] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const [nearScreen, setNearScreen] = useState(false)
  const quickViewOpen = useReaderStore((s) => s.quickView !== null)
  const canvasAllowed = useCanvasAllowed()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (typeof IntersectionObserver === 'undefined') { setNearScreen(true); return }
    const observer = new IntersectionObserver(([entry]) => setNearScreen(entry.isIntersecting), { rootMargin: '0px' })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])
  const render3d = nearScreen && !quickViewOpen && canvasAllowed
  const nameRef = useFitText<HTMLHeadingElement>([compound.slug, lay, fluid], 12)
  const titleStyle = { ...wordmarkStyle(theme), backgroundImage: `linear-gradient(180deg, #ffffff 9%, #f2eee6 56%, color-mix(in srgb, ${theme.primary} 55%, #dce8ef) 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: `0 2px 0 ${theme.extrusionStyle}a8, 0 0 6px ${theme.primary}55, 0 0 19px ${theme.glow}45, 0 14px 26px #000d` } as CSSProperties
  const style = { '--product': theme.primary, '--product-2': theme.secondary, '--product-3': theme.tertiary, transform: hover && !reducedMotion ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-7px)` : undefined } as CSSProperties
  return (
    <article className={`product-card card-tilt group relative shrink-0 overflow-hidden ${fluid ? 'w-full h-[510px]' : SIZE[lay]}`} data-layout={fluid ? 'fluid' : lay} data-title-style={theme.titleStyle} data-structure-kind={presentation.kind} style={style} onPointerEnter={() => setHover(true)} onPointerLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }) }} onPointerMove={(e) => { if (reducedMotion) return; const r=e.currentTarget.getBoundingClientRect(); setTilt({ x:-((e.clientY-r.top)/r.height-.5)*5, y:((e.clientX-r.left)/r.width-.5)*5 }) }}>
      <div className="product-card-atmosphere" aria-hidden />
      <div className="product-neon-lens" aria-hidden><i /><i /><i /></div>
      <Link to="/compound/$slug" params={{ slug: compound.slug }} className="absolute inset-0 z-[1]" aria-label={`Open ${displayName(compound)}`} data-cursor="product" />
      <div ref={stageRef} className="product-molecule absolute inset-x-0 top-0 pointer-events-none" data-render-3d={render3d}>
        {compound.sequence ? <>
          {render3d ? <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={5.6} dpr={[1, 1.2]} preserveDrawingBuffer={false}><Suspense fallback={null}><CardMoleculeScene geometry={geometry} tint={theme.primary} accent={theme.secondary} active={hover || lively} /></Suspense></Lod0Canvas> : <SequenceSVG geometry={geometry} tint={theme.primary} className="product-molecule-fallback absolute inset-0 w-full h-full p-5" />}
        </> : <div className="structure-unavailable" role="img" aria-label={`${displayName(compound)}: ${presentation.detail}`}><strong>{presentation.label}</strong><p>{presentation.detail}</p></div>}
      </div>
      <div className="absolute inset-x-0 top-0 p-5 flex items-start justify-between pointer-events-none z-[2]"><span className="label" style={{ color: theme.primary }}>{domain.name}</span></div>
      <span className="product-structure-kind" aria-label={`Structure provenance: ${presentation.label}`}>{presentation.label}</span>
      <div className="absolute inset-x-0 bottom-0 p-5 z-[3] pointer-events-none product-card-copy">
        <div className="min-w-0 overflow-hidden"><h3 ref={nameRef} className="wordmark product-card-title w-full min-w-0" style={titleStyle}>{displayName(compound)}</h3></div>
        <p className="mt-3 mono text-[10px] text-bone/70">IDENTITY RECORD · SUMMARY REVIEW PENDING</p>
        <p className="mt-2 text-[12px] font-semibold leading-relaxed text-bone/78 line-clamp-3">{descriptionFor(compound)}</p>
        <div className="product-structure-detail mt-3 text-[11px] text-bone/65 line-clamp-2">{presentation.detail}</div>
        <div className="mt-4 grid grid-cols-2 gap-2 pointer-events-auto"><button className="btn btn-sm justify-center bg-obsidian/65" onClick={() => setQuickView(compound.slug)}>Inspect model</button><Link to="/compound/$slug" params={{ slug: compound.slug }} className="btn btn-sm justify-center commerce-btn">View sources</Link></div>
      </div>
      <div className="product-card-edge" aria-hidden />
    </article>
  )
}
