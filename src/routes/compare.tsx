import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { COMPOUNDS, COMPOUND_BY_SLUG, computedMW, displayName } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { claimsForCompound, TRANSLATION_STAGES } from '~/data/claims'
import { distributionFor, evidenceGenome, latestChangeFor, themesFor, translationFor } from '~/data/evidence'
import { distinctGroups, studiesForCompound } from '~/data/studies'
import { longestSharedSubsequence, CLASS_COLORS, buildResidues } from '~/scenes/chain/geometry'
import { CORPUS } from '~/data/signal'
import { provenanceText } from '~/components/SourceBadge'

export const Route = createFileRoute('/compare')({
  validateSearch: (s: Record<string, unknown>) => ({ a: typeof s.a === 'string' ? s.a : undefined, b: typeof s.b === 'string' ? s.b : undefined }),
  head: () => ({ meta: [{ title: 'Compare — Cyravon' }] }),
  component: Compare,
})

function Compare() {
  const search = Route.useSearch()
  const [slugs, setSlugs] = useState<string[]>([search.a && COMPOUND_BY_SLUG[search.a] ? search.a : 'bpc-157', search.b && COMPOUND_BY_SLUG[search.b] ? search.b : 'tb-500'])
  const cs = slugs.map((s) => COMPOUND_BY_SLUG[s])
  const rows = useMemo(() => [
    { k: 'Identity', v: cs.map((c) => `${c.name}${c.displayName ? ` (displayed as ${c.displayName})` : ''} · ${c.sequence ? `${c.sequence.length} aa` : 'sequence pending'} · MW ${(c.mw ?? computedMW(c)) ?? '—'}`) },
    { k: 'Mechanism tags', v: cs.map((c) => c.tags.join(' · ')) },
    { k: 'Research domain', v: cs.map((c) => DOMAIN_BY_ID[c.domain].name) },
    { k: 'Evidence genome', v: cs.map((c) => { const g = evidenceGenome(c.slug).filter((x) => (x.count ?? 0) > 0 && x.id !== 'research-age'); return g.length ? g.map((x) => `${x.label} ${x.value ?? x.count}`).join(' · ') : 'No qualifying record is currently indexed in Cyravon’s corpus' }) },
    { k: 'Translation', v: cs.map((c) => { const t = translationFor(c.slug); return t.length ? t.map((r) => `${r.outcome}: ${r.stages.length ? TRANSLATION_STAGES.filter((s) => r.stages.includes(s.id)).map((s) => s.label).join(' → ') : 'no stage'}`).join(' · ') : 'No outcome mapped' }) },
    { k: 'Human research', v: cs.map((c) => (distributionFor(c.slug).human ? `${distributionFor(c.slug).human} verified record(s)` : 'No human study indexed')) },
    { k: 'Human signal', v: cs.map(() => CORPUS.header) },
    { k: 'Signal integrity', v: cs.map(() => 'Not assessed — no corpus') },
    { k: 'Research independence', v: cs.map((c) => { const s = studiesForCompound(c.slug); return s.length ? `${distinctGroups(s).length} last-author group(s) across ${s.length} record(s)` : 'Not assessed' }) },
    { k: 'Research themes', v: cs.map((c) => themesFor(c.slug).filter((t) => t.kind === 'research').map((t) => t.label).join(' · ') || 'No themes indexed') },
    { k: 'Claims tracked', v: cs.map((c) => claimsForCompound(c.slug).map((x) => x.id).join(' · ') || 'none') },
    { k: 'Regulatory state', v: cs.map(() => 'No regulatory record indexed (jurisdiction / date required)') },
    { k: 'Structure provenance', v: cs.map((c) => provenanceText(c).primary) },
    { k: 'Latest evidence change', v: cs.map((c) => { const ch = latestChangeFor(c.slug); return ch ? `${ch.date} — ${ch.change}` : 'No change recorded' }) },
  ], [cs])

  const shared = cs.length >= 2 && cs[0].sequence && cs[1].sequence ? longestSharedSubsequence(cs[0].sequence, cs[1].sequence) : null

  return (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Compare</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Descriptive, side by side.</h1>
      <p className="lede mt-5 max-w-2xl">Up to four compounds. No winner is declared and nothing is &ldquo;best for&rdquo; anything.</p>
      <div className="mt-8 flex flex-wrap gap-2 items-end">
        {slugs.map((s, i) => (
          <label key={i} className="grid gap-1"><span className="label">Compound {i + 1}</span>
            <select value={s} onChange={(e) => setSlugs(slugs.map((x, j) => (j === i ? e.target.value : x)))}>{COMPOUNDS.map((c) => <option key={c.slug} value={c.slug}>{displayName(c)}</option>)}</select>
          </label>
        ))}
        {slugs.length < 4 && <button className="btn btn-sm" onClick={() => setSlugs([...slugs, COMPOUNDS.find((c) => !slugs.includes(c.slug))!.slug])}>+ Add</button>}
        {slugs.length > 2 && <button className="btn btn-sm" onClick={() => setSlugs(slugs.slice(0, -1))}>− Remove</button>}
      </div>
      <div className="mt-8 panel-flat overflow-x-auto">
        <table className="data min-w-[720px]">
          <thead><tr><th className="w-[180px]">Row</th>{cs.map((c) => <th key={c.slug}>{displayName(c)}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.k}><td className="label !normal-case !tracking-normal !text-[12px] text-bone/70">{r.k}</td>{r.v.map((v, i) => <td key={i} className="text-[13px] text-bone/85">{v}</td>)}</tr>)}</tbody>
        </table>
      </div>

      {cs.length >= 2 && (
        <section className="mt-12">
          <p className="label label-cyan">Residue diff — {displayName(cs[0])} vs {displayName(cs[1])}</p>
          <p className="mt-2 text-sm muted">{shared ? (shared.text.length >= 2 ? `Longest shared subsequence: ${shared.text} (${shared.text.length} residues, positions ${shared.ai + 1} / ${shared.bi + 1})` : 'No shared subsequence') : 'Residue diff requires two listed sequences.'}</p>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {cs.slice(0, 2).map((c, ci) => {
              const res = buildResidues(c)
              const start = ci === 0 ? shared?.ai ?? -1 : shared?.bi ?? -1
              const len = shared?.text.length ?? 0
              return (
                <div key={c.slug} className="panel-flat p-4 overflow-x-auto">
                  <p className="label mb-3">{displayName(c)}</p>
                  {res.length ? <div className="flex flex-wrap gap-1">{res.map((r) => { const hit = len >= 2 && r.index >= start && r.index < start + len; return <span key={r.index} className={`mono text-[12px] w-7 h-7 grid place-items-center rounded ${hit ? 'ring-1 ring-cyan' : ''}`} style={{ background: `${CLASS_COLORS[r.cls]}22`, color: CLASS_COLORS[r.cls] }} title={`${r.name} ${r.pos}`}>{r.code}</span> })}</div> : <p className="text-sm muted">Sequence pending verification</p>}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
