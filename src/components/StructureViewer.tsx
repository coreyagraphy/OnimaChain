import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { Compound } from '~/data/compounds'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { SequenceSVG } from './SequenceSVG'
import { ProvenanceLabel, provenanceText } from './SourceBadge'
import { HOTSPOT_RULES } from '~/scenes/chain/hotspots'

const Viewer = lazy(() => import('~/scenes/chain/ViewerScene').then((m) => ({ default: m.ViewerScene })))

interface Props { compound: Compound; tint: string; accent: string; scrollRef?: React.RefObject<number> }

/**
 * StructureViewer = ChainRenderer + 3D controls (rotate / reset / labels / reduced effects / provenance).
 * Scroll-tied assemble → hold; drag to orbit. SSR/static fallback: SequenceSVG + the same provenance label.
 */
export function StructureViewer({ compound, tint, accent, scrollRef }: Props) {
  const allowed = useCanvasAllowed()
  const geometry = useMemo(() => buildChain(compound), [compound])
  const [labels, setLabels] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [showProv, setShowProv] = useState(false)
  const resetKey = useRef(0)
  const [rk, setRk] = useState(0)
  const prov = provenanceText(compound)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <div className="relative w-full h-full min-h-[420px]">
      {ready && allowed ? (
        <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={13} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <Viewer key={rk} geometry={geometry} tint={tint} accent={accent} labels={labels} reducedEffects={reduced} autoRotate={autoRotate} scrollRef={scrollRef} />
          </Suspense>
        </Lod0Canvas>
      ) : (
        <SequenceSVG geometry={geometry} tint={tint} className="absolute inset-0 w-full h-full p-8" label />
      )}
      {/* controls */}
      <div className="absolute left-3 bottom-3 flex flex-wrap gap-1.5 z-10" role="group" aria-label="3D controls">
        <button className="btn btn-sm" aria-pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)}>Rotate</button>
        <button className="btn btn-sm" onClick={() => { resetKey.current++; setRk(resetKey.current) }}>Reset</button>
        <button className="btn btn-sm" aria-pressed={labels} onClick={() => setLabels((v) => !v)}>Labels</button>
        <button className="btn btn-sm" aria-pressed={reduced} onClick={() => setReduced((v) => !v)}>Reduced effects</button>
        <button className="btn btn-sm" aria-pressed={showProv} onClick={() => setShowProv((v) => !v)}>Provenance</button>
      </div>
      <div className="absolute right-3 top-3 z-10 text-right max-w-[60%]">
        <ProvenanceLabel compound={compound} />
      </div>
      {showProv && (
        <div className="absolute left-3 right-3 top-12 md:left-auto md:w-[360px] z-10 panel p-4 text-sm fade-up" data-lenis-prevent>
          <p className="label label-cyan">Structure provenance</p>
          <p className="mt-2 text-bone/85">{prov.primary}.</p>
          {prov.secondary && <p className="mt-1 muted">{prov.secondary}.</p>}
          <p className="mt-2 text-[12px] muted">Backbone Cα positions are generated from the residue list with alpha-helix parameters (rise 1.5 Å, 100°/residue, radius 2.3 Å); proline kinks the axis 30–40°, glycine adds a seeded wobble, lactam bridges close the ring. Nothing here was measured.</p>
          {geometry.hotspots.length > 0 && (
            <ul className="mt-3 grid gap-1 text-[12px]">
              {geometry.hotspots.map((h, i) => (
                <li key={i} className="flex gap-2 items-start"><span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: HOTSPOT_RULES[h.kind].color }} /><span className="text-bone/80">{h.label}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
