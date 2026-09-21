import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useMemo, useState } from 'react'
import { displayName, type Compound } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { distributionFor, latestChangeFor } from '~/data/evidence'
import { buildChain } from '~/scenes/chain/geometry'
import { SceneView } from '~/scenes/Canvas'
import { rigVariation } from '~/scenes/rigs'
import { SequenceSVG } from './SequenceSVG'
import { provenanceText } from './SourceBadge'

const DomainRig = lazy(() => import('~/scenes/rigs').then((m) => ({ default: m.DomainRig })))

export type CardLayout = 'portrait' | 'wide' | 'square'
const LAYOUTS: CardLayout[] = ['portrait', 'wide', 'square']
const SIZE: Record<CardLayout, string> = {
  portrait: 'w-[260px] h-[360px]',
  wide: 'w-[400px] h-[270px]',
  square: 'w-[300px] h-[300px]',
}

interface Props { compound: Compound; index: number; layout?: CardLayout; fluid?: boolean }

/**
 * One compound, one card. DomainRig at LOD-2 with three data-driven variations
 * (real geometry, accent from dominant residue class, tempo from chain length). No two alike.
 * Shows: name · evidence distribution (verified only) · latest change · community-signal presence.
 */
export function CompoundCard({ compound, index, layout, fluid = false }: Props) {
  const lay = layout ?? LAYOUTS[index % 3]
  const domain = DOMAIN_BY_ID[compound.domain]
  const geometry = useMemo(() => buildChain(compound), [compound])
  const v = useMemo(() => rigVariation(compound.domain, geometry), [compound.domain, geometry])
  const dist = distributionFor(compound.slug)
  const change = latestChangeFor(compound.slug)
  const prov = provenanceText(compound)
  const [hover, setHover] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  return (
    <Link
      to="/compound/$slug"
      params={{ slug: compound.slug }}
      className={`card-tilt group block relative shrink-0 rounded-2xl overflow-hidden panel-flat ${fluid ? 'w-full h-[340px]' : SIZE[lay]}`}
      style={{ transform: hover ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)` : undefined }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }) }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setTilt({ x: -((e.clientY - r.top) / r.height - 0.5) * 7, y: ((e.clientX - r.left) / r.width - 0.5) * 9 })
      }}
      aria-label={`${displayName(compound)} — ${domain.name}`}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 50% 110%, ${v.tint}1f, transparent 60%)` }} />
      <SceneView
        className="absolute left-0 right-0 top-10 bottom-[118px]"
        fallback={<SequenceSVG geometry={geometry} tint={v.tint} className="absolute inset-0 w-full h-full p-4 opacity-90" />}
      >
        <Suspense fallback={null}>
          <DomainRig domain={compound.domain} compound={compound} lod={2} intensity={hover ? 1.6 : 1} />
        </Suspense>
      </SceneView>
      <div className="absolute inset-x-0 top-0 p-4 flex items-start justify-between pointer-events-none">
        <span className="label whitespace-nowrap">{domain.name}</span>
        <span className="label !text-bone/45 mono whitespace-nowrap">{geometry.placeholder ? 'seq. pending' : `${geometry.length} aa`}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
        <h3 className="display text-[22px] text-bone">{displayName(compound)}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5" aria-label="Evidence distribution">
          {dist.total === 0 ? (
            <span className="text-[11px] faint">No qualifying record is currently indexed in Cyravon&rsquo;s corpus</span>
          ) : (
            <>
              {[['in vitro', dist.inVitro, '#B9A2FF'], ['animal', dist.animal, '#5FE3FF'], ['human', dist.human, '#F2EEE6'], ['review', dist.review, '#8FB0FF']].map(([l, n, c]) => (
                <span key={l as string} className="mono text-[10px] text-bone/70 flex items-center gap-1 whitespace-nowrap">
                  <span className="inline-block h-1.5 rounded-sm" style={{ width: 6 + (n as number) * 8, background: (n as number) ? (c as string) : 'rgba(242,238,230,0.15)' }} />
                  {n as number} {l as string}
                </span>
              ))}
            </>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-bone/50 truncate">
          {change ? <><span className="text-amber">Δ {change.date}</span> {change.change}</> : 'No change recorded'} · signal: none enabled
        </p>
        <p className="mt-1 mono text-[10px] text-bone/35 truncate">{prov.primary}</p>
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan/0 group-hover:ring-cyan/40 transition" />
    </Link>
  )
}
