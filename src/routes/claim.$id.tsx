import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { CLAIM_BY_ID } from '~/data/claims'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { STUDY_BY_PMID } from '~/data/studies'
import { MutationLadder } from '~/components/MutationLadder'
import { StudyCard } from '~/components/StudyCard'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/claim/$id')({
  loader: ({ params }) => { if (!CLAIM_BY_ID[params.id]) throw notFound(); return { id: params.id } },
  head: ({ loaderData }) => {
    const claim = loaderData ? CLAIM_BY_ID[loaderData.id] : undefined
    return { meta: [{ title: claim ? `Tracked statement: “${claim.title}” — ${BRAND}` : 'Tracked statement' }, { name: 'description', content: 'A statement indexed for critical appraisal. Citation metadata does not establish that its scientific interpretation is correct.' }, { property: 'og:description', content: 'Tracked statement; source-to-claim review pending. Not an endorsed conclusion.' }] }
  },
  component: ClaimPage,
})

function ClaimPage() {
  const { id } = Route.useLoaderData()
  const claim = CLAIM_BY_ID[id]
  const compound = COMPOUND_BY_SLUG[claim.compound]
  const candidate = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : undefined
  const linked = claim.support.map(link => STUDY_BY_PMID[link.pmid]).filter(study => study?.status === 'verified')
  return <article className="pt-28 wrap">
    <Link to="/claims" className="label hover:!text-bone">← Tracked statements</Link>
    <p className="label label-amber mt-7">Critical-analysis record · source-to-claim review pending</p>
    <h1 className="display text-[clamp(2.4rem,6vw,5.6rem)] mt-3 max-w-5xl">“{claim.title}”</h1>
    <p className="lede mt-5 max-w-3xl">This is wording we are examining, not a finding we endorse. The presence of a PubMed record only establishes citation metadata. Exact formulation, measured endpoint, limitations and contrary evidence need editorial review before a scientific conclusion appears here.</p>
    <Link to="/compound/$slug" params={{ slug: compound.slug }} className="btn btn-sm mt-6">Open {displayName(compound)} identity record</Link>
    <section className="py-14 border-t hairline mt-12" aria-labelledby="candidate-title"><p className="label label-cyan">01 / citation candidate</p><h2 id="candidate-title" className="display-md text-3xl mt-3">Open the original record</h2><p className="text-sm muted mt-3 max-w-2xl">We do not yet certify that this was the earliest source or that it supports the tracked statement.</p><div className="grid md:grid-cols-2 gap-4 mt-7">{candidate ? <StudyCard study={candidate} /> : <p className="panel-flat p-5">No verified citation candidate is attached.</p>}{linked.filter(study => study.pmid !== candidate?.pmid).map(study => <StudyCard key={study.pmid} study={study} />)}</div></section>
    <section className="py-14 border-t hairline" aria-labelledby="scope-title"><p className="label label-cyan">02 / recorded scope</p><h2 id="scope-title" className="display-md text-3xl mt-3">What the indexed abstract describes</h2><dl className="grid md:grid-cols-2 gap-4 mt-7"><div className="panel-flat p-5"><dt className="label">Model</dt><dd className="text-sm mt-3">{claim.originalScope.model ?? 'Not recorded'}</dd></div><div className="panel-flat p-5"><dt className="label">Measured endpoint</dt><dd className="text-sm mt-3">{claim.originalScope.endpoint ?? 'Not recorded'}</dd></div></dl><p className="text-sm muted mt-4">These fields were transcribed for review and have not been promoted to a reviewed claim summary. Read the linked source for context.</p></section>
    <section className="py-14 border-t hairline" aria-labelledby="wording-title"><p className="label label-cyan">03 / teaching example</p><h2 id="wording-title" className="display-md text-3xl mt-3">How wording can drift</h2><p className="text-sm muted mt-3 max-w-2xl">Later versions in this ladder are illustrative wording, not scraped social posts or independent sources. They demonstrate types of inference error; they are not evidence that this specific statement actually spread in this sequence.</p><div className="mt-7"><MutationLadder claim={claim} /></div></section>
    <div className="py-9 border-t hairline text-sm muted">No benefit, safety or personal-use conclusion is issued from this draft record. <Link to="/learn" search={{ activity: 'evidence' }} className="text-cyan underline">Practice evidence reasoning in Evidence Worlds.</Link></div>
  </article>
}
