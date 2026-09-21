import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { BRAND } from '~/brand'
import { CLAIMS } from '~/data/claims'
import { TimelineLane } from '~/components/TimelineLane'

export const Route = createFileRoute('/timeline')({
  head: () => ({ meta: [{ title: `Timeline / change ledger — ${BRAND}` }] }),
  component: Timeline,
})

const LANES = ['research', 'trials', 'regulatory', 'signal'] as const

/**
 * Timeline with a time scrub. Dragging the scrubber moves "now"; events enter the scene from chronological depth.
 * Nothing before the first ledger entry is invented: the scrub floor is the earliest recorded event.
 */
function Timeline() {
  const [only, setOnly] = useState(false)
  const [lanes, setLanes] = useState<Set<string>>(new Set(LANES))
  const all = useMemo(() => CLAIMS.flatMap((c) => c.changeHistory.map((e) => ({ ...e, claim: c.id }))).sort((a, b) => a.date.localeCompare(b.date)), [])
  const dates = useMemo(() => Array.from(new Set(all.map((e) => e.date))), [all])
  const [t, setT] = useState(dates.length - 1)
  const now = dates[t] ?? dates[dates.length - 1]
  const events = all.filter((e) => e.date <= now).filter((e) => !only || e.alteredInterpretation)
  return (
    <div className="pt-28 wrap">
      <p className="label label-amber">Timeline · change ledger</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What changed, and when.</h1>
      <p className="lede mt-5 max-w-2xl">Every event carries date, source, what changed, previous state, new state. History is never rewritten silently.</p>

      <div className="mt-10 panel glass relative p-5 md:p-6">
        <div className="relative flex flex-wrap items-baseline justify-between gap-3">
          <p className="label label-cyan">Scrub through time</p>
          <p className="mono text-[12px] text-bone/70">Now: <span className="text-bone">{now}</span> · {events.length} event{events.length === 1 ? '' : 's'} visible · ledger floor {dates[0]}</p>
        </div>
        <input type="range" min={0} max={Math.max(0, dates.length - 1)} step={1} value={t} onChange={(e) => setT(Number(e.target.value))} className="relative w-full mt-3" aria-label="Scrub the ledger by date" aria-valuetext={now} />
        <ol className="relative mt-1 flex justify-between mono text-[10px] text-bone/45">
          {dates.map((d, i) => <li key={d} className={i === t ? 'text-cyan' : ''}>{d}</li>)}
        </ol>
        <p className="relative mt-3 text-[12px] muted">Research nodes appear and disappear, claim interpretations update and regulatory state changes as you move — but only from ledger entries. Before {dates[0]}, no record existed.</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 items-center">
        {LANES.map((l) => <button key={l} className="btn btn-sm capitalize" aria-pressed={lanes.has(l)} onClick={() => { const n = new Set(lanes); n.has(l) ? n.delete(l) : n.add(l); setLanes(n) }}>{l === 'signal' ? 'Public signal' : l}</button>)}
        <label className="ml-auto flex items-center gap-2 text-sm muted"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Only show changes that altered a claim interpretation</label>
      </div>
      <div className="mt-6 depth-stage">
        {LANES.filter((l) => lanes.has(l)).map((lane) => <TimelineLane key={lane} lane={lane} events={events.filter((e) => e.lane === lane)} />)}
      </div>
      <p className="mt-8 mono text-[11px] text-bone/45">Ledger: {all.length} event(s) total · What we could responsibly say before {dates[0]}: no record existed.</p>
    </div>
  )
}
