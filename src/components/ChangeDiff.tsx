import type { ChangeEvent } from '~/data/claims'

/** Before/after diff for one change-history event. Amber marks change; nothing is silently rewritten. */
export function ChangeDiff({ event }: { event: ChangeEvent }) {
  return (
    <div className="panel p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="mono text-[12px] text-amber">{event.date}</span>
        <span className="chip chip-amber">{event.lane}</span>
        {event.alteredInterpretation && <span className="chip">altered interpretation</span>}
      </div>
      <p className="mt-2 font-semibold text-bone/90">{event.change}</p>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-bone/10 p-3">
          <p className="label mb-1">Before</p>
          <p className="mono text-sm text-bone/60">{event.before ?? '— (no prior state)'}</p>
        </div>
        <div className="rounded-lg border border-amber/30 p-3">
          <p className="label label-amber mb-1">After</p>
          <p className="mono text-sm text-bone/90">{event.after}</p>
        </div>
      </div>
    </div>
  )
}
