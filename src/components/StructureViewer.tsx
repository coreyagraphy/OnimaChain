import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { Compound } from '~/data/compounds'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { SequenceSVG } from './SequenceSVG'
import { SceneLoader } from './SceneLoader'
import { ProvenanceLabel, provenanceText } from './SourceBadge'
import { HOTSPOT_RULES } from '~/scenes/chain/hotspots'
import { environmentFor } from '~/data/environments'

const Viewer = lazy(() => import('~/scenes/chain/ViewerScene').then((m) => ({ default: m.ViewerScene })))

interface Props { compound: Compound; tint: string; accent: string; scrollRef?: React.RefObject<number> }

/**
 * StructureViewer = ChainRenderer + 3D controls (rotate / reset / labels / reduced effects / provenance).
 * Scroll-tied assemble → hold; drag to orbit. Opening provenance dims the molecule while the provenance
 * panel comes forward; closing restores focus. SSR/static fallback: SequenceSVG + the same provenance label.
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
  const dim = useRef(0)
  const env = environmentFor(compound.slug)
  // Touch devices start with page scrolling; an explicit Rotate mode hands the drag to the molecule.
  const [touch, setTouch] = useState(false)
  const [rotateMode, setRotateMode] = useState(true)
  useEffect(() => { setReady(true); const t = window.matchMedia?.('(pointer: coarse)').matches ?? false; setTouch(t); setRotateMode(!t) }, [])
  // damped dim so the molecule recedes and returns with weight, not a switch
  useEffect(() => {
    let raf = 0
    const target = showProv ? 1 : 0
    const step = () => {
      dim.current += (target - dim.current) * 0.08
      if (Math.abs(target - dim.current) > 0.005) raf = requestAnimationFrame(step)
      else dim.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [showProv])

  return (
    <div className="relative w-full h-full min-h-[420px]">
      {ready && allowed ? (
        <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={13}>
          <Suspense fallback={null}>
            <Viewer key={rk} geometry={geometry} tint={tint} accent={accent} labels={labels} reducedEffects={reduced} autoRotate={autoRotate} scrollRef={scrollRef} dimRef={dim} environment={env} rotateMode={rotateMode} />
          </Suspense>
        </Lod0Canvas>
      ) : (
        <SequenceSVG geometry={geometry} tint={tint} className="absolute inset-0 w-full h-full p-8" label />
      )}
      {ready && allowed && <Suspense fallback={<SceneLoader />}><span /></Suspense>}
      {/* controls (only when a live scene exists; the static SVG needs none) */}
      {ready && allowed && <div className="absolute left-3 bottom-3 flex flex-wrap gap-1.5 z-10" role="group" aria-label="3D controls">
        {touch && <button className="btn btn-sm" aria-pressed={rotateMode} onClick={() => setRotateMode((v) => !v)}>{rotateMode ? 'Drag rotates' : 'Drag scrolls'}</button>}
        <button className="btn btn-sm" aria-pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)}>Auto-turn</button>
        <button className="btn btn-sm" onClick={() => { resetKey.current++; setRk(resetKey.current) }}>Reset</button>
        <button className="btn btn-sm" aria-pressed={labels} onClick={() => setLabels((v) => !v)}>Labels</button>
        <button className="btn btn-sm" aria-pressed={reduced} onClick={() => setReduced((v) => !v)}>Reduced effects</button>
        <button className="btn btn-sm" aria-pressed={showProv} onClick={() => setShowProv((v) => !v)}>Where it's from</button>
      </div>}
      <div className="absolute right-3 top-3 z-10 text-right max-w-[60%]">
        <ProvenanceLabel compound={compound} />
        {ready && allowed && <p className="mono text-[10px] text-bone/40 mt-1 hidden md:block">Drag or use the arrow keys to turn it</p>}
      </div>
      {showProv && (
        <div className="absolute left-3 right-3 top-12 md:left-auto md:w-[380px] z-10 glass rounded-2xl p-5 text-sm drawer-in" data-lenis-prevent>
          <p className="relative label label-cyan">Where this 3D shape comes from</p>
          <p className="relative mt-2 text-bone/85">{prov.primary}.</p>
          {prov.secondary && <p className="relative mt-1 muted">{prov.secondary}.</p>}
          <p className="relative mt-2 text-[12px] muted">We draw the shape from the amino-acid sequence using standard helix geometry (rise 1.5 Å, 100°/residue, radius 2.3 Å). Proline bends the chain 30–40°, glycine adds a small wobble, lactam bridges close the ring. This is a drawing based on the sequence, not a measured structure.</p>
          {geometry.hotspots.length > 0 && (
            <ul className="relative mt-3 grid gap-1 text-[12px]">
              {geometry.hotspots.map((h, i) => (
                <li key={i} className="flex gap-2 items-start"><span className="mt-1 w-2 h-2 rounded-full shrink-0 hotspot-pulse" style={{ background: HOTSPOT_RULES[h.kind].color, animationDelay: `${i * 0.3}s` }} /><span className="text-bone/80">{h.label}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
