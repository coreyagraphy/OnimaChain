import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { officialSourcesFor } from '~/data/official-sources'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/status/$compound')({
  loader: ({ params }) => { if (!COMPOUND_BY_SLUG[params.compound]) throw notFound(); return { slug: params.compound } },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData ? displayName(COMPOUND_BY_SLUG[loaderData.slug]) : 'Molecule'} regulatory records — ${BRAND}` }, { name: 'description', content: 'Official regulatory records attached to this identity. An absent site record is not a finding about approval or sale.' }] }),
  component: Status,
})

function Status() {
  const { slug } = Route.useLoaderData()
  const c = COMPOUND_BY_SLUG[slug]
  const records = officialSourcesFor(slug)
  return <div className="pt-28 wrap min-h-[60vh]">
    <Link to="/compound/$slug" params={{ slug }} className="label hover:!text-bone">← Back to {displayName(c)}</Link>
    <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-4">Regulatory records reviewed.</h1>
    <p className="lede mt-4 max-w-3xl">Approval belongs to a specific product and indication. This index is not a legal-status determination for other formulations or jurisdictions.</p>
    {records.length ? <div className="grid md:grid-cols-2 gap-3 mt-9">{records.map(record => <article key={record.id} className="panel p-6"><p className="label label-cyan">Official source · reviewed {record.retrieved}</p><h2 className="display-md text-xl mt-3">{record.title}</h2><p className="mono text-[11px] muted mt-2">{record.identifier}</p><p className="text-sm mt-4">{record.indication}</p>{record.limitation && <p className="text-sm muted mt-3">{record.limitation}</p>}<a href={record.url} target="_blank" rel="noreferrer noopener" className="btn btn-sm mt-5">Open official source ↗</a></article>)}</div> : <div className="panel-flat p-6 mt-9 max-w-3xl"><h2 className="display-md text-xl">Regulatory record not yet reviewed for this profile.</h2><p className="text-sm muted mt-3">This does not establish whether a particular product is approved or permitted for sale. Check the relevant regulator's current records.</p></div>}
  </div>
}
