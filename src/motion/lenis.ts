import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null
let registered = false

export function getLenis(): Lenis | null {
  return lenis
}

/** Start inertial scroll and wire it to GSAP ScrollTrigger. Idempotent. */
export function startLenis(): Lenis | null {
  if (typeof window === 'undefined') return null
  if (lenis) return lenis
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) return null
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t: number) => lenis?.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function stopLenis() {
  lenis?.destroy()
  lenis = null
}
