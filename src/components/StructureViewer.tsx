import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MoveHint } from './MoveHint'
import type { Compound } from '~/data/compounds'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { SequenceSVG } from './SequenceSVG'
import { SceneLoader } from './SceneLoader'
import { ProvenanceLabel, provenanceText } from './SourceBadge'
import { HOTSPOT_RULES } from '~/scenes/chain/hotspots'
import { environmentFor } from '~/data/environments'
import type { ExploreState } from '~/scenes/chain/ViewerScene'

const Viewer = lazy(() => import('~/scenes/chain/ViewerScene').then((m) => ({ default: m.ViewerScene })))

interface Props { compound: Compound; tint: string; accent: string; scrollRef?: React.RefObject<number> }
type Panel = null | 'light' | 'features' | 'source'

/**
 * Hands-on molecule stage: Look closer · Turn it around (with Done) · Move the light · What is this? · Reset view.
 * Every action is a real button (keyboard + touch), none depends on hover or long-press.
 * The 3D scene reads one shared state object each frame; the page never re-renders per frame.
 * Static fallback (no WebGL / reduced data): the sequence drawing plus the feature list, no light or turn controls.
 */
export function StructureViewer({ compound, tint, accent, scrollRef }: Props) {
  const allowed = useCanvasAllowed()
  const geometry = useMemo(() => buildChain(compound), [compound])
  const env = environmentFor(compound.slug)
  const prov = provenanceText(compound)
  const [ready, setReady] = useState(false)
  const [touch, setTouch] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [close, setClose] = useState(false)
  const [turning, setTurning] = useState(false)
  const [feature, setFeature] = useState<number | null>(null)
  const [light, setLight] = useState(30)
  const [handled, setHandled] = useState(false)
  const explore = useRef<ExploreState>({ close: false, feature: null, light: 0.3, turning: false, resetTick: 0 })
  const dim = useRef(0)
  const opener = useRef<HTMLButtonElement | null>(null)
  const turnBtn = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => { setReady(true); setTouch(window.matchMedia?.('(pointer: coarse)').matches ?? false) }, [])
  useEffect(() => { Object.assign(explore.current, { close, feature, light: light / 100, turning }) }, [close, feature, light, turning])
  // Escape ends turning mode or closes the open panel, then returns focus to the control that opened it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (turning) { setTurning(false); turnBtn.current?.focus() }
      else if (panel) { setPanel(null); opener.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turning, panel])
  // the source panel dims the molecule so the explanation comes forward
  useEffect(() => {
    let raf = 0
    const target = panel === 'source' ? 1 : 0
    const step = () => { dim.current += (target - dim.current) * 0.08; if (Math.abs(target - dim.current) > 0.005) raf = requestAnimationFrame(step); else dim.current = target }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [panel])

  const open = (p: Panel, e: React.MouseEvent<HTMLButtonElement>) => { opener.current = e.currentTarget; setPanel((cur) => (cur === p ? null : p)) }
  const closePanel = () => { setPanel(null); opener.current?.focus() }
  const reset = () => { setClose(false); setFeature(null); setLight(30); setTurning(false); setPanel(null); explore.current.resetTick++ }
  const live = ready && allowed
  const hs = geometry.hotspots

  return (
    <div ref={stage} className="relative w-full h-full min-h-[460px]" onPointerDown={() => { if (!touch || turning) setHandled(true) }}>
      {live ? (
        <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={13}>
          <Suspense fallback={null}>
            <Viewer geometry={geometry} tint={tint} accent={accent} labels={false} reducedEffects={false} autoRotate scrollRef={scrollRef} dimRef={dim} environment={env} rotateMode={!touch || turning} explore={explore} />
          </Suspense>
        </Lod0Canvas>
      ) : (
        <SequenceSVG geometry={geometry} tint={tint} className="absolute inset-0 w-full h-full p-8" label />
      )}
      {live && <Suspense fallback={<SceneLoader />}><span /></Suspense>}
      {live && <MoveHint touch={touch} hidden={handled || turning || close} onActivate={() => { setTurning(true); setHandled(true) }} />}

      <div className="absolute right-3 top-3 z-10 text-right max-w-[60%]">
        <ProvenanceLabel compound={compound} />
      </div>

      {turning && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 z-20 glass rounded-full px-4 py-2 flex items-center gap-3 drawer-in" role="status">
          <span className="relative text-[13px] text-bone/90">{touch ? 'Drag to turn it.' : 'Drag or use the arrow keys to turn it.'}</span>
          <button className="btn btn-sm stage-btn relative" onClick={() => { setTurning(false); turnBtn.current?.focus() }}>Done</button>
        </div>
      )}

      {panel === 'light' && (
        <div className="stage-panel glass drawer-in" role="group" aria-label="Move the light">
          <label className="relative block">
            <span className="label" style={{ color: env.neon }}>Move the light</span>
            <span className="block text-[13px] text-bone/75 mt-1">Slide it around the molecule. Watch the grain, the curved shadows and the joins change.</span>
            <input type="range" min={0} max={100} value={light} onChange={(e) => setLight(Number(e.target.value))} className="w-full mt-3" aria-label="Light position around the molecule" />
          </label>
          <div className="relative flex gap-2 mt-2"><button className="btn btn-sm stage-btn" onClick={() => setLight(30)}>Reset light</button><button className="btn btn-sm stage-btn" onClick={closePanel}>Close</button></div>
        </div>
      )}

      {panel === 'features' && (
        <div className="stage-panel glass drawer-in" role="dialog" aria-label="What is this?" data-lenis-prevent>
          <p className="relative label" style={{ color: env.neon }}>What is this?</p>
          {hs.length ? (
            <>
              <ul className="relative mt-3 grid gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {hs.map((h, i) => (
                  <li key={i}>
                    <button className="stage-feature" aria-pressed={feature === i} onClick={() => setFeature(feature === i ? null : i)}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: HOTSPOT_RULES[h.kind].color }} aria-hidden />
                      <span>{h.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {feature !== null && hs[feature] && (
                <p className="relative mt-3 text-[13px] text-bone/85 leading-relaxed" aria-live="polite"><b className="text-bone">{HOTSPOT_RULES[hs[feature].kind].title}.</b> {HOTSPOT_RULES[hs[feature].kind].explain}</p>
              )}
            </>
          ) : (
            <p className="relative mt-2 text-[13px] text-bone/75">No labeled features on this one yet. Try Move the light instead.</p>
          )}
          <div className="relative flex gap-2 mt-3"><button className="btn btn-sm stage-btn" onClick={() => { setFeature(null); closePanel() }}>Close</button></div>
        </div>
      )}

      {panel === 'source' && (
        <div className="stage-panel glass drawer-in" role="dialog" aria-label="Where this shape comes from" data-lenis-prevent>
          <p className="relative label" style={{ color: env.neon }}>Where this 3D shape comes from</p>
          <p className="relative mt-2 text-[13px] text-bone/85">{prov.primary}.</p>
          {prov.secondary && <p className="relative mt-1 text-[13px] muted">{prov.secondary}.</p>}
          <p className="relative mt-2 text-[12px] muted">We draw the shape from the amino-acid sequence using standard helix geometry (rise 1.5 Å, 100°/residue, radius 2.3 Å). Proline bends the chain 30–40°, glycine adds a small wobble, lactam bridges close the ring. The surface texture is an artistic finish, not how atoms look. This is a drawing based on the sequence, not a measured structure.</p>
          <div className="relative flex gap-2 mt-3"><button className="btn btn-sm stage-btn" onClick={closePanel}>Close</button></div>
        </div>
      )}

      {/* controls: always visible, large targets, no hover-only actions */}
      <div className="absolute left-3 right-3 bottom-3 flex flex-wrap gap-1.5 z-10" role="toolbar" aria-label="Explore the molecule">
        {live && <button className="btn btn-sm stage-btn" aria-pressed={close} onClick={() => { setClose((v) => !v); setFeature(null) }}>{close ? 'Whole view' : 'Look closer'}</button>}
        {live && <button ref={turnBtn} className="btn btn-sm stage-btn" aria-pressed={turning} onClick={() => setTurning((v) => !v)}>{turning ? 'Done turning' : 'Turn it around'}</button>}
        {live && <button className="btn btn-sm stage-btn" aria-pressed={panel === 'light'} onClick={(e) => open('light', e)}>Move the light</button>}
        <button className="btn btn-sm stage-btn" aria-pressed={panel === 'features'} onClick={(e) => open('features', e)}>What is this?</button>
        <button className="btn btn-sm stage-btn" aria-pressed={panel === 'source'} onClick={(e) => open('source', e)}>Where it&rsquo;s from</button>
        {live && <button className="btn btn-sm stage-btn" onClick={reset}>Reset view</button>}
      </div>
    </div>
  )
}
