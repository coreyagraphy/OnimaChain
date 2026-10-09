import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useCanvasAllowed, useReducedMotion } from '~/motion/useReducedMotion'
import { ActivitySculpture } from './ExperienceLaunchpad'
const Scene = lazy(() => import('~/scenes/DiscoveryScene'))

export type DiscoveryMode = 'scale' | 'report' | 'constellation' | 'history'
const labels = {
  scale: ['Molecule', 'Cell', 'Tissue', 'Person'],
  report: ['Identity: what is it?', 'Purity: what made the peak?', 'Concentration: how much per volume?'],
  constellation: ['Original paper', 'Conference summary', 'Later article'],
  history: ['1953', '1955', '1963', '1982'],
}
export function DiscoveryStage({ mode, selected = 0, onSelect, linked = [] }: { mode: DiscoveryMode; selected?: number; onSelect?: (index: number) => void; linked?: number[] }) {
  const allowed = useCanvasAllowed()
  const calm = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!frame.current) return
    const observer = new IntersectionObserver(entries => setVisible(entries.some(item => item.isIntersecting)), { rootMargin: '200px 0px' })
    observer.observe(frame.current)
    return () => observer.disconnect()
  }, [])
  return <div className={`discovery-stage discovery-${mode}`} data-paused={paused || calm} ref={frame}>
    <div className="discovery-caption"><span>MOVE THROUGH THE IDEA</span><span>CONCEPTUAL / NOT TO SCALE</span></div>
    <div className="discovery-canvas">{allowed && visible ? <Suspense fallback={<ActivitySculpture shape={mode === 'report' ? 'sheets' : mode === 'scale' ? 'scale' : 'rings'}/>}><Scene mode={mode} selected={selected} linked={linked} calm={calm || paused} active={visible} onSelect={onSelect}/></Suspense> : <ActivitySculpture shape={mode === 'report' ? 'sheets' : mode === 'scale' ? 'scale' : mode === 'constellation' ? 'network' : 'rings'}/>}</div>
    <div className="discovery-controls">{labels[mode].map((label, index) => <button type="button" key={label} aria-pressed={selected === index} onClick={() => onSelect?.(index)} disabled={!onSelect} className={selected === index ? 'active' : ''}>{label}</button>)}</div>
    <div className="discovery-footer"><span>{allowed ? 'Drag the scene to look around' : 'Static view · use the labeled controls'}</span>{allowed && <button onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button>}</div>
  </div>
}
