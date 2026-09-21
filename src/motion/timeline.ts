import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface ScrubOptions {
  trigger: HTMLElement
  /** Total scroll distance of the pinned section, e.g. '200%' or '+=1800'. */
  end: string
  pin?: boolean | HTMLElement
  onProgress: (p: number) => void
  scrub?: number | boolean
}

/**
 * One master timeline per route section, scrubbed by ScrollTrigger.
 * Returns a cleanup function. The consumer reads `progress` from a ref in its render loop.
 */
export function createScrub(opts: ScrubOptions): () => void {
  const st = ScrollTrigger.create({
    trigger: opts.trigger,
    start: 'top top',
    end: opts.end,
    pin: opts.pin ?? true,
    pinSpacing: true,
    // Boolean scrub = 1:1 with scroll. A number (e.g. 0.85) lags then fast-forwards to catch up.
    scrub: opts.scrub ?? true,
    anticipatePin: 0,
    fastScrollEnd: false,
    invalidateOnRefresh: true,
    onUpdate: (self) => opts.onProgress(self.progress),
  })
  requestAnimationFrame(() => ScrollTrigger.refresh())
  return () => st.kill()
}

/** Hold at rest, fly through the chain, then settle. Shared by camera + captions. */
export function heroStoryMap(p: number): number {
  const x = gsap.utils.clamp(0, 1, p)
  if (x < 0.2) return (x / 0.2) * 0.045
  if (x < 0.72) {
    const t = (x - 0.2) / 0.52
    const s = t * t * (3 - 2 * t)
    return 0.045 + s * 0.7
  }
  const t = (x - 0.72) / 0.28
  const s = t * t * (3 - 2 * t)
  return 0.745 + s * 0.255
}

/** Assembly choreography phases from the architecture doc (TRUTH tab). */
export function assemblyPhase(p: number): { assemble: number; hold: number; disassemble: number } {
  const assemble = gsap.utils.clamp(0, 1, (p - 0.2) / 0.5)
  const hold = gsap.utils.clamp(0, 1, (p - 0.7) / 0.15)
  const disassemble = gsap.utils.clamp(0, 1, (p - 0.85) / 0.15)
  return { assemble, hold, disassemble }
}

export { gsap, ScrollTrigger }
