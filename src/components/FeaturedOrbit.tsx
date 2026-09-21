import { useEffect, useRef, useState } from 'react'
import { CompoundCard } from './CompoundCard'
import { useReducedMotion } from '~/motion/useReducedMotion'
import type { Compound } from '~/data/compounds'

/*
 * Featured cards on a slow, endless 3D carousel.
 * Cards drift sideways on a curved wall: the one in the middle faces you, the ones at the edges turn away and sink back.
 * Each card also sways a little on its own. Hover, touch or keyboard focus stops the drift so a card can be chosen;
 * drag or swipe spins it by hand. The molecules inside keep animating the whole time (they live in the shared canvas).
 * Reduced motion: the plain side-scrolling row, no drift.
 */
const SPEED = 34 // px per second while drifting
const GAP = 26

export function FeaturedOrbit({ compounds }: { compounds: Compound[] }) {
  const reduced = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const cards = useRef<Array<HTMLDivElement | null>>([])
  const [copies, setCopies] = useState(1)
  const [cardW, setCardW] = useState(320)
  const s = useRef({ offset: 0, pending: 0, speed: SPEED, hold: false, holdUntil: 0, hovered: -1, down: false, dragging: false, lastX: 0, lastT: 0, vel: 0, t: 0, suppress: false })
  const items = Array.from({ length: copies }, () => compounds).flat()

  // enough copies that the loop never shows a gap, even on very wide screens
  useEffect(() => {
    if (reduced) return
    const fit = () => {
      const vw = stage.current?.clientWidth ?? window.innerWidth
      const w = vw < 640 ? 272 : 320
      setCardW(w)
      setCopies(Math.max(1, Math.ceil((vw + 2 * (w + GAP)) / (compounds.length * (w + GAP)))))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [reduced, compounds.length])

  useEffect(() => {
    if (reduced) return
    const el = stage.current
    if (!el) return
    const st = s.current
    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; st.t += dt
      const vw = el.clientWidth
      const step = cardW + GAP, total = items.length * step
      const stopped = st.hold || st.hovered >= 0 || st.down || now < st.holdUntil
      st.speed += ((stopped ? 0 : SPEED) - st.speed) * Math.min(1, dt * 2.2)
      if (!st.down) { st.offset += st.vel * dt; st.vel *= Math.pow(0.04, dt) } // fling momentum after a drag
      const ease = st.pending * Math.min(1, dt * 5)
      st.pending -= ease
      st.offset += st.speed * dt + ease
      st.offset = ((st.offset % total) + total) % total
      cards.current.forEach((c, j) => {
        if (!c) return
        const x = (((j * step - st.offset) % total) + total) % total - step
        const d = Math.max(-1.7, Math.min(1.7, (x + cardW / 2 - vw / 2) / (vw / 2)))
        const held = st.hovered === j
        const lift = held ? 70 : 0
        const sway = held ? 0 : 1
        const rotY = -d * 32 + Math.sin(st.t * 0.45 + j * 1.7) * 5 * sway
        const rotZ = Math.sin(st.t * 0.33 + j) * 1.6 * sway
        const y = Math.sin(st.t * 0.7 + j * 1.3) * 12 * sway + d * d * 26
        const z = -Math.abs(d) * 190 + lift
        c.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`
        c.style.zIndex = String(Math.round(200 - Math.abs(d) * 100 + lift))
      })
      raf = requestAnimationFrame(tick)
    }
    const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick) }
    // only run while the row is near the screen or the tab is visible
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting) && document.visibilityState === 'visible') start(); else cancelAnimationFrame(raf) }, { rootMargin: '200px 0px' })
    io.observe(el)
    const onVis = () => { if (document.visibilityState === 'hidden') cancelAnimationFrame(raf) }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [reduced, cardW, items.length])

  if (reduced) {
    return <div className="mt-12 overflow-x-auto rail pb-8"><div className="wrap flex gap-5 items-end w-max">{compounds.map((c, i) => <CompoundCard key={c.slug} compound={c} index={i} />)}</div></div>
  }

  const st = s.current
  const onDown = (e: React.PointerEvent) => { st.down = true; st.dragging = false; st.lastX = e.clientX; st.lastT = e.timeStamp; st.vel = 0; st.pending = 0 }
  const onMove = (e: React.PointerEvent) => {
    if (!st.down) return
    const dx = e.clientX - st.lastX
    if (!st.dragging && Math.abs(dx) < 6) return
    if (!st.dragging) { st.dragging = true; stage.current?.setPointerCapture(e.pointerId) }
    const dts = Math.max(0.008, (e.timeStamp - st.lastT) / 1000)
    st.lastX = e.clientX; st.lastT = e.timeStamp
    st.offset -= dx
    st.vel = Math.max(-2400, Math.min(2400, -dx / dts))
  }
  const onUp = (e: React.PointerEvent) => {
    if (st.dragging) { st.suppress = true; stage.current?.releasePointerCapture?.(e.pointerId) }
    st.down = false; st.dragging = false
    // touch has no hover: stay still a moment so the person can tap the card they stopped on
    if (e.pointerType !== 'mouse') st.holdUntil = performance.now() + 3500
  }
  const nudge = (dir: number) => { st.pending += dir * (cardW + GAP); st.holdUntil = performance.now() + 2500 }
  const center = (j: number) => {
    const c = cards.current[j], el = stage.current
    if (!c || !el) return
    const x = (((j * (cardW + GAP) - st.offset) % (items.length * (cardW + GAP))) + items.length * (cardW + GAP)) % (items.length * (cardW + GAP)) - (cardW + GAP)
    st.pending = x + cardW / 2 - el.clientWidth / 2
  }

  return (
    <div className="orbit mt-8">
      <div
        ref={stage}
        className="orbit-stage"
        style={{ '--card-w': `${cardW}px` } as React.CSSProperties}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onClickCapture={(e) => { if (st.suppress) { e.preventDefault(); e.stopPropagation(); st.suppress = false } }}
        onFocus={() => { st.hold = true }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) st.hold = false }}
        aria-roledescription="carousel" aria-label="Featured peptides"
      >
        {items.map((c, j) => (
          <div
            key={`${c.slug}-${j}`}
            ref={(el) => { cards.current[j] = el }}
            className="orbit-card"
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') st.hovered = j }}
            onPointerLeave={() => { if (st.hovered === j) st.hovered = -1 }}
            onFocus={() => center(j)}
            aria-hidden={j >= compounds.length ? true : undefined}
          >
            <CompoundCard compound={c} index={j} fluid />
          </div>
        ))}
      </div>
      <div className="wrap mt-4 flex items-center justify-between gap-4">
        <p className="text-[13px] text-bone/55">Drag or swipe to spin. Stop on one to open it.</p>
        <div className="flex gap-2">
          <button className="orbit-arrow" onClick={() => nudge(-1)} aria-label="Previous peptide">‹</button>
          <button className="orbit-arrow" onClick={() => nudge(1)} aria-label="Next peptide">›</button>
        </div>
      </div>
    </div>
  )
}
