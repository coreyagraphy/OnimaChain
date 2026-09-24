import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { COMPOUNDS, COMPOUND_BY_SLUG, computedMW, displayName } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { studiesForCompound } from '~/data/studies'
import { officialSourcesFor } from '~/data/official-sources'
import { longestSharedSubsequence, CLASS_COLORS, buildResidues } from '~/scenes/chain/geometry'
import { provenanceText } from '~/components/SourceBadge'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/compare')({
  validateSearch: (s: Record<string, unknown>) => ({ a: typeof s.a === 'string' ? s.a : undefined, b: typeof s.b === 'string' ? s.b : undefined }),
  head: () => ({ meta: [{ title: `Compare molecule identities — ${BRAND}` }, { name: 'description', content: 'Side-by-side identity and source inventory; no suitability or effectiveness ranking.' }] }),
  component: Compare,
})

function Compare() {
  const search = Route.useSearch()
  const [slugs, setSlugs] = useState<string[]>([search.a && COMPOUND_BY_SLUG[search.a] ? search.a : 'bpc-157', search.b && COMPOUND_BY_SLUG[search.b] ? search.b : 'thymosin-beta-4'])
  const records = slugs.map(slug => COMPOUND_BY_SLUG[slug])
  const rows = useMemo(() => [
    { label: 'Identity', values: records.map(c => `${displayName(c)} · ${c.sequence ? `${c.sequence.length} residues` : 'sequence unresolved'} · ${c.mw ?? computedMW(c) ?? 'MW not listed'} Da`) },
    { label: 'Scientific subject', values: records.map(c => DOMAIN_BY_ID[c.domain].name) },
    { label: 'Structure representation', values: records.map(c => provenanceText(c).primary) },
    { label: 'Citation metadata', values: records.map(c => `${studiesForCompound(c.slug).length} indexed PubMed record(s); scientific claim review separate`) },
    { label: 'Official records attached', values: records.map(c => officialSourcesFor(c.slug).length ? officialSourcesFor(c.slug).map(s => s.title).join(' · ') : 'Regulatory record not yet reviewed here') },
    { label: 'Outcome summary', values: records.map(() => 'Withheld pending exact source and formulation review') },
  ], [records])
  const shared = records.length >= 2 && records[0].sequence && records[1].sequence ? longestSharedSubsequence(records[0].sequence, records[1].sequence) : null
  return <div className="pt-28 wrap">
    <p className="label label-cyan">Compare identities</p><h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Side by side. No ranking.</h1>
    <p className="lede mt-5 max-w-2xl">Compare sequence and source inventory for up to four records. This tool does not rank benefits, safety, or personal suitability.</p>
    <div className="mt-8 flex flex-wrap gap-2 items-end">{slugs.map((slug, i) => <label key={i} className="grid gap-1"><span className="label">Record {i + 1}</span><select value={slug} onChange={event => setSlugs(slugs.map((value, j) => j === i ? event.target.value : value))}>{COMPOUNDS.map(c => <option key={c.slug} value={c.slug}>{displayName(c)}</option>)}</select></label>)}{slugs.length < 4 && <button className="btn btn-sm" onClick={() => setSlugs([...slugs, COMPOUNDS.find(c => !slugs.includes(c.slug))!.slug])}>Add record</button>}{slugs.length > 2 && <button className="btn btn-sm" onClick={() => setSlugs(slugs.slice(0, -1))}>Remove last</button>}</div>
    <div className="mt-8 panel-flat overflow-x-auto"><table className="data min-w-[720px]"><thead><tr><th>Field</th>{records.map(c => <th key={c.slug}><Link to="/compound/$slug" params={{ slug: c.slug }} className="hover:text-cyan">{displayName(c)}</Link></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.label}><th scope="row" className="text-left label">{row.label}</th>{row.values.map((value, index) => <td key={index} className="text-[13px] text-bone/85">{value}</td>)}</tr>)}</tbody></table></div>
    {records.length >= 2 && <section className="mt-12"><p className="label label-cyan">Sequence comparison · {displayName(records[0])} / {displayName(records[1])}</p><p className="mt-2 text-sm muted">{shared ? (shared.text.length >= 2 ? `Longest shared substring: ${shared.text} (${shared.text.length} residues at positions ${shared.ai + 1} / ${shared.bi + 1}). A shared sequence is not evidence of a shared effect.` : 'No shared substring of two or more residues.') : 'Two listed sequences are needed.'}</p><div className="mt-4 grid md:grid-cols-2 gap-4">{records.slice(0, 2).map((c, ci) => { const residues = buildResidues(c); const start = ci === 0 ? shared?.ai ?? -1 : shared?.bi ?? -1; const length = shared?.text.length ?? 0; return <div key={c.slug} className="panel-flat p-4 overflow-x-auto"><p className="label mb-3">{displayName(c)}</p>{residues.length ? <div className="flex flex-wrap gap-1">{residues.map(residue => { const hit = length >= 2 && residue.index >= start && residue.index < start + length; return <span key={residue.index} className={`mono text-[12px] w-7 h-7 grid place-items-center rounded ${hit ? 'ring-1 ring-cyan' : ''}`} style={{ background: `${CLASS_COLORS[residue.cls]}22`, color: CLASS_COLORS[residue.cls] }} title={`${residue.name} ${residue.pos}`}>{residue.code}</span> })}</div> : <p className="text-sm muted">Sequence unresolved</p>}</div> })}</div></section>}
  </div>
}
