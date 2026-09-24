import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { useMemo, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG, computedMW, displayName } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { descriptionFor, themeFor, wordmarkStyle } from '~/data/commerce'
import { officialSourcesFor } from '~/data/official-sources'
import { studiesForCompound } from '~/data/studies'
import { claimsForCompound } from '~/data/claims'
import { structurePresentation } from '~/data/structure-presentation'
import { buildChain } from '~/scenes/chain/geometry'
import { StructureViewer } from '~/components/StructureViewer'
import { ResidueTable } from '~/components/ResidueTable'
import { ProvenanceLabel } from '~/components/SourceBadge'
import { StudyCard } from '~/components/StudyCard'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/compound/$slug')({
  loader: ({ params }) => {
    if (params.slug === 'wolverine-blend') throw redirect({ to: '/observatory', search: { station: 'evidence' }, statusCode: 302 })
    if (!COMPOUND_BY_SLUG[params.slug]) throw notFound()
    return { slug: params.slug }
  },
  head: ({ loaderData }) => {
    const c = loaderData ? COMPOUND_BY_SLUG[loaderData.slug] : undefined
    const name = c ? displayName(c) : 'Molecule record'
    return { meta: [
      { title: `${name} — identity and sources | ${BRAND}` },
      { name: 'description', content: c ? descriptionFor(c) : 'Identity and source record.' },
      { property: 'og:title', content: `${name} — identity and sources` },
      { property: 'og:description', content: c ? descriptionFor(c) : 'Identity and source record.' },
    ] }
  },
  component: Dossier,
})

function Dossier() {
  const { slug } = Route.useLoaderData()
  const c = COMPOUND_BY_SLUG[slug]
  const domain = DOMAIN_BY_ID[c.domain]
  const theme = themeFor(c)
  const presentation = structurePresentation(c)
  const studies = studiesForCompound(slug)
  const official = officialSourcesFor(slug)
  const tracked = claimsForCompound(slug)
  const geometry = useMemo(() => buildChain(c), [c])
  const mw = c.mw ?? computedMW(c)
  return <article className="pt-[72px] compound-world" style={{ '--product': theme.primary, '--product-2': theme.secondary, '--product-3': theme.tertiary } as CSSProperties}>
    <header className="relative min-h-[80vh] grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-stretch overflow-hidden product-hero" style={{ background: `radial-gradient(70% 60% at 75% 40%, ${theme.primary}2E, transparent 60%), linear-gradient(180deg, ${theme.deepBackground} 0%, #0A0B0E 100%)` }}>
      <div className="wrap lg:!mr-0 py-12 lg:py-16 flex flex-col justify-center relative z-10 min-w-0">
        <p className="label" style={{ color: domain.palette.base }}>{domain.name} · identity record</p>
        <h1 className="wordmark text-[clamp(3rem,7.5vw,7.2rem)] mt-4 break-words" style={wordmarkStyle(theme)}>{displayName(c)}</h1>
        <p className="mt-5 text-base font-semibold text-bone/84 leading-relaxed max-w-xl">{descriptionFor(c)}</p>
        <div className="mt-6 panel-flat p-4 max-w-xl border-l-2 border-l-cyan"><strong className="label label-cyan">Review state: summary held</strong><p className="text-sm text-bone/75 mt-2">Citation details in this record may be checked, but a source-backed benefit or safety summary has not been completed. No conclusion about personal use is provided.</p></div>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 max-w-lg">
          <div className="col-span-2"><dt className="label">Sequence record</dt><dd className="mono text-[13px] md:text-sm mt-1 break-all text-bone/90">{c.sequence ?? <span className="text-bone/50">{presentation.label}</span>}</dd></div>
          <div><dt className="label">Length</dt><dd className="mono mt-1">{c.sequence ? `${c.sequence.length} residues` : 'Unresolved'}</dd></div>
          <div><dt className="label">Molecular weight</dt><dd className="mono mt-1">{mw ? `${mw} Da${!c.mw ? ' · computed' : ''}` : 'Not listed'}</dd></div>
          <div><dt className="label">Citation metadata</dt><dd className="mt-1 text-sm">{studies.length ? `${studies.length} indexed record${studies.length === 1 ? '' : 's'}` : 'Study review pending'}</dd></div>
          <div><dt className="label">Scientific claim review</dt><dd className="mt-1 text-sm">Not completed for this page</dd></div>
          <div className="col-span-2"><dt className="label">Structure provenance</dt><dd className="mt-1"><ProvenanceLabel compound={c} /></dd></div>
        </dl>
        {c.note && <p className="mt-4 text-[12px] muted max-w-lg">{c.note}</p>}
        {slug === 'tb-500' && <a href="https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks" target="_blank" rel="noreferrer noopener" className="text-sm text-cyan mt-3 underline">FDA fragment-identity reference ↗</a>}
        <div className="mt-8 flex flex-wrap gap-2"><a href="#sources" className="btn btn-primary">Inspect sources</a><Link to="/compare" search={{ a: slug, b: slug === 'thymosin-beta-4' ? 'tb-500' : 'thymosin-beta-4' }} className="btn">Compare identities</Link><Link to="/explore" className="btn">Browse library</Link></div>
      </div>
      <div id="structure" className="relative min-h-[440px] lg:min-h-0"><StructureViewer compound={c} tint={domain.palette.base} accent={domain.palette.accent} /></div>
    </header>

    <section className="wrap py-14 md:py-20 grid md:grid-cols-[.7fr_1.3fr] gap-8 border-t hairline" aria-labelledby="record-covers"><div><p className="label label-cyan">01 / identity</p><h2 id="record-covers" className="display-md text-3xl mt-3">What this record covers</h2></div><div><p className="lede">{descriptionFor(c)}</p><p className="text-sm muted mt-5">The molecular view is labeled by provenance. A sequence-derived illustration is not a measured 3D structure and does not predict an effect.</p>{c.aliases.length > 0 && <p className="text-sm muted mt-4">Names indexed for search: {c.aliases.join(' · ')}</p>}</div></section>

    <section id="sources" className="wrap py-14 md:py-20 border-t hairline" aria-labelledby="sources-title"><p className="label label-cyan">02 / sources</p><h2 id="sources-title" className="display-md text-3xl mt-3">Sources and review limits</h2><p className="text-sm muted mt-4 max-w-3xl">A PubMed identifier and bibliographic metadata check confirms a citation record exists; it does not validate a claim, source-to-molecule match, efficacy, or safety. The list below is not a comprehensive literature review.</p>
      {official.length > 0 && <div className="grid md:grid-cols-2 gap-3 mt-8">{official.map(source => <article key={source.id} className="panel p-5"><p className="label label-cyan">Regulatory record reviewed · {source.retrieved}</p><h3 className="font-semibold text-bone/95 mt-2">{source.title}</h3><p className="mono text-[11px] text-bone/55 mt-2">{source.identifier}</p><p className="text-sm text-bone/80 mt-3">{source.indication}</p>{source.limitation && <p className="text-sm muted mt-3">{source.limitation}</p>}<a href={source.url} target="_blank" rel="noreferrer noopener" className="btn btn-sm mt-4">Open official record ↗</a></article>)}</div>}
      {official.length === 0 && <div className="panel-flat p-5 mt-8"><strong>Regulatory record not yet reviewed for this profile.</strong><p className="text-sm muted mt-2">This does not establish whether a particular product is approved or permitted for sale.</p></div>}
      {studies.length > 0 ? <div className="grid md:grid-cols-2 gap-3 mt-8">{studies.map(study => <StudyCard key={study.pmid} study={study} />)}</div> : <div className="panel-flat p-5 mt-8"><strong>Study review pending.</strong><p className="text-sm muted mt-2">We have not completed a source-backed summary for this profile. No conclusion about benefits or safety is provided here.</p></div>}
    </section>

    {tracked.length > 0 && <section className="wrap py-14 border-t hairline"><p className="label label-cyan">03 / tracked language</p><h2 className="display-md text-3xl mt-3">Claims being examined</h2><p className="text-sm muted mt-4 max-w-3xl">These are claims encountered in discussion, not endorsed conclusions. The source-to-claim interpretation remains under editorial review.</p><div className="flex flex-wrap gap-3 mt-6">{tracked.map(claim => <Link key={claim.id} to="/claim/$id" params={{ id: claim.id }} className="btn btn-sm">Inspect “{claim.title}”</Link>)}</div></section>}
    {c.sequence && <section className="wrap py-14 border-t hairline"><p className="label label-cyan">Structure key</p><h2 className="display-md text-3xl mt-3">Residues, one by one</h2><p className="text-sm muted mt-3 mb-7">A sequence representation, not an experimentally determined conformation.</p><ResidueTable geometry={geometry} /></section>}
    <div className="wrap py-8 border-t hairline text-sm muted">Educational reference only. No ordering, personal suitability assessment, administration guidance, or product recommendation.</div>
  </article>
}
