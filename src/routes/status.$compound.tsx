import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { EmptyState } from '~/components/EmptyState'

export const Route = createFileRoute('/status/$compound')({
  loader: ({ params }) => { if (!COMPOUND_BY_SLUG[params.compound]) throw notFound(); return { slug: params.compound } },
  component: Status,
})

const JURISDICTIONS = ['United States (FDA)', 'European Union (EMA)', 'United Kingdom (MHRA)', 'Australia (TGA)', 'Canada (Health Canada)', 'WADA (sport)']
const CATEGORIES = ['Approved use', 'Investigational status', 'Compounding actions', 'Sports restrictions', 'Regulatory warnings', 'Advisory proceedings']

function Status() {
  const { slug } = Route.useLoaderData()
  const c = COMPOUND_BY_SLUG[slug]
  const [j, setJ] = useState(JURISDICTIONS[0])
  return (
    <div className="pt-28 wrap">
      <Link to="/compound/$slug" params={{ slug }} className="label hover:!text-bone">← {displayName(c)} dossier</Link>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-4">Regulatory status</h1>
      <p className="lede mt-4 max-w-2xl">Jurisdiction-specific and date-specific. An advisory vote is never an approval; &ldquo;not prohibited&rdquo; is never &ldquo;approved&rdquo;.</p>
      <div className="mt-8 flex flex-wrap gap-3 items-end">
        <label className="grid gap-1"><span className="label">Jurisdiction</span><select value={j} onChange={(e) => setJ(e.target.value)}>{JURISDICTIONS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <div className="grid gap-1"><span className="label">As of date</span><span className="mono text-sm text-bone/50 py-2">— no record</span></div>
      </div>
      <div className="mt-8 grid md:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="panel-flat p-5"><p className="label">{cat}</p><p className="mono text-[11px] text-bone/45 mt-1">{j}</p><div className="mt-3"><EmptyState compact title="No regulatory record indexed" detail="Regulatory connectors (FDA, EMA, WADA…) are not enabled. Nothing is inferred from secondary sources." /></div></div>
        ))}
      </div>
    </div>
  )
}
