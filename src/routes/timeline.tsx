import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { BRAND } from '~/brand'
import { CLAIMS, type ChangeEvent } from '~/data/claims'
import { TimelineLane } from '~/components/TimelineLane'
import { RESEARCH_ENTITIES, WATCHLIST, REGULATORY_RECORDS, RESEARCH_ENTITY_BY_ID, entityTypeLabel } from '~/data/research-entities'

export const Route = createFileRoute('/timeline')({
  head: () => ({ meta: [{ title: `Timeline — ${BRAND}` }] }),
  component: Timeline,
})

const LANES = ['research', 'trials', 'regulatory', 'signal'] as const
type LedgerEvent = ChangeEvent & { claim?: string; entityId?: string; source?: string }
const LEDGER_EVENTS: LedgerEvent[] = [
  ...CLAIMS.flatMap((claim) => claim.changeHistory.map((event) => ({ ...event, claim: claim.id, entityId: claim.compound }))),
  ...WATCHLIST.filter((entity) => entity.statusAsOf && entity.statusSource && entity.stage).map((entity): LedgerEvent => ({
    date: entity.statusAsOf!, change: `Research status snapshot for ${entity.name}`, before: null, after: entity.stage!,
    lane: 'research', alteredInterpretation: false, entityId: entity.id, source: entity.statusSource,
  })),
  ...REGULATORY_RECORDS.map((record): LedgerEvent => ({
    date: record.statusAsOf, change: `Regulatory record for ${RESEARCH_ENTITY_BY_ID[record.compoundId]?.name ?? record.compoundId} in ${record.jurisdiction}`,
    before: null, after: `${record.authority}: ${record.status}`, lane: 'regulatory', alteredInterpretation: false,
    entityId: record.compoundId, source: record.source,
  })),
].sort((a, b) => a.date.localeCompare(b.date))

/**
 * Timeline with a time scrub. Dragging the scrubber moves "now"; events enter the scene from chronological depth.
 * Nothing before the first ledger entry is invented: the scrub floor is the earliest recorded event.
 */
function Timeline() {
  const [only, setOnly] = useState(false)
  const [lanes, setLanes] = useState<Set<string>>(new Set(LANES))
  const [entityId, setEntityId] = useState('all')
  const all = useMemo(() => LEDGER_EVENTS.filter((event) => entityId === 'all' || event.entityId === entityId), [entityId])
  const dates = useMemo(() => Array.from(new Set(LEDGER_EVENTS.map((event) => event.date))), [])
  const [t, setT] = useState(dates.length - 1)
  const now = dates[t] ?? dates[dates.length - 1]
  const events = all.filter((e) => e.date <= now).filter((e) => !only || e.alteredInterpretation)
  return (
    <div className="pt-28 wrap timeline-world">
      <p className="label label-amber">Timeline · change log</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What changed, and when.</h1>
      <p className="lede mt-5 max-w-2xl">Claim edits, sourced Watchlist status snapshots, and any verified regulatory records share one dated view. A status snapshot is not itself a trial milestone or a claim revision.</p>

      <label className="grid gap-2 mt-8 max-w-sm"><span className="label">Research record</span><select value={entityId} onChange={(event) => setEntityId(event.target.value)}><option value="all">All records</option>{RESEARCH_ENTITIES.map((entity) => <option key={entity.id} value={entity.id}>{entity.name} · {entityTypeLabel(entity)}</option>)}</select></label>

      <div className="mt-10 panel glass relative p-5 md:p-6 timeline-scrub">
        <div className="relative flex flex-wrap items-baseline justify-between gap-3">
          <p className="label label-cyan">Scrub through time</p>
          <p className="mono text-[12px] text-bone/70">Now: <span className="timeline-now">{now}</span> · {events.length} entr{events.length === 1 ? 'y' : 'ies'} showing · log starts {dates[0]}</p>
        </div>
        <input type="range" min={0} max={Math.max(0, dates.length - 1)} step={1} value={t} onChange={(e) => setT(Number(e.target.value))} className="relative w-full mt-3" aria-label="Scrub the ledger by date" aria-valuetext={now} />
        <ol className="relative mt-1 flex justify-between mono text-[10px] text-bone/45">
          {dates.map((d, i) => <li key={d} className={i === t ? 'timeline-current' : ''}>{d}</li>)}
        </ol>
        <p className="relative mt-3 text-[12px] muted">Only indexed claim edits, dated status snapshots, and sourced regulatory records appear. No event is inferred from a compound or combination page.</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 items-center">
        {LANES.map((l) => <button key={l} className="btn btn-sm capitalize" aria-pressed={lanes.has(l)} onClick={() => { const n = new Set(lanes); n.has(l) ? n.delete(l) : n.add(l); setLanes(n) }}>{l === 'signal' ? 'Real-world reports' : l}</button>)}
        <label className="ml-auto flex items-center gap-2 text-sm muted"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Only show changes that changed our reading of a claim</label>
      </div>
      <div className="mt-6 depth-stage">
        {LANES.filter((l) => lanes.has(l)).map((lane) => <TimelineLane key={lane} lane={lane} events={events.filter((e) => e.lane === lane)} />)}
      </div>
      <p className="mt-8 mono text-[11px] text-bone/45">{all.length} entr{all.length === 1 ? 'y' : 'ies'} for this selection · log starts {dates[0]}.</p>
    </div>
  )
}
