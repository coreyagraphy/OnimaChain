import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { createScrub } from '~/motion/timeline'
import { SceneLoader } from './SceneLoader'

const HeroScene = lazy(() => import('~/scenes/hero/HeroScene').then((m) => ({ default: m.HeroScene })))

const CAPTIONS: Array<{ from: number; to: number; k: string; v: string }> = [
  { from: 0.04, to: 0.24, k: 'Structure', v: 'BPC-157 · 15 residues · GEPPPGKPADDAGLV' },
  { from: 0.26, to: 0.46, k: 'N-terminus', v: 'Gly1 → Glu2 — the loose end of a short chain' },
  { from: 0.45, to: 0.72, k: 'Hinge', v: 'Pro3–Pro5 — three consecutive prolines; the helix breaks here' },
  { from: 0.74, to: 0.88, k: 'C-terminus', v: 'Leu14 → Val15 — where the sequence stops and the claim begins' },
  { from: 0.9, to: 1.2, k: 'Resolve', v: 'Molecule → research record → claim → human signal. Three worlds, kept separate.' },
]

/**
 * Cinematic hero. STATE 1: near-black, particulate drift, the BPC-157 chain emerges from darkness.
 * STATE 2–3: scroll flies the camera into and through the hinge across a 250vh pinned section while the headline
 * sits in the scene. STATE 4: on exit the structure resolves into research → claim → signal.
 * Poster-first LCP; reduced motion keeps the static poster.
 */
export function Hero() {
  const allowed = useCanvasAllowed()
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const [firstFrame, setFirstFrame] = useState(false)
  const copyRef = useRef<HTMLDivElement>(null)
  const capRefs = useRef<Array<HTMLDivElement | null>>([])
  const barRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!section.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const cleanup = createScrub({
      trigger: section.current,
      end: '+=150%',
      pin: true,
      scrub: 0.9,
      onProgress: (p) => {
        progress.current = p
        if (copyRef.current) {
          const k = 1 - Math.min(1, p / 0.22)
          copyRef.current.style.opacity = String(k)
          copyRef.current.style.transform = `translateY(${-p * 90}px)`
          copyRef.current.style.pointerEvents = k < 0.3 ? 'none' : 'auto'
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.12))
        CAPTIONS.forEach((c, i) => {
          const el = capRefs.current[i]
          if (!el) return
          const inW = (p - c.from) / 0.06
          const outW = (c.to - p) / 0.06
          const o = Math.max(0, Math.min(1, inW, outW))
          el.style.opacity = String(o)
          el.style.transform = `translateY(${(1 - o) * 10}px)`
        })
      },
    })
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cleanup()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section ref={section} className="relative h-[100vh] w-full overflow-hidden bg-obsidian grain" aria-label="Hero">
      <img
        src="/posters/hero.svg"
        alt="A sequence-derived visualization of the BPC-157 chain: fifteen residues with a three-proline hinge, drawn in cyan and violet against near-black"
        width={1440}
        height={900}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms]"
        style={{ opacity: firstFrame ? 0 : 1 }}
      />
      {allowed && (
        <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} onFirstFrame={() => setFirstFrame(true)} cameraZ={16}>
          <Suspense fallback={null}>
            <HeroScene progress={progress} pointer={pointer} />
          </Suspense>
        </Lod0Canvas>
      )}
      {allowed && !firstFrame && <SceneLoader />}
      {/* STATE 1 veil: the screen begins almost black and the molecule emerges */}
      {allowed && <div className="hero-veil" style={{ opacity: firstFrame ? 0 : 0.92 }} aria-hidden />}
      {/* readability veil, bottom-weighted */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(10,11,14,0.35) 0%, rgba(10,11,14,0) 35%, rgba(10,11,14,0) 55%, rgba(10,11,14,0.78) 100%)' }} />

      {/* copy */}
      <div ref={copyRef} className="relative z-10 h-full wrap flex flex-col justify-end pb-[10vh] md:pb-[12vh]">
        <p className="label label-cyan mb-6">The Molecular Evidence &amp; Signal Atlas</p>
        <h1 className="display text-[clamp(3rem,8vw,7.6rem)] text-bone">
          Trace the signal.
          <br />
          <span className="text-bone/70">Follow the evidence.</span>
        </h1>
        <p className="lede mt-7 max-w-xl">
          Explore how molecular research, human reports, and internet claims connect — and where they don&rsquo;t.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/explore" className="btn btn-primary">Explore the Atlas</Link>
          <Link to="/claim/$id" params={{ id: 'CLAIM-BPC157-TENDON-REPAIR' }} className="btn">Inspect a Claim</Link>
        </div>
        <p className="mt-8 text-[12px] faint max-w-md">Research and educational information. Evidence classes remain explicitly separated.</p>
      </div>

      {/* flight captions */}
      <div className="absolute left-5 md:left-10 bottom-[9vh] z-10 pointer-events-none">
        {CAPTIONS.map((c, i) => (
          <div key={c.k} ref={(el) => { capRefs.current[i] = el }} className="absolute bottom-0 left-0 w-[min(80vw,560px)]" style={{ opacity: 0 }}>
            <p className="label label-cyan mb-2">{c.k}</p>
            <p className="mono text-[13px] md:text-[15px] text-bone/85">{c.v}</p>
          </div>
        ))}
      </div>

      {/* provenance + progress */}
      <div className="absolute right-5 md:right-10 bottom-[9vh] z-10 text-right pointer-events-none hidden sm:block">
        <p className="label">Structure provenance</p>
        <p className="mono text-[12px] text-bone/70 mt-1">Sequence-derived visualization (procedural, not measured)</p>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-bone/10 z-10">
        <div ref={barRef} className="h-full bg-cyan origin-left" style={{ transform: 'scaleX(0)' }} />
      </div>
      <div ref={hintRef} className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10">
        <span className="label !text-bone/35">Scroll to move through the structure</span>
      </div>
    </section>
  )
}
