import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState, type CSSProperties } from 'react'
import { CompoundCard } from '~/components/CompoundCard'
import { PortalTitle } from '~/components/PortalTitle'
import { BRAND } from '~/brand'
import { descriptionFor, shopTopicFor, themeFor, wordmarkStyle } from '~/data/commerce'
import { DOMAINS, type DomainId } from '~/data/domains'
import { studiesForCompound } from '~/data/studies'
import { useCommerceStore } from '~/stores/commerce'
import { LiquidGlassLink } from '~/components/LiquidGlassLink'
import { useFitText } from '~/motion/useFitText'
import { relationshipsFor } from '~/data/portal-relationships'
import { RESEARCH_ENTITIES, RESEARCH_ENTITY_BY_ID, TARGETS, availableListingFor, commerceLabelFor, coreCompoundFor, entityPath, entityTypeLabel, type ResearchEntity } from '~/data/research-entities'

type View = 'constellation' | 'network' | 'timeline' | 'heatmap'

const VIEW_LABELS: Record<View, string> = {
  constellation: 'Constellation',
  network: 'Connections',
  timeline: 'Timeline',
  heatmap: 'Topic map',
}

const TOPIC_LABELS = Object.fromEntries(DOMAINS.map((d) => [d.id, d.name])) as Record<DomainId, string>

const STARTING_SLUGS = ['bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'cjc-1295', 'semaglutide', 'tirzepatide', 'retatrutide']
const entityColor = (entity: ResearchEntity) => entity.type === 'COMPOUND' ? entity.accent : '#91dfff'
const entityTheme = (entity: ResearchEntity) => {
  const legacy = coreCompoundFor(entity)
  return legacy ? themeFor(legacy) : { primary: entityColor(entity), secondary: '#a88cff', tertiary: '#8ce8d0' }
}
const targetName = Object.fromEntries(TARGETS.map((target) => [target.id, target.label]))

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
  const visible = useMemo(() => RESEARCH_ENTITIES.filter((entity) => domain === 'all' || coreCompoundFor(entity)?.domain === domain), [domain])
  const selected = RESEARCH_ENTITY_BY_ID[selectedSlug] ?? RESEARCH_ENTITIES[0]
  const legacy = coreCompoundFor(selected)
  const theme = entityTheme(selected)
  const nameRef = useFitText<HTMLHeadingElement>([selected.id], 14)
  const nearby = legacy ? RESEARCH_ENTITIES.flatMap((entity) => { const compound = coreCompoundFor(entity); return compound && compound.slug !== legacy.slug && compound.domain === legacy.domain ? [compound] : [] }).slice(0, 3) : relationshipsFor(selected.id).flatMap(({ entity }) => { const compound = coreCompoundFor(entity); return compound ? [compound] : [] }).slice(0, 3)

  const chooseDomain = (next: 'all' | DomainId) => {
    setDomain(next)
    const first = RESEARCH_ENTITIES.find((entity) => { const compound = coreCompoundFor(entity); return compound && (next === 'all' ? STARTING_SLUGS.includes(compound.slug) : compound.domain === next) })
    if (first) setSelectedSlug(first.id)
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
            <span className="text-sm font-semibold">Choose a research record</span>
            <select value={selected.id} onChange={(e) => setSelectedSlug(e.target.value)}>
              {visible.map((entity) => <option value={entity.id} key={entity.id}>{entity.name} · {entityTypeLabel(entity)}</option>)}
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
            <p className="label" style={{ color: theme.primary }}>{legacy ? TOPIC_LABELS[legacy.domain] : entityTypeLabel(selected)}</p>
            <h2 ref={nameRef} className="wordmark text-3xl mt-2 w-full whitespace-nowrap" style={legacy ? wordmarkStyle(themeFor(legacy)) : { color: theme.primary }}>{selected.name}</h2>
            <p className="mt-3 text-sm font-semibold text-bone/82 leading-relaxed">{legacy ? descriptionFor(legacy) : selected.summary}</p>
            {selected.type === 'COMPOUND' && selected.targets.length > 0 && <p className="mt-3 text-xs text-bone/65">Mapped targets: {selected.targets.map((id) => targetName[id]).join(' · ')}</p>}
            {selected.type !== 'COMPOUND' && <p className="mt-3 text-xs text-bone/65">Separate components: {selected.componentIds.map((id) => RESEARCH_ENTITY_BY_ID[id]?.name ?? id).join(' + ')}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="signal-tag">Explore the benefits, limits, and studies</span>
            </div>
            <div className="mt-6 flex items-center justify-between"><strong className="label label-cyan">{commerceLabelFor(selected)}</strong></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {legacy && <button className="btn btn-sm justify-center" onClick={() => setQuickView(selected.id)}>Quick view</button>}
              {legacy && availableListingFor(selected.id) && <button className="btn btn-sm commerce-btn justify-center" onClick={() => add(selected.id)}>Add to cart</button>}
              <a href={entityPath(selected)} className="btn btn-sm justify-center">View research</a>
            </div>
            <a href={entityPath(selected)} className="signal-detail-link mt-3">Open the full research profile →</a>
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
          <div><p className="label signal-kicker">Nearby in the collection</p><h2 className="display text-[clamp(2.2rem,5vw,4.8rem)] mt-3">{legacy ? `More in ${shopTopicFor(legacy)}.` : 'Linked research records.'}</h2></div>
          <LiquidGlassLink to="/explore">Explore the collection</LiquidGlassLink>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {nearby.length ? nearby.map((c, i) => <CompoundCard key={c.slug} compound={c} index={i} fluid />) : <p className="muted">No directly linked core profiles are indexed for this record yet.</p>}
        </div>
      </section>
    </div>
  )
}

function ExplorerView({ view, selected, pool, onSelect }: { view: View; selected: ResearchEntity; pool: ResearchEntity[]; onSelect: (slug: string) => void }) {
  if (view === 'network') return <NetworkView selected={selected} pool={pool} onSelect={onSelect} />
  if (view === 'timeline') return <TimelineView selected={selected} onSelect={onSelect} />
  if (view === 'heatmap') return <HeatmapView selected={selected} pool={pool} onSelect={onSelect} />
  return <ConstellationView selected={selected} pool={pool} onSelect={onSelect} />
}

function ConstellationView({ selected, pool, onSelect }: { selected: ResearchEntity; pool: ResearchEntity[]; onSelect: (slug: string) => void }) {
  const positions = [[15, 20], [74, 16], [84, 54], [66, 78], [22, 76], [8, 49], [43, 10]]
  const nodes = relationshipsFor(selected.id, pool).slice(0, positions.length)
  return (
    <div className="signal-constellation" aria-label={`Mapped relationships centered on ${selected.name}`}>
      <div className="constellation-key"><strong>Mapped links</strong><span>Center: your pick</span><span>Planets: named relationship</span></div>
      <div className="signal-orbit orbit-one" aria-hidden /><div className="signal-orbit orbit-two" aria-hidden />
      <svg className="signal-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {nodes.map(({ entity }, i) => <path key={entity.id} d={`M50 48 Q${positions[i][0]} 48 ${positions[i][0]} ${positions[i][1]}`} style={{ '--line': entityColor(entity), '--strength': 1 } as CSSProperties} />)}
      </svg>
      <button className="signal-node signal-node-core" onClick={() => onSelect(selected.id)} style={{ '--node': entityColor(selected) } as CSSProperties}><span>{selected.name}</span><small>Your selected record</small></button>
      {nodes.map(({ entity, relationship }, i) => <button key={entity.id} className="signal-node" onClick={() => onSelect(entity.id)} title={`${entity.name}: ${relationship.detail}`} style={{ left: `${positions[i][0]}%`, top: `${positions[i][1]}%`, '--node': entityColor(entity), '--texture-seed': `${(i * 17) - 31}deg` } as CSSProperties}><span>{entity.name}</span><small>{relationship.label}</small></button>)}
      <p className="signal-view-note">{nodes.length ? 'Lines show canonical components or shared mapped targets, not a recommendation to combine products.' : 'No direct relationship is mapped here yet. Browse the topic map to see other names without implying a link.'}</p>
    </div>
  )
}

function NetworkView({ selected, pool, onSelect }: { selected: ResearchEntity; pool: ResearchEntity[]; onSelect: (slug: string) => void }) {
  const related = relationshipsFor(selected.id, pool)
  const legacy = coreCompoundFor(selected)
  return (
    <div className="signal-network p-6 md:p-10">
      <div className="signal-network-head"><p className="label">Connections for</p><h3 className="display text-4xl mt-2">{selected.name}</h3><p className="mt-3 text-sm text-bone/62">Only canonical components or mapped receptor overlaps appear here. A shared shopping topic alone does not create a link.</p></div>
      <div className="signal-network-grid mt-8">
        <div><p className="label">Explore this topic</p><div className="mt-3 flex flex-wrap gap-2"><span className="network-topic">{legacy ? TOPIC_LABELS[legacy.domain] : entityTypeLabel(selected)}</span></div><p className="text-sm text-bone/70 mt-5">Choose a linked record to see its story. Sharing a target does not mean sharing benefits or risks.</p></div>
        <div><p className="label">Mapped links</p><div className="mt-3 grid gap-2">{related.length ? related.map(({ entity, relationship }) => <div key={entity.id} className="network-relationship"><button className="network-compound w-full" onClick={() => onSelect(entity.id)}><span>{entity.name}</span><span>{relationship.label} →</span></button><p>{relationship.detail}</p><a href={relationship.source} target={relationship.source.startsWith('https:') ? '_blank' : undefined} rel={relationship.source.startsWith('https:') ? 'noreferrer' : undefined}>Relationship source ↗</a></div>) : <p className="signal-empty">No direct relationship is mapped for this record yet.</p>}</div></div>
      </div>
    </div>
  )
}

function TimelineView({ selected, onSelect }: { selected: ResearchEntity; onSelect: (slug: string) => void }) {
  const legacy = coreCompoundFor(selected)
  const studies = legacy ? [...studiesForCompound(legacy.slug)].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999)) : []
  const components = relationshipsFor(selected.id).filter(({ relationship }) => relationship.kind === 'component')
  return (
    <div className="signal-timeline p-6 md:p-10">
      <p className="label">Research record over time</p><h3 className="display text-4xl mt-2">{selected.name}</h3>
      <p className="mt-3 text-sm text-bone/62 max-w-2xl">Only verified sources assigned to this exact record appear below. This is not a timeline of customer results or of related products.</p>
      {selected.type !== 'COMPOUND' && <div className="mt-5 text-sm text-bone/70">This combination has no single-peptide study timeline. See the separate records for {components.map(({ entity }, index) => <span key={entity.id}>{index > 0 ? ' and ' : ''}<button className="underline" onClick={() => onSelect(entity.id)}>{entity.name}</button></span>)}.</div>}
      {selected.type === 'COMPOUND' && selected.statusAsOf && <div className="mt-5 text-sm text-bone/70">Research status as of {selected.statusAsOf}: {selected.stage ?? selected.researchStatus}. {selected.statusSource && <a href={selected.statusSource} target="_blank" rel="noreferrer" className="underline">Source ↗</a>}</div>}
      {studies.length ? <ol className="timeline-simple mt-8">{studies.map((s) => <li key={s.pmid}><time>{s.year ?? 'Date not listed'}</time><div><p>{s.title ?? 'Study title being checked'}</p><a href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`} target="_blank" rel="noreferrer">Read the study ↗</a></div></li>)}</ol> : <div className="signal-empty mt-8"><strong>No studies added here yet.</strong><p>We will add studies after checking them. An empty timeline does not tell you whether a peptide works or is safe.</p></div>}
    </div>
  )
}

function HeatmapView({ selected, pool, onSelect }: { selected: ResearchEntity; pool: ResearchEntity[]; onSelect: (slug: string) => void }) {
  const links = new Map(relationshipsFor(selected.id, pool).map(({ entity, relationship }) => [entity.id, relationship.label]))
  const legacy = coreCompoundFor(selected)
  return (
    <div className="signal-heatmap p-5 md:p-8">
      <p className="label">Topic map</p><h3 className="display text-4xl mt-2">A world for every curiosity.</h3><p className="mt-3 text-sm text-bone/70">Groups are browsing topics, not molecular connections. Only names marked with a relationship have a mapped link to {selected.name}.</p>
      <div className="topic-islands mt-8">
        {DOMAINS.map((d, i) => {
          const items = pool.filter((entity) => coreCompoundFor(entity)?.domain === d.id)
          if (!items.length) return null
          return <section key={d.id} className="topic-island" data-active={legacy?.domain === d.id} style={{ '--island': d.palette.base, '--island-accent': d.palette.accent, '--delay': `${i * -1.3}s` } as CSSProperties}>
            <div className="island-light" aria-hidden="true" />
            <span className="island-count">{String(items.length).padStart(2, '0')} names to explore</span>
            <h4>{d.name}</h4>
            <div className="island-names">{items.map((entity) => <button key={entity.id} onClick={() => onSelect(entity.id)} aria-pressed={selected.id === entity.id}>{entity.name}<span>{links.get(entity.id) ?? '↗'}</span></button>)}</div>
          </section>
        })}
        {(['Watchlist', 'Combinations'] as const).map((group, index) => {
          const items = pool.filter((entity) => group === 'Watchlist' ? entity.type === 'COMPOUND' && entity.researchStatus === 'WATCHLIST' : entity.type !== 'COMPOUND')
          if (!items.length) return null
          return <section key={group} className="topic-island" data-active={items.some((entity) => entity.id === selected.id)} style={{ '--island': index ? '#263356' : '#244755', '--island-accent': index ? '#a88cff' : '#8de7f3', '--delay': '0s' } as CSSProperties}>
            <div className="island-light" aria-hidden="true" /><span className="island-count">{String(items.length).padStart(2, '0')} research records</span><h4>{group}</h4>
            <div className="island-names">{items.map((entity) => <button key={entity.id} onClick={() => onSelect(entity.id)} aria-pressed={selected.id === entity.id}>{entity.name}<span>{links.get(entity.id) ?? '↗'}</span></button>)}</div>
          </section>
        })}
      </div>
    </div>
  )
}
