import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { LANE_META, diversify, useFollows, useLastVisit, usePulse } from '~/pulse/usePulse'
import type { PulseEvent } from '~/pulse/types'
import { PulseCard, isNewSince } from './Pulse'

/*
 * Home-page PulseChain, built for the phone:
 *   - a 3D card deck you swipe through (left = next, right = back), cards stacked in depth behind it,
 *     the whole stack leaning with the phone's tilt and a tiny buzz on each swipe where supported
 *   - the section's glow takes the colour of the card on top
 *   - a live pulse line and a ticker of the latest headlines
 * Desktop and larger tablets keep the swipeable rail. Reduced motion: no fly-out, no ticker scroll, no pulse animation.
 */
const DECK = 10

export function usePulseEvents(limit = DECK): PulseEvent[] {
  const { snap } = usePulse()
  const { follows } = useFollows()
  return useMemo(() => {
    const all = diversify(snap?.events ?? [])
    if (!follows.length) return all.slice(0, limit)
    const mine = all.filter((e) => e.compounds.some((c) => follows.includes(c))).slice(0, Math.ceil(limit / 2))
    return [...mine, ...all.filter((e) => !mine.includes(e))].slice(0, limit)
  }, [snap, follows, limit])
}

export function PulseDeck({ events, onLane }: { events: PulseEvent[]; onLane?: (color: string) => void }) {
  const [i, setI] = useState(0)
  const top = useRef<HTMLDivElement>(null)
  const drag = useRef({ on: false, x0: 0, y0: 0, dx: 0, t0: 0, moved: false, locked: false as false | 'x' | 'y' })
  const last = useLastVisit()
  const n = events.length
  const reduced = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  useEffect(() => { if (n) onLane?.(LANE_META[events[i % n].lane].color) }, [i, n, events, onLane])

  const go = (dir: 1 | -1) => {
    if (!n) return
    navigator.vibrate?.(8)
    if (reduced) { setI((v) => (v + dir + n) % n); return }
    const el = top.current
    if (el) { el.style.transition = 'transform .28s cubic-bezier(.4,0,1,1), opacity .28s'; el.style.transform = `translate3d(${dir === 1 ? -125 : 125}%, -24px, 0) rotate(${dir === 1 ? -16 : 16}deg)`; el.style.opacity = '0' }
    window.setTimeout(() => { setI((v) => (v + dir + n) % n); requestAnimationFrame(() => { if (el) { el.style.transition = ''; el.style.transform = ''; el.style.opacity = '' } }) }, 280)
  }

  const onDown = (e: React.PointerEvent) => { drag.current = { on: true, x0: e.clientX, y0: e.clientY, dx: 0, t0: e.timeStamp, moved: false, locked: false } }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0
    // decide once whether this gesture is a horizontal swipe or the page scrolling
    if (!d.locked && Math.hypot(dx, dy) > 8) d.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (d.locked !== 'x') return
    d.dx = dx; d.moved = true
    if (top.current) top.current.style.transform = `translate3d(${dx}px,${Math.abs(dx) * -0.04}px,0) rotate(${dx * 0.05}deg)`
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    const v = Math.abs(d.dx) / Math.max(1, e.timeStamp - d.t0)
    if (d.locked === 'x' && (Math.abs(d.dx) > 80 || v > 0.6)) go(d.dx < 0 ? 1 : -1)
    else if (top.current) { top.current.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1)'; top.current.style.transform = ''; window.setTimeout(() => { if (top.current) top.current.style.transition = '' }, 360) }
  }

  if (!n) return null
  return (
    <div className="deck" aria-roledescription="carousel" aria-label="Latest peptide updates">
      <div className="deck-stage">
        {[3, 2, 1, 0].map((k) => {
          const e = events[(i + k) % n]
          if (!e || (k > 0 && n <= k)) return null
          const isTop = k === 0
          return (
            <div
              key={e.id}
              ref={isTop ? top : undefined}
              className={`deck-card${isTop ? ' deck-top' : ''}`}
              style={{ '--k': k, '--lane': LANE_META[e.lane].color } as CSSProperties}
              aria-hidden={!isTop}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
              onClickCapture={isTop ? (ev) => { if (drag.current.moved) { ev.preventDefault(); ev.stopPropagation(); drag.current.moved = false } } : undefined}
            >
              <PulseCard e={e} compact isNew={isNewSince(e, last)} />
            </div>
          )
        })}
      </div>
      <div className="deck-controls">
        <button className="deck-btn" onClick={() => go(-1)} aria-label="Previous update"><svg viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" /></svg></button>
        <div className="deck-count" aria-live="polite"><b>{(i % n) + 1}</b> / {n}<span>Swipe for more</span></div>
        <button className="deck-btn" onClick={() => go(1)} aria-label="Next update"><svg viewBox="0 0 24 24" aria-hidden><path d="M9 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  )
}

/** A heartbeat line that runs across the section in the colour of the current card. */
export function PulseLine() {
  return (
    <svg className="pulse-line" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden>
      <path className="pulse-line-base" d="M0 30 H170 L185 30 L195 12 L207 50 L219 4 L231 42 L240 30 H380 L392 30 L400 20 L410 38 L418 30 H600" />
      <path className="pulse-line-glow" d="M0 30 H170 L185 30 L195 12 L207 50 L219 4 L231 42 L240 30 H380 L392 30 L400 20 L410 38 L418 30 H600" pathLength={100} />
    </svg>
  )
}

/** Latest headlines sliding past, each one tappable. */
export function PulseTicker({ events }: { events: PulseEvent[] }) {
  if (!events.length) return null
  const items = events.slice(0, 8).map((e) => ({
    id: e.id, color: LANE_META[e.lane].color,
    who: e.compounds.length && COMPOUND_BY_SLUG[e.compounds[0]] ? displayName(COMPOUND_BY_SLUG[e.compounds[0]]) : LANE_META[e.lane].label,
    what: e.labels.includes('MAJOR UPDATE') ? 'Major update' : e.lane === 'trials' ? (e.change ? `Trial ${e.change.after.toLowerCase()}` : 'Trial update') : e.lane === 'research' ? 'New paper' : e.lane === 'video' ? 'New video' : e.lane === 'regulation' ? 'Regulatory' : 'Update',
  }))
  const row = (dup: boolean) => items.map((t) => (
    <Link key={`${t.id}-${dup}`} to="/pulse" search={{ e: t.id }} className="ticker-item" style={{ '--c': t.color } as CSSProperties} tabIndex={dup ? -1 : undefined} aria-hidden={dup || undefined}>
      <i aria-hidden />{t.who}<span>{t.what}</span>
    </Link>
  ))
  return <div className="ticker" aria-label="Latest headlines"><div className="ticker-track">{row(false)}{row(true)}</div></div>
}
