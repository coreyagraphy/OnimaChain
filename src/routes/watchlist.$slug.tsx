import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { RESEARCH_COMPOUNDS, RESEARCH_BY_ID, TARGETS, WATCHLIST } from '~/data/research-entities'

export const Route = createFileRoute('/watchlist/$slug')({
  loader: ({ params }) => { if (!WATCHLIST.some((c) => c.id === params.slug)) throw notFound(); return { slug: params.slug } },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData ? RESEARCH_BY_ID[loaderData.slug]?.name : 'Watchlist'} — OnimaChain research watchlist` }] }),
  component: WatchlistDetail,
})

function WatchlistDetail() {
  const { slug } = Route.useLoaderData()
  const c = RESEARCH_BY_ID[slug]
  const nearby = RESEARCH_COMPOUNDS.filter((other) => other.id !== slug && other.targets.some((id) => c.targets.includes(id))).slice(0, 6)
  return <article className="pt-28 pb-24 research-world"><header className="wrap research-hero"><Link to="/watchlist" className="label label-cyan">← Watchlist</Link><div className="flex flex-wrap gap-2 mt-7"><span className="research-status-pill">Informational profile</span><span className="research-status-pill">Watchlist</span></div><h1 className="display research-heading">{c.name}</h1><p className="lede max-w-3xl mt-6">{c.summary}</p>{c.aliases.length > 0 && <p className="mono text-xs text-bone/50 mt-5">Also known as {c.aliases.join(', ')}</p>}</header>
    <section className="wrap mt-10 grid lg:grid-cols-[1fr_1fr] gap-6"><div className="panel p-7"><p className="label label-cyan">What it interacts with</p><div className="flex flex-wrap gap-2 mt-4">{c.targets.map((id) => <Link key={id} to="/targets" className="chip chip-hollow">{TARGETS.find((t) => t.id === id)?.label}</Link>)}</div><p className="text-sm muted mt-6">A target relationship describes a research mechanism, not a proven personal outcome.</p></div><div className="panel p-7"><p className="label label-cyan">How far the research has gone</p><h2 className="display-md text-2xl mt-3">{c.stage ?? 'Not assessed'}</h2><dl className="text-sm mt-5 grid gap-2 text-bone/75"><div>Developer: {c.developer ?? 'Not mapped'}</div><div>Source date / reviewed: {c.statusAsOf ?? 'Pending'}</div><div>Scope: {c.jurisdiction ?? 'Not assessed'}</div></dl>{c.statusSource && <a href={c.statusSource} target="_blank" rel="noreferrer noopener" className="btn btn-sm mt-6">Open primary source ↗</a>}</div></section>
    <section className="wrap mt-8 panel p-7"><p className="label label-cyan">Structure provenance</p><h2 className="display-md text-2xl mt-3">Conceptual visualization only</h2><p className="text-sm muted mt-3 max-w-3xl">We have not added a verified sequence or experimental coordinate set for this record. The orbital graphic represents mapped target systems, not the molecule's physical 3D shape. No synthetic molecular model is presented as measured data.</p></section>
    <section className="wrap mt-16 border-t hairline pt-8"><p className="label label-cyan">Compare by target</p><h2 className="display-md text-3xl mt-3">Nearby signals</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">{nearby.map((other) => <Link key={other.id} to={other.researchStatus === 'WATCHLIST' ? '/watchlist/$slug' : '/compound/$slug'} params={{ slug: other.id }} className="panel p-5 block hover:border-cyan/40"><strong className="display-md text-lg">{other.name}</strong><span className="mono text-[10px] text-bone/50 block mt-2">{other.targets.join(' + ')}</span><span className="label label-cyan block mt-4">{other.researchStatus === 'WATCHLIST' ? 'Watchlist' : 'Core library'} · Informational</span></Link>)}</div></section>
    <p className="wrap mt-12 text-sm muted max-w-4xl">This profile is informational. Inclusion does not mean OnimaChain sells this molecule or that a regulator has approved it. Development status can change and should be checked against the linked primary source.</p>
  </article>
}
