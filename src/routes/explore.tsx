import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { COMPOUNDS, displayName } from '~/data/compounds'
import { DOMAINS, DOMAIN_BY_ID, type DomainId } from '~/data/domains'
import { distributionFor, latestChangeFor } from '~/data/evidence'
import { studiesForCompound } from '~/data/studies'
import { CompoundCard } from '~/components/CompoundCard'
import { provenanceText } from '~/components/SourceBadge'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/explore')({
  head: () => ({ meta: [{ title: `Explore the Molecular Atlas — ${BRAND}` }] }),
  component: Explore,
})

type Sort = 'alpha' | 'researched' | 'changed'
type Evidence = 'any' | 'in-vitro' | 'animal' | 'human' | 'review'
type Prov = 'any' | 'pdb' | 'sequence' | 'conceptual'

function Explore() {
  const [q, setQ] = useState('')
  const [domain, setDomain] = useState<DomainId | 'all'>('all')
  const [evidence, setEvidence] = useState<Evidence>('any')
  const [prov, setProv] = useState<Prov>('any')
  const [sort, setSort] = useState<Sort>('alpha')
  const [view, setView] = useState<'grid' | 'table'>('grid')

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    let list = COMPOUNDS.filter((c) => {
      if (domain !== 'all' && c.domain !== domain) return false
      if (prov !== 'any' && provenanceText(c).kind !== prov) return false
      if (evidence !== 'any') {
        const d = distributionFor(c.slug)
        const n = evidence === 'in-vitro' ? d.inVitro : evidence === 'animal' ? d.animal : evidence === 'human' ? d.human : d.review
        if (!n) return false
      }
      if (t && !(displayName(c).toLowerCase().includes(t) || c.slug.includes(t) || c.aliases.some((a) => a.toLowerCase().includes(t)) || c.tags.some((x) => x.includes(t)))) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'alpha') return displayName(a).localeCompare(displayName(b))
      if (sort === 'researched') return studiesForCompound(b.slug).length - studiesForCompound(a.slug).length || displayName(a).localeCompare(displayName(b))
      const ca = latestChangeFor(a.slug)?.date ?? '', cb = latestChangeFor(b.slug)?.date ?? ''
      return cb.localeCompare(ca) || displayName(a).localeCompare(displayName(b))
    })
    return list
  }, [q, domain, evidence, prov, sort])

  return (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Explore</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Explore the Molecular Atlas</h1>
      <p className="lede mt-5 max-w-2xl">{COMPOUNDS.length} compounds across seven research domains. Sorted by what is indexed — never by &ldquo;best&rdquo;.</p>

      <div className="mt-10 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto] items-end panel p-4">
        <label className="grid gap-1"><span className="label">Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, alias, tag…" /></label>
        <label className="grid gap-1"><span className="label">Domain</span><select value={domain} onChange={(e) => setDomain(e.target.value as DomainId | 'all')}><option value="all">All domains</option>{DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <label className="grid gap-1"><span className="label">Evidence type present</span><select value={evidence} onChange={(e) => setEvidence(e.target.value as Evidence)}><option value="any">Any</option><option value="in-vitro">In vitro</option><option value="animal">Animal</option><option value="human">Human</option><option value="review">Review</option></select></label>
        <label className="grid gap-1"><span className="label">Structure provenance</span><select value={prov} onChange={(e) => setProv(e.target.value as Prov)}><option value="any">Any</option><option value="pdb">Resolved structures exist</option><option value="sequence">Sequence-derived only</option><option value="conceptual">Conceptual (sequence pending)</option></select></label>
        <label className="grid gap-1"><span className="label">Sort</span><select value={sort} onChange={(e) => setSort(e.target.value as Sort)}><option value="alpha">Alphabetical</option><option value="researched">Most researched (verified count)</option><option value="changed">Recently changed</option></select></label>
        <div className="flex gap-1" role="group" aria-label="View"><button className="btn btn-sm" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</button><button className="btn btn-sm" aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button></div>
      </div>
      <p className="mt-4 mono text-[11px] text-bone/50">{rows.length} of {COMPOUNDS.length} compounds</p>

      {view === 'grid' ? (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map((c, i) => <CompoundCard key={c.slug} compound={c} index={i} fluid />)}
        </div>
      ) : (
        <div className="mt-6 panel-flat overflow-x-auto">
          <table className="data">
            <thead><tr><th>Compound</th><th>Domain</th><th>Residues</th><th>Verified records</th><th>In vitro / animal / human / review</th><th>Structure provenance</th><th>Latest change</th></tr></thead>
            <tbody>
              {rows.map((c) => { const d = distributionFor(c.slug); const ch = latestChangeFor(c.slug); return (
                <tr key={c.slug}>
                  <td><Link to="/compound/$slug" params={{ slug: c.slug }} className="font-semibold hover:text-cyan">{displayName(c)}</Link><span className="block text-[11px] muted">{c.aliases.slice(0, 2).join(' · ')}</span></td>
                  <td>{DOMAIN_BY_ID[c.domain].name}</td>
                  <td className="mono">{c.sequence ? c.sequence.length : 'pending'}</td>
                  <td className="mono">{d.total || <span className="text-bone/40">0</span>}</td>
                  <td className="mono">{d.total ? `${d.inVitro} / ${d.animal} / ${d.human} / ${d.review}` : <span className="text-bone/40">no qualifying record</span>}</td>
                  <td className="text-[12px]">{provenanceText(c).primary}</td>
                  <td className="mono text-[11px]">{ch ? <span className="text-amber">{ch.date}</span> : '—'}</td>
                </tr>
              ) })}
            </tbody>
          </table>
        </div>
      )}
      {rows.length === 0 && <p className="mt-10 text-sm muted">No compound matches these filters. Absence from the atlas is not evidence of absence.</p>}
    </div>
  )
}
