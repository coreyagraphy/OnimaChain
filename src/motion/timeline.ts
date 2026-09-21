import gsapPackage from 'gsap/dist/gsap'
import scrollTriggerPackage from 'gsap/dist/ScrollTrigger'

const gsap = (gsapPackage as unknown as { gsap?: typeof gsapPackage }).gsap ?? gsapPackage
const ScrollTrigger = (scrollTriggerPackage as unknown as { ScrollTrigger?: typeof scrollTriggerPackage }).ScrollTrigger ?? scrollTriggerPackage

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
    scrub: opts.scrub ?? 0.6,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => opts.onProgress(self.progress),
  })
  return () => st.kill()
}

/** Assembly choreography phases from the architecture doc (TRUTH tab). */
export function assemblyPhase(p: number): { assemble: number; hold: number; disassemble: number } {
  // 0–20% scattered, 20–70% assemble, 70–85% hold, 85–100% disassemble
  const assemble = gsap.utils.clamp(0, 1, (p - 0.2) / 0.5)
  const hold = gsap.utils.clamp(0, 1, (p - 0.7) / 0.15)
  const disassemble = gsap.utils.clamp(0, 1, (p - 0.85) / 0.15)
  return { assemble, hold, disassemble }
}

export { gsap, ScrollTrigger }
