import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG, computedMW, displayName, type Compound } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { claimsForCompound, RELATIONSHIP_LABEL, TRANSLATION_STAGES } from '~/data/claims'
import { distinctGroups, studiesForCompound, STUDY_BY_PMID } from '~/data/studies'
import { distributionFor, latestChangeFor, themesFor, translationFor } from '~/data/evidence'
import { buildChain } from '~/scenes/chain/geometry'
import { StructureViewer } from '~/components/StructureViewer'
import { ResidueTable } from '~/components/ResidueTable'
import { EvidenceGenome } from '~/components/EvidenceGenome'
import { TranslationTrack } from '~/components/TranslationTrack'
import { EmptyState, CORPUS_ABSENCE } from '~/components/EmptyState'
import { StudyCard } from '~/components/StudyCard'
import { ClaimCard } from '~/components/ClaimCard'
import { TimelineLane } from '~/components/TimelineLane'
import { ProvenanceDrawer } from '~/components/ProvenanceDrawer'
import { ProvenanceLabel } from '~/components/SourceBadge'
import { ScrollTrigger } from '~/motion/timeline'
import { BRAND } from '~/brand'
import { descriptionFor, PRICE_PLACEHOLDER, shopTopicFor, themeFor, wordmarkStyle } from '~/data/commerce'
import { useCommerceStore } from '~/stores/commerce'

export const Route = createFileRoute('/compound/$slug')({
  loader: ({ params }) => {
    const c = COMPOUND_BY_SLUG[params.slug]
    if (!c) throw notFound()
    return { slug: c.slug }
  },
  head: ({ loaderData }) => {
    const c = loaderData ? COMPOUND_BY_SLUG[loaderData.slug] : undefined
    const name = c ? displayName(c) : 'Compound'
    return {
      meta: [
        { title: `${name} — ${BRAND} dossier` },
        { name: 'description', content: `${name}: research footprint, human signal, translation state and claim lineage. Evidence classes kept separate.` },
      ],
      scripts: c
        ? [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Dataset', name: `${name} evidence record`, description: 'Structured evidence and signal record. Research and educational information.', creator: { '@type': 'Organization', name: `${BRAND}` }, dateModified: '2026-09-20' }) }]
        : [],
    }
  },
  component: Dossier,
})

function Dossier() {
  const { slug } = Route.useLoaderData()
  const c = COMPOUND_BY_SLUG[slug]
  const domain = DOMAIN_BY_ID[c.domain]
  const productTheme = themeFor(c)
  const geometry = useMemo(() => buildChain(c), [c])
  const studies = studiesForCompound(slug)
  const claims = claimsForCompound(slug)
  const themes = themesFor(slug)
  const translation = translationFor(slug)
  const dist = distributionFor(slug)
  const change = latestChangeFor(slug)
  const groups = distinctGroups(studies)
  const mw = c.mw ?? computedMW(c)
  const [drawer, setDrawer] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const addToCart = useCommerceStore((s) => s.add)
  const header = useRef<HTMLElement>(null)
  const scroll = useRef(0)
  useEffect(() => {
    if (!header.current) return
    const st = ScrollTrigger.create({ trigger: header.current, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => { scroll.current = s.progress } })
    return () => st.kill()
  }, [])
  const events = claims.flatMap((cl) => cl.changeHistory.map((e) => ({ ...e, claim: cl.id })))

  return (
    <article className="pt-[72px] compound-world" style={{ '--product': productTheme.primary, '--product-2': productTheme.secondary, '--product-3': productTheme.tertiary } as CSSProperties}>
      {/* A — immersive header */}
      <header ref={header} className="relative min-h-[92vh] grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-stretch overflow-hidden product-hero" style={{ background: `radial-gradient(70% 60% at 75% 40%, ${productTheme.primary}22, transparent 60%)` }}>
        <div className="wrap !mr-0 py-12 lg:py-16 flex flex-col justify-center relative z-10">
          <p className="label" style={{ color: domain.palette.base }}>{domain.name} · commonly explored around {shopTopicFor(c)}</p>
          <h1 className="wordmark text-[clamp(3.4rem,7.5vw,7.2rem)] mt-4" style={wordmarkStyle(productTheme)}>{displayName(c)}</h1>
          <p className="mt-5 text-base font-semibold text-bone/84 leading-relaxed max-w-xl">{descriptionFor(c)}</p>
          <div className="mt-7 flex items-end gap-6"><div><p className="label">Temporary price</p><p className="display-md text-3xl mt-1">{PRICE_PLACEHOLDER}</p></div><div><p className="label">Availability</p><p className="text-sm mt-2 text-bone/65">Pending review</p></div></div>
          {c.displayName && <p className="mono text-[12px] text-bone/55 mt-2">Compound: {c.name.toLowerCase()}</p>}
          {c.aliases.length > 0 && <p className="mt-4 text-sm muted">Also indexed as {c.aliases.join(' · ')}</p>}
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 max-w-lg">
            <div className="col-span-2">
              <dt className="label">Sequence</dt>
              <dd className="mono text-[13px] md:text-sm mt-1 break-all text-bone/90">{c.sequence ?? <span className="text-bone/50">Sequence pending verification</span>}</dd>
            </div>
            <div><dt className="label">Length</dt><dd className="mono mt-1">{c.sequence ? `${c.sequence.length} residues` : '—'}</dd></div>
            <div><dt className="label">MW</dt><dd className="mono mt-1">{mw ? `${mw} Da` : '—'}{mw && !c.mw && <span className="text-bone/45 text-[11px]"> computed</span>}</dd></div>
            <div><dt className="label">Product tags</dt><dd className="mt-1 text-sm capitalize">{c.tags.slice(0, 3).map((x) => x.replaceAll('-', ' ')).join(' · ')}</dd></div>
            <div><dt className="label">Checked sources</dt><dd className="mt-1 text-sm">{studies.length ? `${studies.length} source${studies.length === 1 ? '' : 's'} in our record` : 'No checked source added yet'}</dd></div>
            <div className="col-span-2"><dt className="label">Where the molecule came from</dt><dd className="mt-1"><ProvenanceLabel compound={c} /></dd></div>
          </dl>
          {c.note && <p className="mt-4 text-[12px] muted max-w-lg">{c.note}</p>}
          <div className="mt-8 flex flex-wrap gap-2 items-center">
            <div className="quantity-control" aria-label="Quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div>
            <button className="btn commerce-btn" onClick={() => addToCart(c.slug, quantity)} data-cursor="add">Add to cart</button>
            <Link to="/compare" search={{ a: slug, b: slug === 'tb-500' ? 'bpc-157' : 'tb-500' }} className="btn">Compare</Link>
            <Link to="/saved" className="btn">Save</Link>
            <button className="btn" onClick={() => setDrawer('share')}>Share</button>
          </div>
          <a href="#snapshot" className="label mt-8 hover:text-bone">See the simple guide ↓</a>
        </div>
        <div id="structure" className="relative min-h-[440px] lg:min-h-0">
          <StructureViewer compound={c} tint={domain.palette.base} accent={domain.palette.accent} scrollRef={scroll} />
        </div>
      </header>

      <nav className="research-tabs" aria-label="Product research sections"><a href="#snapshot">Overview</a><a href="#genome">Research</a><a href="#signal">What people report</a><a href="#translation">How far research has gone</a><a href="#timeline">Timeline</a><a href="#sources">Sources</a></nav>

      {/* B — snapshot */}
      <Section id="snapshot" k="B" title="Snapshot">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Snap title="What we have checked" onOpen={() => setDrawer('research')}>{studies.length ? `${studies.length} source${studies.length === 1 ? '' : 's'} total${dist.human ? ` · ${dist.human} involving people` : ''}${dist.animal ? ` · ${dist.animal} using animals` : ''}${dist.review ? ` · ${dist.review} review${dist.review === 1 ? '' : 's'}` : ''}` : 'We haven’t added a checked source for this yet.'}</Snap>
          <Snap title="Why people look it up" onOpen={() => setDrawer('signal')}>{shopTopicFor(c)} · open the Portal of Tides to see nearby names</Snap>
          <Snap title="How far the research has gone" onOpen={() => setDrawer('translation')}>{translation.length ? translation.map((t) => `${t.outcome}: ${t.stages.length ? TRANSLATION_STAGES.filter((s) => t.stages.includes(s.id)).map((s) => s.label).join(' → ') : 'no supported stage'}`).join(' · ') : 'No outcome mapped yet'}</Snap>
          <Snap title="What's new" onOpen={() => setDrawer('change')} amber>{change ? `${change.date} — ${change.change}` : 'No change recorded'}</Snap>
          <Snap title="Regulatory snapshot" onOpen={() => setDrawer('regulatory')}>No regulatory record indexed · <Link to="/status/$compound" params={{ compound: slug }} className="underline">jurisdiction view</Link></Snap>
        </div>
      </Section>

      {/* C — evidence genome */}
      <Section id="genome" k="C" title="Research at a glance" lede="A simple picture of the sources we have checked. More color means more records in that category—not that the product works better.">
        {studies.length ? <EvidenceGenome slug={slug} /> : <EmptyState title={CORPUS_ABSENCE} detail="The genome renders hollow until a verified record is indexed for this compound." />}
      </Section>

      {/* D — research themes */}
      <Section id="themes" k="D" title="What the sources looked at" lede="These topics come only from sources in our record. We do not add a topic just because it is popular online.">
        {themes.length ? (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((t) => (
              <li key={t.id} className="panel-flat p-5">
                <p className="label" style={{ color: t.kind === 'discussion' ? '#8A63FF' : '#5FE3FF' }}>{t.kind === 'discussion' ? 'People discuss' : 'A source studied'}</p>
                <p className="display-md text-lg mt-2">{t.label}</p>
                <p className="mono text-[11px] text-bone/50 mt-3">
                  {t.kind === 'discussion' ? 'Live community feeds are not connected yet.' : t.pmids.length ? `Checked sources: ${t.pmids.map((p) => `PMID ${p}`).join(', ')}` : 'No checked source added yet'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No themes indexed" detail="Research themes appear only after verified records are indexed and classified for this compound." />
        )}
      </Section>

      {/* E — human signal */}
      <Section id="signal" k="E" title="Why people look it up" lede="A plain-language starting point. This is not a promise that the product will cause a result.">
        <div className="panel p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center" style={{ '--panel-accent': productTheme.primary } as CSSProperties}>
          <div><p className="label" style={{ color: productTheme.primary }}>{shopTopicFor(c)}</p><h3 className="display-md text-2xl mt-3">See {displayName(c)} beside similar names.</h3><p className="mt-3 text-sm muted max-w-2xl">The Portal of Tides lets you switch between a constellation, connection view, checked-source timeline, and topic map. It uses the products already in our collection—no fake customer counts.</p></div>
          <Link to="/signal" className="btn commerce-btn">Open Portal of Tides</Link>
        </div>
      </Section>

      {/* F — signal ↔ science */}
      <Section id="convergence" k="F" title="What the record can tell us" lede="A product page can show what was studied. It cannot promise what will happen to a person.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-flat p-5 border-t-2 border-t-cyan">
            <p className="label label-cyan">What we can show</p>
            {themes.filter((t) => t.kind === 'research').length ? (
              <ul className="mt-3 grid gap-2">{themes.filter((t) => t.kind === 'research').map((t) => <li key={t.id} className="text-sm flex justify-between gap-3"><span>{t.label}</span><span className="mono text-[11px] text-bone/45">{t.pmids.length} verified</span></li>)}</ul>
            ) : <p className="mt-3 text-sm muted">No source topic has been added yet.</p>}
          </div>
          <div className="panel-flat p-5 border-t-2 border-t-violet">
            <p className="label label-violet">What we cannot promise</p>
            <p className="mt-3 text-sm muted">A lab result, animal study, online story, or product page cannot tell you what will happen to you. That question needs qualified medical guidance.</p>
          </div>
        </div>
        <div className="mt-4 panel p-5 flex flex-wrap items-center gap-3">
          <span className="label">The short version</span>
          <span className="chip chip-hollow">research is not a guarantee</span>
          <span className="text-sm muted">We keep the product, source, and claim separate so you can see which is which.</span>
        </div>
      </Section>

      {/* G — claim lineage */}
      <Section id="claims" k="G" title="Claim lineage" lede="Top associated claims. Each opens the full lineage graph.">
        {claims.length ? <div className="grid md:grid-cols-2 gap-4">{claims.map((cl) => <ClaimCard key={cl.id} claim={cl} />)}</div> : <EmptyState title="No claim record indexed for this compound" detail="Claims are created only with an origin record or an explicit unresolved-origin state." />}
      </Section>

      {/* H — translation */}
      <Section id="translation" k="H" title="Translation gap" lede="Cell → Mouse → Rat → Larger animal → Human → Controlled human → Approved use — per outcome. Stages light only where a verified record supports them.">
        <TranslationTrack rows={translation} />
      </Section>

      {/* I — research independence */}
      <Section id="independence" k="I" title="Research independence" lede="Ten papers from one laboratory are not ten independent replications.">
        {studies.length ? (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
            <div className="panel-flat p-5">
              <p className="label">Distinct last-author groups (proxy)</p>
              <p className="display text-5xl mt-2">{groups.length}<span className="text-lg text-bone/40"> / {studies.length} records</span></p>
              <ul className="mt-4 grid gap-1 text-sm">{groups.map((g) => <li key={g} className="flex justify-between"><span>{g}</span><span className="mono text-[11px] text-bone/45">{studies.filter((s) => s.meta?.lastAuthor === g).length} record(s)</span></li>)}</ul>
              <p className="mt-4 text-[12px] muted">Institutions, funding and citation links: Not assessed — esummary does not carry affiliations; a Crossref/efetch connector is required.</p>
            </div>
            <IndependenceMap groups={groups} counts={groups.map((g) => studies.filter((s) => s.meta?.lastAuthor === g).length)} />
          </div>
        ) : <EmptyState title="Not assessed" detail="Independence is estimated only from verified records." />}
      </Section>

      {/* J — contradictions */}
      <Section id="contradictions" k="J" title="What doesn't fit?" lede="Disagreement is surfaced, not hidden.">
        {claims.some((cl) => cl.support.some((s) => s.relationship === 'partially_supports')) && (
          <div className="grid gap-3 mb-4">
            {claims.flatMap((cl) => cl.support.filter((s) => s.relationship === 'partially_supports').map((s) => STUDY_BY_PMID[s.pmid] && <StudyCard key={s.pmid} study={STUDY_BY_PMID[s.pmid]} relationship={RELATIONSHIP_LABEL[s.relationship]} basis={s.basis} />))}
          </div>
        )}
        <EmptyState title="No contradictory study currently indexed" detail="Null findings, conflicting research and methodological criticism appear here when indexed. A partial relationship above is not a contradiction." />
      </Section>

      {/* K — timeline */}
      <Section id="timeline" k="K" title="Timeline" lede="Research and public-signal history, in separate lanes.">
        {(['research', 'trials', 'regulatory', 'signal'] as const).map((lane) => <TimelineLane key={lane} lane={lane} events={events.filter((e) => e.lane === lane)} />)}
      </Section>

      {/* L — sources */}
      <Section id="sources" k="L" title="Sources" lede="Fully traceable bibliography. Only build-time-verified PMIDs are rendered as citations.">
        {studies.length ? <div className="grid md:grid-cols-2 gap-3">{studies.map((s) => <StudyCard key={s.pmid} study={s} />)}</div> : <EmptyState title={CORPUS_ABSENCE} />}
        <div className="mt-8">
          <p className="label mb-3">Residue table (SSR equivalent of the structure)</p>
          <ResidueTable geometry={geometry} />
        </div>
      </Section>

      <ProvenanceDrawer open={drawer !== null} onClose={() => setDrawer(null)} title={drawerTitle(drawer)}>
        {drawerBody(drawer, c, studies.length, groups.length)}
      </ProvenanceDrawer>
    </article>
  )
}

function Section({ id, k, title, lede, children }: { id: string; k: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="wrap py-16 md:py-20 border-t hairline" aria-label={title}>
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <div>
          <p className="label label-cyan">Section {k}</p>
          <h2 className="display-md text-2xl md:text-3xl mt-2">{title}</h2>
          {lede && <p className="mt-3 text-sm muted">{lede}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

function Snap({ title, children, onOpen, amber }: { title: string; children: React.ReactNode; onOpen: () => void; amber?: boolean }) {
  return (
    <button onClick={onOpen} className={`panel-flat p-4 text-left hover:border-cyan/40 transition ${amber ? 'border-t-2 border-t-amber' : ''}`}>
      <p className="label">{title}</p>
      <p className="mt-2 text-[13px] text-bone/85 leading-snug">{children}</p>
      <p className="mt-3 mono text-[10px] text-bone/40">expand provenance →</p>
    </button>
  )
}

function IndependenceMap({ groups, counts }: { groups: string[]; counts: number[] }) {
  const n = groups.length
  return (
    <svg viewBox="0 0 360 240" className="w-full panel-flat" role="img" aria-label={`Research independence map: ${n} distinct last-author groups`}>
      {groups.map((g, i) => {
        const a = (i / Math.max(1, n)) * Math.PI * 2
        const x = Math.round((180 + Math.cos(a) * 80) * 100) / 100, y = Math.round((120 + Math.sin(a) * 65) * 100) / 100
        const r = 8 + counts[i] * 5
        return (
          <g key={g}>
            <line x1={180} y1={120} x2={x} y2={y} stroke="#5FE3FF" strokeOpacity={0.2} />
            <circle cx={x} cy={y} r={r} fill="#5FE3FF" fillOpacity={0.25} stroke="#5FE3FF" />
            <text x={x} y={y + r + 12} fontSize={9} textAnchor="middle" fill="#F2EEE6" fillOpacity={0.7} fontFamily="JetBrains Mono Variable, monospace">{g}</text>
          </g>
        )
      })}
      <circle cx={180} cy={120} r={5} fill="#F2EEE6" />
      <text x={180} y={232} fontSize={9} textAnchor="middle" fill="#F2EEE6" fillOpacity={0.45} fontFamily="JetBrains Mono Variable, monospace">node size = records per last-author group · edges to cross-citations: not assessed</text>
    </svg>
  )
}

function drawerTitle(k: string | null) {
  return { research: 'Sources we checked', signal: 'Why people look it up', translation: 'How far the research has gone', change: 'What changed', regulatory: 'Legal and approval status', share: 'Share' }[k ?? ''] ?? ''
}
function drawerBody(k: string | null, c: Compound, n: number, groups: number) {
  switch (k) {
    case 'research': return <><p>{n} PMIDs listed in studies.ts for {displayName(c)} resolved against NCBI eutils at build time. Study type and species come from the record title / publication type; tags from the abstract.</p><p>{groups} distinct last-author surname(s) — a proxy, not an institution map.</p></>
    case 'signal': return <><p>People commonly explore {displayName(c)} around {shopTopicFor(c)}.</p><p>We do not have live social feeds connected, so we do not invent mention counts or customer stories. Use the Portal of Tides to see related names in this collection.</p></>
    case 'translation': return <p>Stages are lit from claims.ts → translation, which is populated only when a verified record with the matching species / model exists. Nothing is inferred from reviews.</p>
    case 'change': return <p>Derived from claims.ts change history. The only event so far is claim creation, dated 2026-09-20. Nothing has been rewritten.</p>
    case 'regulatory': return <p>No regulatory connector is enabled. The status page shows jurisdiction and date fields with an explicit empty state. An advisory vote is never shown as an approval.</p>
    case 'share': return <><p>Copy the canonical URL: <span className="mono">/compound/{c.slug}</span></p><p>Share cards and research-packet export are in production; they will carry no treatment recommendation.</p></>
    default: return null
  }
}
