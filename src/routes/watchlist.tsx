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
  const [developer, setDeveloper] = useState('ALL')
  const [stage, setStage] = useState('ALL')
  const [recentFirst, setRecentFirst] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const developers = [...new Set(WATCHLIST.map((c) => c.developer).filter((value): value is string => !!value))].sort()
  const stages = [...new Set(WATCHLIST.map((c) => c.stage).filter((value): value is string => !!value))].sort()
  const rows = useMemo(() => WATCHLIST.filter((c) => (target === 'ALL' || c.targets.includes(target)) && (developer === 'ALL' || c.developer === developer) && (stage === 'ALL' || c.stage === stage)).sort((a, b) => recentFirst ? (b.statusAsOf ?? '').localeCompare(a.statusAsOf ?? '') : 0), [target, developer, stage, recentFirst])
  const visible = expanded ? rows : rows.slice(0, 8)
  return <div className="pt-28 pb-24 research-world">
    <header className="wrap research-hero"><p className="label label-cyan">Molecular intelligence / emerging research</p><h1 className="display research-heading">What researchers are <span>watching next.</span></h1><p className="lede max-w-3xl mt-6">These compounds aren't necessarily available through OnimaChain. They're here because the research around them is moving and worth following.</p><div className="research-hero-rule" /><p className="mono text-xs text-bone/55">{WATCHLIST.length} tracked molecules · none listed for sale · each development label links to a dated source</p></header>
    <section className="wrap mt-12" aria-label="Watchlist filters"><p className="label">Find by target, developer, or research stage</p><div className="flex flex-wrap gap-3 mt-3"><select aria-label="Receptor" className="research-select" value={target} onChange={(e) => { setTarget(e.target.value as TargetId | 'ALL'); setExpanded(false) }}><option value="ALL">All targets</option>{TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select><select aria-label="Developer" className="research-select" value={developer} onChange={(e) => { setDeveloper(e.target.value); setExpanded(false) }}><option value="ALL">All developers</option>{developers.map((name) => <option key={name}>{name}</option>)}</select><select aria-label="Research stage" className="research-select" value={stage} onChange={(e) => { setStage(e.target.value); setExpanded(false) }}><option value="ALL">All stages</option>{stages.map((name) => <option key={name}>{name}</option>)}</select><button className="btn btn-sm" aria-pressed={recentFirst} onClick={() => setRecentFirst((value) => !value)}>Newest status date {recentFirst ? '✓' : '↓'}</button><Link to="/targets" className="btn btn-sm">Open target map →</Link></div></section>
    <section className="wrap research-card-grid mt-8">{visible.map((c) => <ResearchEntityCard key={c.id} compound={c} />)}</section>
    {rows.length > visible.length && <div className="wrap mt-8 text-center"><button className="btn btn-primary" onClick={() => setExpanded(true)}>View the full watchlist</button></div>}
    {rows.length === 0 && <div className="wrap mt-8"><p className="panel p-8 muted">No tracked molecule has this mapped target yet.</p></div>}
    <div className="wrap mt-16 border-t hairline pt-6"><p className="text-sm muted max-w-3xl">Watchlist profiles are informational. Inclusion does not mean a compound is available from OnimaChain or approved for use. Development status varies by indication and jurisdiction; dates and sources are shown with each entry. Conceptual target visuals are not experimental molecular structures.</p></div>
  </div>
}
