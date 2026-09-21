import { TRANSLATION_STAGES, type TranslationStage } from '~/data/claims'

interface Row { outcome: string; stages: TranslationStage[] }

/**
 * Translation Gap: Cell → Mouse → Rat → Larger animal → Human → Controlled human → Approved use, per outcome.
 * Stages light only where a verified record supports them. Everything else is explicitly unlit.
 */
export function TranslationTrack({ rows }: { rows: Row[] }) {
  return (
    <div className="grid gap-4">
      {rows.length === 0 && <p className="text-sm muted">No outcome has an indexed translation path.</p>}
      {rows.map((r) => {
        const lit = new Set(r.stages)
        const furthest = TRANSLATION_STAGES.reduce((acc, s, i) => (lit.has(s.id) ? i : acc), -1)
        return (
          <div key={r.outcome} className="panel p-4 md:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold capitalize text-bone/90">{r.outcome.replace(/-/g, ' ')}</p>
              <p className="mono text-[11px] text-bone/55">
                {furthest < 0 ? 'No stage supported by an indexed record' : `Indexed support reaches: ${TRANSLATION_STAGES[furthest].label}`}
              </p>
            </div>
            <ol className="mt-4 grid grid-cols-7 gap-1" aria-label={`Translation stages for ${r.outcome}`}>
              {TRANSLATION_STAGES.map((s, i) => {
                const on = lit.has(s.id)
                return (
                  <li key={s.id} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-full h-[3px] rounded" style={{ background: on ? '#5FE3FF' : 'rgba(242,238,230,0.1)', boxShadow: on ? '0 0 12px rgba(95,227,255,0.6)' : undefined }} />
                    <span className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-cyan' : 'border border-bone/25'}`} aria-hidden />
                    <span className={`text-[10px] leading-tight ${on ? 'text-bone/90' : 'text-bone/40'}`}>{s.label}</span>
                    <span className="sr-only">{on ? 'supported by an indexed record' : 'not supported by an indexed record'}</span>
                    {i === furthest && <span className="chip chip-cyan !text-[9px]">reached</span>}
                  </li>
                )
              })}
            </ol>
          </div>
        )
      })}
    </div>
  )
}
