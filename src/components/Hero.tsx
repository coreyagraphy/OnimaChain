import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed, useVisualStore } from '~/motion/useReducedMotion'
import { createScrub } from '~/motion/timeline'

const HeroScene = lazy(() => import('~/scenes/hero/HeroScene').then((m) => ({ default: m.HeroScene })))
const CAPTIONS = [
  { from: .04, to: .24, k: 'Structure', v: 'BPC-157 · 15 residues · GEPPPGKPADDAGLV' },
  { from: .26, to: .46, k: 'Approach', v: 'Move from the full molecular form toward its structural hinge' },
  { from: .45, to: .72, k: 'Signal', v: 'Light follows the chain as the camera passes through it' },
  { from: .74, to: .88, k: 'Resolve', v: 'The molecular form begins reorganizing into information' },
  { from: .9, to: 1.2, k: 'Discover', v: 'Molecule → research record → product discovery' },
]

export function Hero() {
  const allowed = useCanvasAllowed()
  const isStatic = useVisualStore((s) => s.mode === 'static')
  const section = useRef<HTMLElement>(null), progress = useRef(0), pointer = useRef({ x: 0, y: 0 })
  const [firstFrame, setFirstFrame] = useState(false)
  const copyRef = useRef<HTMLDivElement>(null), barRef = useRef<HTMLDivElement>(null), hintRef = useRef<HTMLDivElement>(null)
  const capRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (!section.current || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const cleanup = createScrub({ trigger: section.current, end: '+=150%', pin: true, scrub: .9, onProgress: (p) => {
      progress.current = p
      if (copyRef.current) { const k=1-Math.min(1,p/.22); copyRef.current.style.opacity=String(k); copyRef.current.style.transform=`translateY(${-p*90}px)`; copyRef.current.style.pointerEvents=k<.3?'none':'auto' }
      if (barRef.current) barRef.current.style.transform=`scaleX(${p})`
      if (hintRef.current) hintRef.current.style.opacity=String(Math.max(0,1-p/.12))
      CAPTIONS.forEach((c,i)=>{ const el=capRefs.current[i]; if(!el)return; const o=Math.max(0,Math.min(1,(p-c.from)/.06,(c.to-p)/.06)); el.style.opacity=String(o); el.style.transform=`translateY(${(1-o)*10}px)` })
    }})
    const onMove=(e:PointerEvent)=>{ pointer.current.x=(e.clientX/window.innerWidth-.5)*2; pointer.current.y=(e.clientY/window.innerHeight-.5)*2 }
    window.addEventListener('pointermove',onMove,{passive:true})
    return ()=>{ cleanup(); window.removeEventListener('pointermove',onMove) }
  },[])
  return (
    <section ref={section} className="hero-shell relative h-[100vh] w-full overflow-hidden bg-obsidian grain" aria-label="Molecular collection introduction">
      <picture><source media="(max-aspect-ratio: 4/5)" srcSet="/posters/hero-portrait.jpg"/><img src="/posters/hero.jpg" alt="A glowing sequence-derived molecular chain in a deep cyan and violet laboratory environment" width={1440} height={900} fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms]" style={{opacity:firstFrame?0:1}}/></picture>
      <div className="hero-chroma" aria-hidden/><div className="hero-orbit hero-orbit-a" aria-hidden/><div className="hero-orbit hero-orbit-b" aria-hidden/>
      {allowed && <Lod0Canvas className="absolute inset-0" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} onFirstFrame={()=>setFirstFrame(true)} cameraZ={16}><Suspense fallback={null}><HeroScene progress={progress} pointer={pointer}/></Suspense></Lod0Canvas>}
      <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(180deg,rgba(10,11,14,.36),rgba(10,11,14,0) 35%,rgba(10,11,14,0) 55%,rgba(10,11,14,.82))'}}/>
      <div ref={copyRef} className="relative z-10 h-full wrap flex flex-col justify-end pb-[10vh] md:pb-[12vh]">
        <p className="label label-cyan mb-6">Molecular commerce · research attached</p>
        <h1 className="display hero-title text-[clamp(3rem,8vw,7.6rem)] text-bone">Enter the molecule.<br/><span>Know the record.</span></h1>
        <p className="lede mt-7 max-w-xl">A premium molecular collection with the published research, source history, and unanswered questions kept close at hand.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link to="/explore" className="btn btn-primary">Shop the collection</Link><Link to="/claims" className="btn">Explore the research</Link></div>
        <p className="mt-8 text-[12px] faint max-w-md">Temporary pricing is shown while commercial, payment, fulfillment, and regulatory review is completed.</p>
      </div>
      <div className="absolute left-5 md:left-10 bottom-[9vh] z-10 pointer-events-none">{CAPTIONS.map((c,i)=><div key={c.k} ref={(el)=>{capRefs.current[i]=el}} className="absolute bottom-0 left-0 w-[min(80vw,560px)]" style={{opacity:0}}><p className="label label-cyan mb-2">{c.k}</p><p className="mono text-[13px] md:text-[15px] text-bone/85">{c.v}</p></div>)}</div>
      <div className="absolute right-5 md:right-10 bottom-[9vh] z-10 text-right pointer-events-none hidden sm:block"><p className="label">Structure provenance</p><p className="mono text-[12px] text-bone/70 mt-1">Sequence-derived visualization · not measured</p></div>
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-bone/10 z-10"><div ref={barRef} className="h-full bg-cyan origin-left" style={{transform:'scaleX(0)'}}/></div>
      <div ref={hintRef} className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10"><span className="label !text-bone/35">{isStatic?'Static molecular view':'Scroll to move through the molecule'}</span></div>
    </section>
  )
}
