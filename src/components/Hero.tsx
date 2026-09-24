import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed, useVisualStore } from '~/motion/useReducedMotion'
import { createScrub } from '~/motion/timeline'
import { getLenis } from '~/motion/lenis'
import { tilt } from '~/motion/tilt'
import { brand } from '~/brand'

const HeroScene = lazy(() => import('~/scenes/hero/HeroScene').then((m) => ({ default: m.HeroScene })))

/*
 * One pinned hero, one progress value. Everything below is a pure function of that value, so fast scrolls,
 * reversal and refresh always land on the right frame.
 *   0–12%   orientation line + scroll cue + Skip intro
 *   12–50%  two short captions while the camera flies in and through
 *   52–74%  the site's theme, three big lines, each lighting a marker in the scene (nothing else on screen)
 *   76%+    the headline, alone, after the camera has cleared the molecule
 */
const PIN = 1.4 // viewport heights of scroll the hero holds for (desktop)
/** Phones get straight to the library: the headline and buttons are there from the first frame. */
const PIN_MOBILE = 0.7
const CAPTIONS = [
  { from: 0.12, to: 0.3, k: 'Meet the molecule', v: 'BPC-157 is a chain of 15 amino acids.' },
  { from: 0.32, to: 0.5, k: 'Move closer', v: 'Travel between the glowing parts that make up the chain.' },
]
const THEME = [
  { at: 0.52, text: 'What was studied.', color: '#5FE3FF' },
  { at: 0.56, text: 'What people say.', color: '#F2EEE6' },
  { at: 0.6, text: 'What’s still unknown.', color: '#C6A8FF' },
]
const THEME_OUT: [number, number] = [0.7, 0.74]
const HEAD_IN: [number, number] = [0.76, 0.87]
const ramp = (a: number, b: number, x: number) => Math.max(0, Math.min(1, (x - a) / (b - a)))

export function Hero() {
  const allowed = useCanvasAllowed()
  const isStatic = useVisualStore((s) => s.mode === 'static')
  const section = useRef<HTMLElement>(null), progress = useRef(0), pointer = useRef({ x: 0, y: 0 })
  const [firstFrame, setFirstFrame] = useState(false)
  const [done, setDone] = useState(false)
  const copyRef = useRef<HTMLDivElement>(null), copyPlateRef = useRef<HTMLDivElement>(null), barRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null), themeRef = useRef<HTMLDivElement>(null)
  const capRefs = useRef<Array<HTMLDivElement | null>>([]), lineRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const orbA = useRef<HTMLDivElement>(null), orbB = useRef<HTMLDivElement>(null), chroma = useRef<HTMLDivElement>(null)
  const primaryCta = useRef<HTMLAnchorElement>(null)
  const doneRef = useRef(false)
  const mobileRef = useRef(false)
  const [mobile, setMobile] = useState(false)

  const paint = (p: number) => {
    progress.current = p
    const out = 1 - ramp(THEME_OUT[0], THEME_OUT[1], p)
    if (introRef.current) { const k = 1 - ramp(0.06, 0.12, p); introRef.current.style.opacity = String(k); introRef.current.style.transform = `translate3d(0,${-p * 120}px,0)`; introRef.current.style.visibility = k < 0.01 ? 'hidden' : 'visible' }
    CAPTIONS.forEach((c, i) => { const el = capRefs.current[i]; if (!el) return; const o = Math.max(0, Math.min(1, (p - c.from) / 0.05, (c.to - p) / 0.05)); el.style.opacity = String(o); el.style.transform = `translate3d(0,${(1 - o) * 14}px,0)` })
    if (themeRef.current) themeRef.current.style.visibility = p > THEME[0].at - 0.01 && p < THEME_OUT[1] + 0.01 ? 'visible' : 'hidden'
    THEME.forEach((t, i) => { const el = lineRefs.current[i]; if (!el) return; const k = ramp(t.at, t.at + 0.05, p) * out; el.style.opacity = String(k); el.style.transform = `translate3d(${(1 - k) * -40}px,0,0) scale(${0.94 + k * 0.06})` })
    const h = mobileRef.current ? 1 : ramp(HEAD_IN[0], HEAD_IN[1], p)
    if (copyRef.current) { copyRef.current.style.opacity = String(h); copyRef.current.style.transform = `translate3d(0,${(1 - h) * 42}px,0) scale(${0.96 + h * 0.04})`; copyRef.current.style.pointerEvents = h < 0.8 ? 'none' : 'auto' }
    if (copyPlateRef.current) copyPlateRef.current.style.opacity = String(Math.min(0.82, h))
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    // decorative layers: each moves at its own speed, so the HTML layer has depth too
    if (orbA.current) orbA.current.style.transform = `translate3d(${-p * 18 + tilt.x * 14}vw,${-p * 22 + tilt.y * 10}vh,0) scale(${1 + p * 0.5})`
    if (orbB.current) orbB.current.style.transform = `translate3d(${p * 10 - tilt.x * 22}vw,${p * 30 - tilt.y * 16}vh,0) scale(${1 + p * 0.9})`
    if (chroma.current) chroma.current.style.transform = `translate3d(${tilt.x * -2}vw,${p * -8}vh,0)`
    const d = p > 0.72
    if (d !== doneRef.current) { doneRef.current = d; setDone(d) }
  }

  useEffect(() => {
    const isMobile = window.matchMedia?.('(max-width: 767px)').matches ?? false
    mobileRef.current = isMobile
    setMobile(isMobile)
    if (!section.current || isStatic || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { if (isMobile) paint(1); return }
    paint(0)
    const cleanup = createScrub({ trigger: section.current, end: `+=${(isMobile ? PIN_MOBILE : PIN) * 100}%`, pin: true, scrub: true, onProgress: paint })
    const onMove = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2; pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('pointermove', onMove, { passive: true })
    // keep the tilt-driven HTML layers alive between scroll events (transform-only writes)
    let raf = 0
    const idle = () => { paint(progress.current); raf = requestAnimationFrame(idle) }
    raf = requestAnimationFrame(idle)
    return () => { cleanup(); cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove) }
  }, [isStatic]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Skip intro: move the document and the shared progress to the finished frame, then hand focus to the first action. */
  const skip = () => {
    const el = section.current
    if (!el) return
    const top = (el.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY
    const end = top + window.innerHeight * (mobileRef.current ? PIN_MOBILE : PIN)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(end, { immediate: true, force: true })
    else window.scrollTo(0, end)
    paint(1)
    requestAnimationFrame(() => primaryCta.current?.focus({ preventScroll: true }))
  }

  return (
    <div className="hero-pin-root">
    <section ref={section} className="hero-shell relative h-[100vh] w-full overflow-hidden bg-obsidian grain" aria-label="Peptide research introduction">
      <picture><source media="(max-aspect-ratio: 4/5)" srcSet="/posters/hero-portrait.jpg"/><img src="/posters/hero.jpg" alt="A glowing sequence-derived molecular chain in a deep cyan and violet laboratory environment" width={1440} height={900} fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms]" style={{opacity:firstFrame?0:1}}/></picture>
      <div ref={chroma} className="hero-chroma" aria-hidden/><div ref={orbA} className="hero-orbit hero-orbit-a" aria-hidden/><div ref={orbB} className="hero-orbit hero-orbit-b" aria-hidden/>
      {allowed && <Lod0Canvas className="absolute inset-0" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} onFirstFrame={()=>setFirstFrame(true)} cameraZ={16}><Suspense fallback={null}><HeroScene progress={progress} pointer={pointer}/></Suspense></Lod0Canvas>}
      <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(180deg,rgba(10,11,14,.36),rgba(10,11,14,0) 35%,rgba(10,11,14,0) 55%,rgba(10,11,14,.82))'}}/>

      {/* 0–12%: orientation */}
      {!isStatic && !mobile && (
        <div ref={introRef} className="absolute inset-x-0 bottom-[12vh] z-10 wrap pointer-events-none">
          <p className="label label-cyan">Peptides, up close</p>
          <p className="display text-[clamp(2.2rem,6vw,4.6rem)] mt-3 max-w-[14ch] text-bone">Small molecules.<br/>Big questions.</p>
          <div className="hero-entry-links"><Link to="/learn">Try something hands-on ↗</Link><Link to="/explore">Meet the molecules</Link></div>
          <p className="mt-6 flex items-center gap-3 text-[14px] text-bone/75"><span className="hero-scroll-cue" aria-hidden />Scroll to explore</p>
        </div>
      )}

      {/* 52–74%: the theme — flat, facing the viewer, sized to the phone, nothing else on screen */}
      {!isStatic && !mobile && (
        <div ref={themeRef} className="hero-theme absolute inset-0 z-10 wrap flex flex-col justify-center pointer-events-none" style={{ visibility: 'hidden' }} aria-hidden>
          <div className="hero-theme-scrim" />
          {THEME.map((t, i) => (
            <p key={t.text} ref={(el) => { lineRefs.current[i] = el }} className="hero-theme-line display" style={{ color: t.color, opacity: 0 }}>{t.text}</p>
          ))}
        </div>
      )}

      <div ref={copyPlateRef} className="hero-copy-plate" style={{ opacity: isStatic ? .82 : 0 }} aria-hidden />
      <div
        ref={copyRef}
        className="hero-copy-late relative z-10 h-full wrap flex flex-col justify-center"
        style={{ opacity: isStatic ? 1 : 0 }}
        onFocusCapture={() => { if (!isStatic && progress.current < HEAD_IN[1]) skip() }}
      >
        <p className="label label-cyan mb-5">{brand.primaryTagline}</p>
        <h1 className="display hero-title text-bone">See the molecule.<br/><span>Understand the evidence.</span></h1>
        <p className="lede mt-7 max-w-xl hidden md:block">Explore peptide science in plain English. See what studies tested, what they found, and what remains uncertain.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link ref={primaryCta} to="/explore" className="btn btn-primary">Explore the library</Link><Link to="/learn" className="btn">Enter the Learning Lab</Link></div>
      </div>

      {/* 12–50%: captions */}
      <div className="absolute left-5 md:left-10 bottom-[9vh] z-10 pointer-events-none" hidden={mobile}>{CAPTIONS.map((c,i)=><div key={c.k} ref={(el)=>{capRefs.current[i]=el}} className="absolute bottom-0 left-0 w-[min(84vw,560px)]" style={{opacity:0}}><p className="label label-cyan mb-2">{c.k}</p><p className="text-[15px] md:text-[17px] text-bone/90">{c.v}</p></div>)}</div>

      {!isStatic && !done && !mobile && <button className="hero-skip btn btn-sm" onClick={skip}>Skip intro</button>}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-bone/10 z-10"><div ref={barRef} className="h-full bg-cyan origin-left" style={{transform:'scaleX(0)'}}/></div>
    </section>
    </div>
  )
}
