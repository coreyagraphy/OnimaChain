import { FINGERPRINT_DIMENSIONS, NOT_ASSESSED } from '~/data/signal'
import { CorpusHeader } from './CorpusHeader'

/**
 * Signal Integrity fingerprint — radial with a horizontal matrix equivalent.
 * With no corpus, every dimension renders "Not assessed — no corpus" and the radial is hollow.
 * Never collapsed to a single score.
 */
export function SignalFingerprint({ title = 'Signal integrity' }: { title?: string }) {
  const n = FINGERPRINT_DIMENSIONS.length
  const R = 92
  const cx = 130, cy = 130
  return (
    <div className="panel p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="display-md text-xl">{title}</h3>
        <span className="chip chip-hollow">No single score</span>
      </div>
      <CorpusHeader className="mt-2" />
      <div className="mt-5 grid md:grid-cols-[260px_1fr] gap-6 items-start">
        <svg viewBox="0 0 260 260" className="w-[240px] mx-auto" role="img" aria-label={`Signal integrity radial: ${n} dimensions, all ${NOT_ASSESSED}`}>
          {[0.33, 0.66, 1].map((k) => (
            <circle key={k} cx={cx} cy={cy} r={R * k} fill="none" stroke="#F2EEE6" strokeOpacity={0.1} strokeDasharray="2 4" />
          ))}
          {FINGERPRINT_DIMENSIONS.map((d, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2
            const r2 = (v: number) => Math.round(v * 100) / 100
            const x = r2(cx + Math.cos(a) * R)
            const y = r2(cy + Math.sin(a) * R)
            const lx = r2(cx + Math.cos(a) * (R + 14))
            const ly = r2(cy + Math.sin(a) * (R + 14))
            return (
              <g key={d.id}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="#F2EEE6" strokeOpacity={0.08} />
                <circle cx={x} cy={y} r={3.5} fill="none" stroke="#8A63FF" strokeOpacity={0.7} strokeDasharray="2 2" />
                <text x={lx} y={ly} fontSize={7.5} fill="#F2EEE6" fillOpacity={0.45} textAnchor="middle" dominantBaseline="middle" fontFamily="Inter Variable, sans-serif">
                  {i + 1}
                </text>
              </g>
            )
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10} fill="#F2EEE6" fillOpacity={0.5} fontFamily="JetBrains Mono Variable, monospace">no corpus</text>
          <text x={cx} y={cy + 9} textAnchor="middle" fontSize={9} fill="#F2EEE6" fillOpacity={0.35} fontFamily="JetBrains Mono Variable, monospace">0 sources</text>
        </svg>
        <table className="data" aria-label="Signal integrity matrix">
          <thead><tr><th>#</th><th>Dimension</th><th>Assessment</th></tr></thead>
          <tbody>
            {FINGERPRINT_DIMENSIONS.map((d, i) => (
              <tr key={d.id}>
                <td className="mono text-bone/45">{i + 1}</td>
                <td><span className="text-bone/90">{d.label}</span><span className="block text-[11px] faint mt-0.5">{d.def}</span></td>
                <td><span className="chip chip-hollow">{NOT_ASSESSED}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
