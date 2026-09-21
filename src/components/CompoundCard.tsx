import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useMemo, useState, type CSSProperties } from 'react'
import { computedMW, displayName, type Compound } from '~/data/compounds'
import { descriptionFor, PRICE_PLACEHOLDER, themeFor, wordmarkStyle } from '~/data/commerce'
import { DOMAIN_BY_ID } from '~/data/domains'
import { buildChain } from '~/scenes/chain/geometry'
import { SceneView } from '~/scenes/Canvas'
import { SequenceSVG } from './SequenceSVG'
import { useCommerceStore } from '~/stores/commerce'

const DomainRig = lazy(() => import('~/scenes/rigs').then((m) => ({ default: m.DomainRig })))
export type CardLayout = 'portrait' | 'wide' | 'square'
const SIZE: Record<CardLayout, string> = { portrait: 'w-[300px] h-[440px]', wide: 'w-[430px] h-[350px]', square: 'w-[340px] h-[390px]' }
interface Props { compound: Compound; index: number; layout?: CardLayout; fluid?: boolean }

export function CompoundCard({ compound, index, layout, fluid = false }: Props) {
  const lay = layout ?? (['portrait', 'wide', 'square'] as const)[index % 3]
  const domain = DOMAIN_BY_ID[compound.domain]
  const theme = themeFor(compound)
  const geometry = useMemo(() => buildChain(compound), [compound])
  const add = useCommerceStore((s) => s.add)
  const setQuickView = useCommerceStore((s) => s.setQuickView)
  const [hover, setHover] = useState(false)
  const [added, setAdded] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const mw = compound.mw ?? computedMW(compound)
  const style = { '--product': theme.primary, '--product-2': theme.secondary, '--product-3': theme.tertiary, transform: hover ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-7px)` : undefined } as CSSProperties
  const quickAdd = () => { add(compound.slug); setAdded(true); window.setTimeout(() => setAdded(false), 1200) }
  return (
    <article className={`product-card card-tilt group relative shrink-0 overflow-hidden ${fluid ? 'w-full h-[440px]' : SIZE[lay]}`} style={style} onPointerEnter={() => setHover(true)} onPointerLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }) }} onPointerMove={(e) => { const r=e.currentTarget.getBoundingClientRect(); setTilt({ x:-((e.clientY-r.top)/r.height-.5)*5, y:((e.clientX-r.left)/r.width-.5)*5 }) }}>
      <div className="product-card-atmosphere" aria-hidden />
      <Link to="/compound/$slug" params={{ slug: compound.slug }} className="absolute inset-0 z-[1]" aria-label={`Open ${displayName(compound)}`} data-cursor="product" />
      <div className="absolute inset-x-0 top-0 h-[58%] pointer-events-none"><SceneView className="absolute inset-0" fallback={<SequenceSVG geometry={geometry} tint={theme.primary} className="absolute inset-0 w-full h-full p-6 opacity-90" />}><Suspense fallback={null}><DomainRig domain={compound.domain} compound={compound} lod={2} intensity={hover ? 2.25 : 1.32} /></Suspense></SceneView></div>
      <div className="absolute inset-x-0 top-0 p-5 flex items-start justify-between pointer-events-none z-[2]"><span className="label" style={{ color: theme.primary }}>{domain.name}</span><span className="mono text-[10px] text-bone/45">{geometry.placeholder ? 'STRUCTURE PENDING' : `${geometry.length} AA`}</span></div>
      <div className="absolute inset-x-0 bottom-0 p-5 z-[3] pointer-events-none product-card-copy">
        <div className="flex items-end justify-between gap-3"><h3 className="wordmark text-[clamp(1.8rem,3vw,2.6rem)]" style={wordmarkStyle(theme)}>{displayName(compound)}</h3><strong className="mono text-sm whitespace-nowrap">{PRICE_PLACEHOLDER}</strong></div>
        <p className="mt-2 text-[12px] text-bone/58 line-clamp-2">{descriptionFor(compound)}</p>
        <div className="mt-3 flex gap-3 mono text-[10px] text-bone/50"><span>{compound.sequence ? `${compound.sequence.length} residues` : 'length pending'}</span><span>{mw ? `${mw} Da` : 'MW pending'}</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2 pointer-events-auto"><button className="btn btn-sm justify-center bg-obsidian/65" onClick={() => setQuickView(compound.slug)}>Quick view</button><button className="btn btn-sm commerce-btn justify-center" onClick={quickAdd} data-cursor="add">{added ? 'Added' : 'Add to cart'}</button></div>
      </div>
      <div className="product-card-edge" aria-hidden />
    </article>
  )
}
