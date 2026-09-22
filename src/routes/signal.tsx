import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState, type CSSProperties } from 'react'
import { CompoundCard } from '~/components/CompoundCard'
import { PortalTitle } from '~/components/PortalTitle'
import { BRAND } from '~/brand'
import { COMPOUNDS, displayName, type Compound } from '~/data/compounds'
import { descriptionFor, PRICE_PLACEHOLDER, shopTopicFor, themeFor, wordmarkStyle } from '~/data/commerce'
import { DOMAINS, type DomainId } from '~/data/domains'
import { studiesForCompound } from '~/data/studies'
import { useCommerceStore } from '~/stores/commerce'
import { LiquidGlassLink } from '~/components/LiquidGlassLink'
import { useFitText } from '~/motion/useFitText'
import { relationshipsFor } from '~/data/portal-relationships'

type View = 'constellation' | 'network' | 'timeline' | 'heatmap'

const VIEW_LABELS: Record<View, string> = {
  constellation: 'Constellation',
  network: 'Connections',
  timeline: 'Timeline',
  heatmap: 'Topic map',
}

const TOPIC_LABELS = Object.fromEntries(DOMAINS.map((d) => [d.id, d.name])) as Record<DomainId, string>

const STARTING_SLUGS = ['bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'cjc-1295', 'semaglutide', 'tirzepatide', 'retatrutide']

export const Route = createFileRoute('/signal')({
  head: () => ({ meta: [{ title: `Portal of Tides — ${BRAND}` }, { name: 'description', content: 'Choose a peptide, explore nearby compounds, and open the sources behind each record.' }] }),
  component: SignalMap,
})

function SignalMap() {
  const [view, setView] = useState<View>('constellation')
  const [selectedSlug, setSelectedSlug] = useState('bpc-157')
  const [domain, setDomain] = useState<'all' | DomainId>('all')
  const add = useCommerceStore((s) => s.add)
  const setQuickView = useCommerceStore((s) => s.setQuickView)
  const visible = useMemo(() => COMPOUNDS.filter((c) => domain === 'all' || c.domain === domain), [domain])
  const selected = COMPOUNDS.find((c) => c.slug === selectedSlug) ?? COMPOUNDS[0]
  const theme = themeFor(selected)
  const nameRef = useFitText<HTMLHeadingElement>([selected.slug], 14)
  const nearby = COMPOUNDS.filter((c) => c.slug !== selected.slug && c.domain === selected.domain).slice(0, 3)

  const chooseDomain = (next: 'all' | DomainId) => {
    setDomain(next)
    const first = next === 'all' ? COMPOUNDS.find((c) => STARTING_SLUGS.includes(c.slug)) : COMPOUNDS.find((c) => c.domain === next)
    if (first) setSelectedSlug(first.slug)
  }

  return (
    <div className="signal-world pt-28" style={{ '--signal-a': theme.primary, '--signal-b': theme.secondary, '--signal-c': theme.tertiary } as CSSProperties}>
      <div className="signal-depth" aria-hidden><i /><i /><i /></div>
      <header className="wrap relative z-[2]">
        <p className="label signal-kicker">Explore the current</p>
        <PortalTitle className="mt-4" />
        <h2 className="portal-finder-tagline mt-7">Find your way through the names.</h2>
        <p className="lede mt-6 max-w-2xl">New to peptides? Start with a topic that interests you. Choose a name to learn what it is, what studies say, and what is still unknown.</p>
        <p className="mt-4 text-sm text-bone/58 max-w-2xl">This is a map of our collection—not a popularity ranking, a promise, or medical advice.</p>
      </header>

      <section className="wrap relative z-[2] mt-10 grid xl:grid-cols-[310px_minmax(0,1fr)] gap-5" aria-label="Portal of Tides controls and map">
        <aside className="signal-controls liquid-panel p-5">
          <p className="label">Start with a name</p>
          <label className="grid gap-2 mt-5">
            <span className="text-sm font-semibold">Choose a peptide</span>
            <select value={selected.slug} onChange={(e) => setSelectedSlug(e.target.value)}>
              {visible.map((c) => <option value={c.slug} key={c.slug}>{displayName(c)}</option>)}
            </select>
          </label>
          <label className="grid gap-2 mt-4">
            <span className="text-sm font-semibold">Choose a topic</span>
            <select value={domain} onChange={(e) => chooseDomain(e.target.value as 'all' | DomainId)}>
              <option value="all">All topics</option>
              {DOMAINS.map((d) => <option value={d.id} key={d.id}>{TOPIC_LABELS[d.id]}</option>)}
            </select>
          </label>

          <div className="signal-selected mt-6" style={{ '--product': theme.primary, '--product-2': theme.secondary } as CSSProperties}>
            <p className="label" style={{ color: theme.primary }}>{TOPIC_LABELS[selected.domain]}</p>
            <h2 ref={nameRef} className="wordmark text-3xl mt-2 w-full whitespace-nowrap" style={wordmarkStyle(theme)}>{displayName(selected)}</h2>
            <p className="mt-3 text-sm font-semibold text-bone/82 leading-relaxed">{descriptionFor(selected)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="signal-tag">Explore the benefits, limits, and studies</span>
            </div>
            <div className="mt-6 flex items-center justify-between"><strong className="mono text-lg">{PRICE_PLACEHOLDER}</strong><span className="text-[11px] text-bone/46">Price pending</span></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn btn-sm justify-center" onClick={() => setQuickView(selected.slug)}>Quick view</button>
              <button className="btn btn-sm commerce-btn justify-center" onClick={() => add(selected.slug)}>Add to cart</button>
            </div>
            <Link to="/compound/$slug" params={{ slug: selected.slug }} className="signal-detail-link mt-3">Open the full product page →</Link>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="signal-view-tabs" role="group" aria-label="Choose how to explore">
            {(Object.keys(VIEW_LABELS) as View[]).map((v) => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{VIEW_LABELS[v]}</button>)}
          </div>
          <div className="signal-stage liquid-panel" data-view={view} aria-live="polite">
            <div className="signal-stage-light" aria-hidden />
            <ExplorerView view={view} selected={selected} pool={visible} onSelect={setSelectedSlug} />
          </div>
          <p className="mt-3 text-[12px] text-bone/65">Explore names by topic. Connections show how we organize the collection, not which products to use together.</p>
        </div>
      </section>

      <section className="wrap relative z-[2] py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div><p className="label signal-kicker">Nearby in the collection</p><h2 className="display text-[clamp(2.2rem,5vw,4.8rem)] mt-3">More in {shopTopicFor(selected)}.</h2></div>
          <LiquidGlassLink to="/explore">Shop all {COMPOUNDS.length}</LiquidGlassLink>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {nearby.length ? nearby.map((c, i) => <CompoundCard key={c.slug} compound={c} index={i} fluid />) : <p className="muted">No nearby products are in this topic yet.</p>}
        </div>
      </section>
    </div>
  )
}

function ExplorerView({ view, selected, pool, onSelect }: { view: View; selected: Compound; pool: Compound[]; onSelect: (slug: string) => void }) {
  if (view === 'network') return <NetworkView selected={selected} pool={pool} onSelect={onSelect} />
  if (view === 'timeline') return <TimelineView selected={selected} onSelect={onSelect} />
  if (view === 'heatmap') return <HeatmapView selected={selected} pool={pool} onSelect={onSelect} />
  return <ConstellationView selected={selected} pool={pool} onSelect={onSelect} />
}

function ConstellationView({ selected, pool, onSelect }: { selected: Compound; pool: Compound[]; onSelect: (slug: string) => void }) {
  const positions = [[15, 20], [74, 16], [84, 54], [66, 78], [22, 76], [8, 49], [43, 10]]
  const nodes = relationshipsFor(selected.slug, pool).slice(0, positions.length)
  return (
    <div className="signal-constellation" aria-label={`Documented relationships centered on ${displayName(selected)}`}>
      <div className="constellation-key"><strong>Documented links</strong><span>Center: your pick</span><span>Planets: named relationship</span></div>
      <div className="signal-orbit orbit-one" aria-hidden /><div className="signal-orbit orbit-two" aria-hidden />
      <svg className="signal-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {nodes.map(({ compound }, i) => <path key={compound.slug} d={`M50 48 Q${positions[i][0]} 48 ${positions[i][0]} ${positions[i][1]}`} style={{ '--line': themeFor(compound).primary, '--strength': 1 } as CSSProperties} />)}
      </svg>
      <button className="signal-node signal-node-core" onClick={() => onSelect(selected.slug)} style={{ '--node': themeFor(selected).primary } as CSSProperties}><span>{displayName(selected)}</span><small>Your selected product</small></button>
      {nodes.map(({ compound, relationship }, i) => <button key={compound.slug} className="signal-node" onClick={() => onSelect(compound.slug)} title={`${displayName(compound)}: ${relationship.detail}`} style={{ left: `${positions[i][0]}%`, top: `${positions[i][1]}%`, '--node': themeFor(compound).primary, '--texture-seed': `${(i * 17) - 31}deg` } as CSSProperties}><span>{displayName(compound)}</span><small>{relationship.label}</small></button>)}
      <p className="signal-view-note">{nodes.length ? 'Lines show composition or a documented receptor overlap, not a recommendation to combine products.' : 'No direct relationship is documented here yet. Browse the topic map to see other names without implying a link.'}</p>
    </div>
  )
}

function NetworkView({ selected, pool, onSelect }: { selected: Compound; pool: Compound[]; onSelect: (slug: string) => void }) {
  const related = relationshipsFor(selected.slug, pool)
  return (
    <div className="signal-network p-6 md:p-10">
      <div className="signal-network-head"><p className="label">Connections for</p><h3 className="display text-4xl mt-2">{displayName(selected)}</h3><p className="mt-3 text-sm text-bone/62">Only named composition or receptor relationships appear here. A shared shopping topic alone does not create a link.</p></div>
      <div className="signal-network-grid mt-8">
        <div><p className="label">Explore this topic</p><div className="mt-3 flex flex-wrap gap-2"><span className="network-topic">{TOPIC_LABELS[selected.domain]}</span></div><p className="text-sm text-bone/70 mt-5">Choose a nearby name to see its story. Sharing a topic does not mean sharing the same benefits or risks.</p></div>
        <div><p className="label">Documented links</p><div className="mt-3 grid gap-2">{related.length ? related.map(({ compound, relationship }) => <div key={compound.slug} className="network-relationship"><button className="network-compound w-full" onClick={() => onSelect(compound.slug)}><span>{displayName(compound)}</span><span>{relationship.label} →</span></button><p>{relationship.detail}</p><a href={relationship.source.startsWith('https:') ? relationship.source : '/compound/wolverine-blend'} target={relationship.source.startsWith('https:') ? '_blank' : undefined} rel={relationship.source.startsWith('https:') ? 'noreferrer' : undefined}>Relationship source ↗</a></div>) : <p className="signal-empty">No direct relationship is documented for this name yet.</p>}</div></div>
      </div>
    </div>
  )
}

function TimelineView({ selected, onSelect }: { selected: Compound; onSelect: (slug: string) => void }) {
  const studies = [...studiesForCompound(selected.slug)].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
  const components = relationshipsFor(selected.slug).filter(({ relationship }) => relationship.kind === 'component')
  return (
    <div className="signal-timeline p-6 md:p-10">
      <p className="label">Studies through the years</p><h3 className="display text-4xl mt-2">{displayName(selected)}</h3>
      <p className="mt-3 text-sm text-bone/62 max-w-2xl">Only verified sources assigned to this exact record appear below. This is not a timeline of customer results or of related products.</p>
      {selected.slug === 'wolverine-blend' && <div className="mt-5 text-sm text-bone/70">This blend has no single-peptide study timeline. See the separate records for {components.map(({ compound }, index) => <span key={compound.slug}>{index > 0 ? ' and ' : ''}<button className="underline" onClick={() => onSelect(compound.slug)}>{displayName(compound)}</button></span>)}.</div>}
      {studies.length ? <ol className="timeline-simple mt-8">{studies.map((s) => <li key={s.pmid}><time>{s.year ?? 'Date not listed'}</time><div><p>{s.title ?? 'Study title being checked'}</p><a href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`} target="_blank" rel="noreferrer">Read the study ↗</a></div></li>)}</ol> : <div className="signal-empty mt-8"><strong>No studies added here yet.</strong><p>We will add studies after checking them. An empty timeline does not tell you whether a peptide works or is safe.</p></div>}
    </div>
  )
}

function HeatmapView({ selected, pool, onSelect }: { selected: Compound; pool: Compound[]; onSelect: (slug: string) => void }) {
  const links = new Map(relationshipsFor(selected.slug, pool).map(({ compound, relationship }) => [compound.slug, relationship.label]))
  return (
    <div className="signal-heatmap p-5 md:p-8">
      <p className="label">Topic map</p><h3 className="display text-4xl mt-2">A world for every curiosity.</h3><p className="mt-3 text-sm text-bone/70">Groups are browsing topics, not molecular connections. Only names marked with a relationship have a documented link to {displayName(selected)}.</p>
      <div className="topic-islands mt-8">
        {DOMAINS.map((d, i) => {
          const items = pool.filter((c) => c.domain === d.id)
          if (!items.length) return null
          return <section key={d.id} className="topic-island" data-active={selected.domain === d.id} style={{ '--island': d.palette.base, '--island-accent': d.palette.accent, '--delay': `${i * -1.3}s` } as CSSProperties}>
            <div className="island-light" aria-hidden="true" />
            <span className="island-count">{String(items.length).padStart(2, '0')} names to explore</span>
            <h4>{d.name}</h4>
            <div className="island-names">{items.map((c) => <button key={c.slug} onClick={() => onSelect(c.slug)} aria-pressed={selected.slug === c.slug}>{displayName(c)}<span>{links.get(c.slug) ?? '↗'}</span></button>)}</div>
          </section>
        })}
      </div>
    </div>
  )
}
