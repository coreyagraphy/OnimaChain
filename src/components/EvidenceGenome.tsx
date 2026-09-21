import { useState } from 'react'
import { evidenceGenome, type GenomeCell } from '~/data/evidence'
import { STUDY_BY_PMID } from '~/data/studies'
import { StudyCard } from './StudyCard'
import { CORPUS_ABSENCE } from './EmptyState'

/**
 * Evidence Genome — 15 descriptive dimensions. Filled arcs = count of verified records; hollow = zero;
 * dashed = not assessed. Click a dimension to reveal the backing records. Table equivalent underneath.
 */
export function EvidenceGenome({ slug }: { slug: string }) {
  const cells = evidenceGenome(slug)
  const [sel, setSel] = useState<GenomeCell | null>(null)
  const n = cells.length
  const cx = 170, cy = 170, r0 = 46, r1 = 150
  const max = Math.max(1, ...cells.map((c) => c.count ?? 0))
  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
      <div>
        <svg viewBox="0 0 340 340" className="w-full max-w-[340px]" role="img" aria-label="Evidence genome radial; see table for values">
          {cells.map((c, i) => {
            const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.03
            const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.03
            const k = c.count === null ? 0 : Math.min(1, c.count / max)
            const rr = r0 + (r1 - r0) * (0.12 + 0.88 * k)
            const f = (v: number) => (Math.round(v * 100) / 100).toFixed(2)
            const arc = (r: number, s: number, e: number) => `${f(cx + r * Math.cos(s))} ${f(cy + r * Math.sin(s))} A ${r} ${r} 0 0 1 ${f(cx + r * Math.cos(e))} ${f(cy + r * Math.sin(e))}`
            const d = `M ${arc(r0, a0, a1)} L ${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))} A ${f(rr)} ${f(rr)} 0 0 0 ${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))} Z`
            const outline = `M ${arc(r0, a0, a1)} L ${f(cx + r1 * Math.cos(a1))} ${f(cy + r1 * Math.sin(a1))} A ${r1} ${r1} 0 0 0 ${f(cx + r1 * Math.cos(a0))} ${f(cy + r1 * Math.sin(a0))} Z`
            const filled = (c.count ?? 0) > 0
            const active = sel?.id === c.id
            const mid = (a0 + a1) / 2
            return (
              <g key={c.id} onClick={() => setSel(active ? null : c)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={`${c.label}: ${c.count === null ? 'not assessed' : c.value ?? c.count}`}>
                <path d={outline} fill={active ? '#5FE3FF' : '#F2EEE6'} fillOpacity={active ? 0.06 : 0.02} stroke="#F2EEE6" strokeOpacity={0.12} strokeDasharray={c.count === null ? '3 3' : undefined} />
                {filled && <path d={d} fill="#5FE3FF" fillOpacity={active ? 0.75 : 0.5} stroke="#5FE3FF" strokeOpacity={0.9} />}
                <text x={f(cx + (r1 + 14) * Math.cos(mid))} y={f(cy + (r1 + 14) * Math.sin(mid))} fontSize={8} fill="#F2EEE6" fillOpacity={0.55} textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono Variable, monospace">{i + 1}</text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={r0 - 6} fill="#0A0B0E" stroke="#F2EEE6" strokeOpacity={0.15} />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fill="#F2EEE6" fontFamily="Manrope Variable, sans-serif" fontWeight={800}>{cells.reduce((s, c) => s + (c.id === 'research-age' || c.id === 'independent-groups' ? 0 : c.count ?? 0), 0)}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} fill="#F2EEE6" fillOpacity={0.5} fontFamily="JetBrains Mono Variable, monospace">record-dims</text>
        </svg>
        <p className="text-[11px] faint mt-2">Filled = we have checked studies of that kind · hollow = none yet · dashed = not checked yet. This is a picture of what exists, not a score.</p>
      </div>
      <div>
        <table className="data" aria-label="Evidence genome values">
          <thead><tr><th>#</th><th>Dimension</th><th>Verified</th><th>How</th></tr></thead>
          <tbody>
            {cells.map((c, i) => (
              <tr key={c.id} onClick={() => setSel(sel?.id === c.id ? null : c)} style={{ cursor: 'pointer' }} className={sel?.id === c.id ? 'bg-cyan/5' : ''}>
                <td className="mono text-bone/45">{i + 1}</td>
                <td className="text-bone/90">{c.label}</td>
                <td className="mono">{c.count === null ? <span className="chip chip-hollow">Not checked yet</span> : c.value ?? (c.count === 0 ? <span className="text-bone/40">0 · none yet</span> : c.count)}</td>
                <td className="text-[12px] muted">{c.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sel && (
          <div className="mt-4 fade-up">
            <p className="label label-cyan mb-2">{sel.label} — backing records</p>
            {sel.pmids.length ? (
              <div className="grid gap-2">{sel.pmids.map((p) => STUDY_BY_PMID[p] && <StudyCard key={p} study={STUDY_BY_PMID[p]} compact />)}</div>
            ) : (
              <p className="text-sm muted">{sel.count === null ? sel.how : CORPUS_ABSENCE}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
