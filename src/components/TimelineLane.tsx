import type { ChangeEvent } from '~/data/claims'
import { ChangeDiff } from './ChangeDiff'
import { EmptyState } from './EmptyState'

const LANE_LABEL: Record<ChangeEvent['lane'], string> = { research: 'Research', trials: 'Trials', regulatory: 'Regulatory', signal: 'Public signal' }
const LANE_EMPTY: Record<ChangeEvent['lane'], string> = {
  research: 'No research event indexed beyond claim creation.',
  trials: 'No trial record indexed — ClinicalTrials.gov connector not enabled.',
  regulatory: 'No regulatory record indexed.',
  signal: 'No public-signal event indexed — no platform source access enabled.',
}

export function TimelineLane({ lane, events }: { lane: ChangeEvent['lane']; events: Array<ChangeEvent & { claim?: string }> }) {
  return (
    <section aria-label={`${LANE_LABEL[lane]} lane`} className="grid md:grid-cols-[180px_1fr] gap-4 py-6 border-t hairline">
      <div>
        <p className="label">{LANE_LABEL[lane]}</p>
        <p className="mono text-[11px] text-bone/45 mt-1">{events.length} event{events.length === 1 ? '' : 's'}</p>
      </div>
      <div className="grid gap-3">
        {events.length === 0 ? (
          <EmptyState compact title={LANE_EMPTY[lane]} />
        ) : (
          events.map((e, i) => (
            <div key={i}>
              {e.claim && <p className="mono text-[11px] text-bone/50 mb-1">{e.claim}</p>}
              <ChangeDiff event={e} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
