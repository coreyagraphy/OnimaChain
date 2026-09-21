import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CLAIMS } from '~/data/claims'
import { TimelineLane } from '~/components/TimelineLane'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/timeline')({
  head: () => ({ meta: [{ title: `Timeline / change ledger — ${BRAND}` }] }),
  component: Timeline,
})

const LANES = ['research', 'trials', 'regulatory', 'signal'] as const

function Timeline() {
  const [only, setOnly] = useState(false)
  const [lanes, setLanes] = useState<Set<string>>(new Set(LANES))
  const events = CLAIMS.flatMap((c) => c.changeHistory.map((e) => ({ ...e, claim: c.id }))).filter((e) => !only || e.alteredInterpretation)
  return (
    <div className="pt-28 wrap">
      <p className="label label-amber">Timeline · change ledger</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What changed, and when.</h1>
      <p className="lede mt-5 max-w-2xl">Every event carries date, source, what changed, previous state, new state. History is never rewritten silently.</p>
      <div className="mt-8 flex flex-wrap gap-2 items-center">
        {LANES.map((l) => <button key={l} className="btn btn-sm capitalize" aria-pressed={lanes.has(l)} onClick={() => { const n = new Set(lanes); n.has(l) ? n.delete(l) : n.add(l); setLanes(n) }}>{l === 'signal' ? 'Public signal' : l}</button>)}
        <label className="ml-auto flex items-center gap-2 text-sm muted"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Only show changes that altered a claim interpretation</label>
      </div>
      <div className="mt-6">
        {LANES.filter((l) => lanes.has(l)).map((lane) => <TimelineLane key={lane} lane={lane} events={events.filter((e) => e.lane === lane)} />)}
      </div>
      <p className="mt-8 mono text-[11px] text-bone/45">Ledger: {events.length} event(s) · What we could responsibly say before 2026-09-20: no record existed.</p>
    </div>
  )
}
