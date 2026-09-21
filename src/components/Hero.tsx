import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed, useVisualStore } from '~/motion/useReducedMotion'
import { createScrub } from '~/motion/timeline'

const HeroScene = lazy(() => import('~/scenes/hero/HeroScene').then((m) => ({ default: m.HeroScene })))
const CAPTIONS = [
  { from: .06, to: .27, k: 'Meet the molecule', v: 'BPC-157 is a chain of 15 amino acids.' },
  { from: .3, to: .57, k: 'Move closer', v: 'Travel between the glowing parts that make up the chain.' },
  { from: .59, to: .79, k: 'Read the story', v: 'See what was studied, what people say, and what is still unknown.' },
]

export function Hero() {
  const allowed = useCanvasAllowed()
  const isStatic = useVisualStore((s) => s.mode === 'static')
  const section = useRef<HTMLElement>(null), progress = useRef(0), pointer = useRef({ x: 0, y: 0 })
  const [firstFrame, setFirstFrame] = useState(false)
  const copyRef = useRef<HTMLDivElement>(null), copyPlateRef = useRef<HTMLDivElement>(null), barRef = useRef<HTMLDivElement>(null)
  const capRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (!section.current || isStatic || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (copyRef.current) copyRef.current.style.opacity = '0'
    const cleanup = createScrub({ trigger: section.current, end: '+=220%', pin: true, scrub: true, onProgress: (p) => {
      progress.current = p
      if (copyRef.current) { const k=Math.max(0,Math.min(1,(p-.79)/.15)); copyRef.current.style.opacity=String(k); copyRef.current.style.transform=`translateY(${(1-k)*42}px) scale(${.96+k*.04})`; copyRef.current.style.pointerEvents=k<.8?'none':'auto' }
      if (copyPlateRef.current) copyPlateRef.current.style.opacity=String(Math.max(0,Math.min(.82,(p-.77)/.16)))
      if (barRef.current) barRef.current.style.transform=`scaleX(${p})`
      CAPTIONS.forEach((c,i)=>{ const el=capRefs.current[i]; if(!el)return; const o=Math.max(0,Math.min(1,(p-c.from)/.06,(c.to-p)/.06)); el.style.opacity=String(o); el.style.transform=`translateY(${(1-o)*10}px)` })
    }})
    const onMove=(e:PointerEvent)=>{ pointer.current.x=(e.clientX/window.innerWidth-.5)*2; pointer.current.y=(e.clientY/window.innerHeight-.5)*2 }
    window.addEventListener('pointermove',onMove,{passive:true})
    return ()=>{ cleanup(); window.removeEventListener('pointermove',onMove) }
  },[isStatic])
  return (
    <section ref={section} className="hero-shell relative h-[100vh] w-full overflow-hidden bg-obsidian grain" aria-label="Molecular collection introduction">
      <picture><source media="(max-aspect-ratio: 4/5)" srcSet="/posters/hero-portrait.jpg"/><img src="/posters/hero.jpg" alt="A glowing sequence-derived molecular chain in a deep cyan and violet laboratory environment" width={1440} height={900} fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms]" style={{opacity:firstFrame?0:1}}/></picture>
      <div className="hero-chroma" aria-hidden/><div className="hero-orbit hero-orbit-a" aria-hidden/><div className="hero-orbit hero-orbit-b" aria-hidden/>
      {allowed && <Lod0Canvas className="absolute inset-0" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} onFirstFrame={()=>setFirstFrame(true)} cameraZ={16}><Suspense fallback={null}><HeroScene progress={progress} pointer={pointer}/></Suspense></Lod0Canvas>}
      <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(180deg,rgba(10,11,14,.36),rgba(10,11,14,0) 35%,rgba(10,11,14,0) 55%,rgba(10,11,14,.82))'}}/>
      <div ref={copyPlateRef} className="hero-copy-plate" style={{ opacity: isStatic ? .82 : 0 }} aria-hidden />
      <div ref={copyRef} className="hero-copy-late relative z-10 h-full wrap flex flex-col justify-center" style={{ opacity: isStatic ? 1 : 0 }}>
        <p className="label label-cyan mb-5">Peptides, made easier</p>
        <h1 className="display hero-title text-bone">See the molecule.<br/><span>Understand the story.</span></h1>
        <p className="lede mt-7 max-w-xl">Shop common peptides, learn what each one is, and check the original sources without needing a science degree.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link to="/explore" className="btn btn-primary">Shop the collection</Link><Link to="/signal" className="btn">Find a peptide</Link></div>
      </div>
      <div className="absolute left-5 md:left-10 bottom-[9vh] z-10 pointer-events-none">{CAPTIONS.map((c,i)=><div key={c.k} ref={(el)=>{capRefs.current[i]=el}} className="absolute bottom-0 left-0 w-[min(80vw,560px)]" style={{opacity:0}}><p className="label label-cyan mb-2">{c.k}</p><p className="mono text-[13px] md:text-[15px] text-bone/85">{c.v}</p></div>)}</div>
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-bone/10 z-10"><div ref={barRef} className="h-full bg-cyan origin-left" style={{transform:'scaleX(0)'}}/></div>
    </section>
  )
}
