import { useLayoutEffect, useRef } from 'react'
import type { ChangeEvent } from '~/data/claims'
import { ChangeDiff } from './ChangeDiff'
import { EmptyState } from './EmptyState'
import { gsap } from '~/motion/timeline'
import { RESEARCH_ENTITY_BY_ID, entityPath } from '~/data/research-entities'

const LANE_LABEL: Record<ChangeEvent['lane'], string> = { research: 'Research', trials: 'Trials', regulatory: 'Regulatory', signal: 'Real-world reports' }
const LANE_EMPTY: Record<ChangeEvent['lane'], string> = {
  research: 'No dated research update is indexed for this selection.',
  trials: 'No trial milestones are indexed to this exact record yet.',
  regulatory: 'No regulator decisions listed yet.',
  signal: 'No real-world reports yet — social platforms are not connected.',
}

/** One lane of the ledger. New events enter from chronological depth (translateZ) rather than fading upward. */
export function TimelineLane({ lane, events }: { lane: ChangeEvent['lane']; events: Array<ChangeEvent & { claim?: string; entityId?: string; source?: string }> }) {
  const list = useRef<HTMLDivElement>(null)
  const seen = useRef(new Set<string>())
  useLayoutEffect(() => {
    if (!list.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const fresh = Array.from(list.current.querySelectorAll<HTMLElement>('[data-ev]')).filter((el) => !seen.current.has(el.dataset.ev!))
    fresh.forEach((el) => seen.current.add(el.dataset.ev!))
    if (!fresh.length || reduced) return
    gsap.fromTo(fresh, { z: -520, opacity: 0, rotateX: 6 }, { z: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' })
  }, [events])
  return (
    <section aria-label={`${LANE_LABEL[lane]} lane`} className="grid md:grid-cols-[180px_1fr] gap-4 py-6 border-t hairline">
      <div>
        <p className="label">{LANE_LABEL[lane]}</p>
        <p className="mono text-[11px] text-bone/45 mt-1">{events.length} event{events.length === 1 ? '' : 's'}</p>
      </div>
      <div ref={list} className="grid gap-3 depth-stage">
        {events.length === 0 ? (
          <EmptyState compact title={LANE_EMPTY[lane]} />
        ) : (
          events.map((e, i) => (
            <div key={`${e.claim ?? e.entityId ?? ''}-${e.date}-${i}`} data-ev={`${e.claim ?? e.entityId ?? ''}-${e.date}-${e.change}`} className="depth-enter">
              {e.claim && <p className="mono text-[11px] text-bone/50 mb-1">{e.claim}</p>}
              {e.entityId && RESEARCH_ENTITY_BY_ID[e.entityId] && <a className="mono text-[11px] text-cyan mb-1 inline-block" href={entityPath(RESEARCH_ENTITY_BY_ID[e.entityId])}>{RESEARCH_ENTITY_BY_ID[e.entityId].name} ↗</a>}
              <ChangeDiff event={e} />
              {e.source && <a className="mono text-[11px] text-cyan/75 mt-2 inline-block" href={e.source} target="_blank" rel="noreferrer">Research status source ↗</a>}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
