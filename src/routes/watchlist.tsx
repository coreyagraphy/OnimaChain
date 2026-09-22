import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { WATCHLIST, TARGETS, type TargetId } from '~/data/research-entities'
import { ResearchEntityCard } from '~/components/ResearchEntityCard'

export const Route = createFileRoute('/watchlist')({ head: () => ({ meta: [{ title: 'Watchlist — OnimaChain' }, { name: 'description', content: 'Investigational molecules tracked as informational research profiles, separate from OnimaChain inventory.' }] }), component: WatchlistPage })

function WatchlistPage() {
  const child = useRouterState({ select: (state) => state.location.pathname.startsWith('/watchlist/') })
  if (child) return <Outlet />
  return <WatchlistIndex />
}

function WatchlistIndex() {
  const [target, setTarget] = useState<TargetId | 'ALL'>('ALL')
  const [expanded, setExpanded] = useState(false)
  const rows = useMemo(() => WATCHLIST.filter((c) => target === 'ALL' || c.targets.includes(target)), [target])
  const visible = expanded ? rows : rows.slice(0, 8)
  return <div className="pt-28 pb-24 research-world">
    <header className="wrap research-hero"><p className="label label-cyan">Molecular intelligence / emerging research</p><h1 className="display research-heading">What researchers are <span>watching next.</span></h1><p className="lede max-w-3xl mt-6">These compounds aren't necessarily available through OnimaChain. They're here because the research around them is moving and worth following.</p><div className="research-hero-rule" /><p className="mono text-xs text-bone/55">{WATCHLIST.length} tracked molecules · none listed for sale · each development label links to a dated source</p></header>
    <section className="wrap mt-12" aria-label="Watchlist filters"><label className="label" htmlFor="watchlist-target">Find by receptor</label><div className="flex flex-wrap gap-3 mt-3"><select id="watchlist-target" className="research-select" value={target} onChange={(e) => { setTarget(e.target.value as TargetId | 'ALL'); setExpanded(false) }}><option value="ALL">All targets</option>{TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select><Link to="/targets" className="btn btn-sm">Open target map →</Link></div></section>
    <section className="wrap research-card-grid mt-8">{visible.map((c) => <ResearchEntityCard key={c.id} compound={c} />)}</section>
    {rows.length > visible.length && <div className="wrap mt-8 text-center"><button className="btn btn-primary" onClick={() => setExpanded(true)}>View the full watchlist</button></div>}
    {rows.length === 0 && <div className="wrap mt-8"><p className="panel p-8 muted">No tracked molecule has this mapped target yet.</p></div>}
    <div className="wrap mt-16 border-t hairline pt-6"><p className="text-sm muted max-w-3xl">Watchlist profiles are informational. Inclusion does not mean a compound is available from OnimaChain or approved for use. Development status varies by indication and jurisdiction; dates and sources are shown with each entry. Conceptual target visuals are not experimental molecular structures.</p></div>
  </div>
}
