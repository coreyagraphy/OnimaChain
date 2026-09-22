import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { BRAND } from '~/brand'
import { COMPOUNDS, COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { FollowButton, PulseCard, SinceLastVisit, isNewSince } from '~/components/Pulse'
import { LANE_META, diversify, timeAgo, useFollows, useLastVisit, usePulse } from '~/pulse/usePulse'
import type { Activity, Lane, PulseEvent } from '~/pulse/types'

export const Route = createFileRoute('/pulse')({
  validateSearch: (s: Record<string, unknown>): { c?: string; tab?: string; e?: string } => ({
    ...(typeof s.e === 'string' ? { e: s.e } : {}),
    ...(typeof s.c === 'string' ? { c: s.c } : {}),
    ...(typeof s.tab === 'string' ? { tab: s.tab } : {}),
  }),
  head: () => ({ meta: [{ title: `PulseChain: what moved in peptides — ${BRAND}` }, { name: 'description', content: 'New research, trial changes, regulatory updates and the conversation around them, tied back to the compounds they’re about.' }] }),
  component: PulsePage,
})

type Tab = 'now' | 'following' | Lane | 'changed' | 'week'
const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'now', label: 'Now' },
  { id: 'following', label: 'Following' },
  { id: 'research', label: 'Research' },
  { id: 'trials', label: 'Trials' },
  { id: 'regulation', label: 'Regulation' },
  { id: 'video', label: 'Video' },
  { id: 'industry', label: 'Industry' },
  { id: 'community', label: 'Community' },
  { id: 'changed', label: 'What changed' },
  { id: 'week', label: 'This week' },
]
const ACT_LABEL: Record<Activity, string> = { none: '—', low: 'Low', medium: 'Medium', high: 'High', rising: 'Rising' }

function PulsePage() {
  const { snap, loading } = usePulse()
  const search = Route.useSearch()
  const [tab, setTab] = useState<Tab>((TABS.some((t) => t.id === search.tab) ? search.tab : 'now') as Tab)
  const [q, setQ] = useState(search.c ? displayName(COMPOUND_BY_SLUG[search.c] ?? COMPOUNDS[0]) : '')
  const events = snap?.events ?? []
  const { follows } = useFollows()
  const last = useLastVisit()
  // a shared link (?e=…) opens with that update pinned and highlighted
  const shared = search.e ? events.find((x) => x.id === search.e) ?? null : null
  useEffect(() => { if (shared) requestAnimationFrame(() => document.getElementById(`e-${shared.id}`)?.scrollIntoView({ block: 'center' })) }, [shared])

  // search resolves names and aliases to compounds, and also matches words in headlines
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return events
    const slugs = COMPOUNDS.filter((c) => displayName(c).toLowerCase().includes(t) || c.name.toLowerCase().includes(t) || c.aliases.some((a) => a.toLowerCase().includes(t))).map((c) => c.slug)
    return events.filter((e) => e.compounds.some((c) => slugs.includes(c)) || e.headline.toLowerCase().includes(t))
  }, [events, q])

  const matched = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return null
    const hits = COMPOUNDS.filter((c) => displayName(c).toLowerCase() === t || c.name.toLowerCase() === t || c.aliases.some((a) => a.toLowerCase() === t) || displayName(c).toLowerCase().startsWith(t))
    return hits.length === 1 ? hits[0].slug : null
  }, [q])

  const shown = useMemo(() => {
    if (tab === 'now') return diversify(filtered).slice(0, 30)
    if (tab === 'following') return filtered.filter((e) => e.compounds.some((c) => follows.includes(c)))
    if (tab === 'changed') return filtered.filter((e) => e.change || e.labels.includes('CORRECTION') || e.labels.includes('CLAIM MOVEMENT'))
    if (tab === 'week') return []
    return filtered.filter((e) => e.lane === tab)
  }, [filtered, tab, follows])

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, t.id === 'now' ? Math.min(30, filtered.length) : t.id === 'following' ? filtered.filter((e) => e.compounds.some((c) => follows.includes(c))).length : t.id === 'week' ? 0 : t.id === 'changed' ? filtered.filter((e) => e.change || e.labels.includes('CORRECTION') || e.labels.includes('CLAIM MOVEMENT')).length : filtered.filter((e) => e.lane === t.id).length])), [filtered, follows])

  return (
    <div className="pt-24 pb-24">
      <header className="wrap">
        <p className="label label-cyan">PulseChain</p>
        <h1 className="display text-[clamp(2.4rem,7vw,5.6rem)] mt-3 leading-[0.95]">What moved<br /><span className="bond-title-accent">in peptides.</span></h1>
        <p className="lede mt-5 max-w-2xl">Why it matters. Where it came from. We pull new papers, trial changes, regulatory news and the conversation around them, fold the copies into one story, and tie each one back to its compound.</p>
        {snap && <p className="mt-4 mono text-[11px] text-bone/50">Updated {timeAgo(snap.generatedAt)} · checks every 2 hours · nothing older than 30 days</p>}
      </header>

      <section className="wrap mt-8 grid gap-4 lg:grid-cols-[1fr_minmax(280px,360px)] items-start">
        <div className="min-w-0">
          <label className="pulse-search">
            <span className="sr-only">Search PulseChain</span>
            <svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a peptide, e.g. BPC-157" enterKeyHint="search" />
            {q && <button onClick={() => setQ('')} aria-label="Clear search">Clear</button>}
          </label>
          {q && <div className="mt-2 flex flex-wrap items-center gap-3"><p className="text-[13px] text-bone/60" role="status">{filtered.length} {filtered.length === 1 ? 'update' : 'updates'} for “{q}”</p>{matched && <FollowButton slug={matched} />}</div>}

          <div className="pulse-tabs mt-4" role="tablist" aria-label="PulseChain sections">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} style={t.id in LANE_META ? ({ '--lane': LANE_META[t.id as Lane].color } as CSSProperties) : undefined}>
                {t.label}{t.id !== 'week' && counts[t.id] > 0 && <span>{counts[t.id]}</span>}
              </button>
            ))}
          </div>

          <div className="mt-5" role="tabpanel">
            {loading && <div className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="pulse-card pulse-skeleton" />)}</div>}
            {!loading && tab === 'week' && <ChainReaction events={filtered} trends={snap?.trends ?? []} />}
            {!loading && tab !== 'week' && (shown.length ? (
              <div className="pulse-list">{(shared && tab === 'now' ? [shared, ...shown.filter((x) => x.id !== shared.id)] : shown).map((e) => <PulseCard key={e.id} e={e} isNew={isNewSince(e, last)} highlight={shared?.id === e.id} />)}</div>
            ) : <EmptyLane tab={tab} runs={snap?.runs ?? []} />)}
          </div>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <SinceLastVisit events={events} />
          <Heatmap trends={snap?.trends ?? []} onPick={(name) => { setQ(name); setTab('now') }} />
          <Sources runs={snap?.runs ?? []} />
        </aside>
      </section>
    </div>
  )
}

function EmptyLane({ tab, runs }: { tab: Tab; runs: Array<{ source: string; ok: boolean; note: string }> }) {
  const off = (name: string) => runs.find((r) => r.source === name && !r.ok)
  if (tab === 'following') return <div className="pulse-empty"><p className="font-semibold">You’re not following any peptides yet.</p><p className="mt-1 text-[14px] text-bone/65">Search for one above and tap Follow. Its updates show up here and first on the home page. No account needed.</p></div>
  const note = tab === 'video' ? off('YouTube')?.note : tab === 'community' ? 'Reddit and TikTok are switched off until licensed access is in place.' : tab === 'industry' ? off('News feeds')?.note : null
  return <div className="pulse-empty"><p className="font-semibold">Nothing here right now.</p><p className="mt-1 text-[14px] text-bone/65">{note ?? 'New items show up here as soon as the next check finds them.'}</p></div>
}

/** The weekly digest: The Chain Reaction. */
function ChainReaction({ events, trends }: { events: PulseEvent[]; trends: Array<{ slug: string; research: Activity; trials: Activity; news: Activity; video: Activity }> }) {
  const week = events.filter((e) => Date.now() - new Date(e.primary.publishedAt).getTime() < 7 * 864e5 || Date.now() - new Date(e.firstSeen).getTime() < 7 * 864e5)
  const top = week.slice(0, 5)
  const changed = week.filter((e) => e.change || e.labels.includes('CORRECTION'))
  const louder = trends.filter((t) => [t.research, t.trials, t.news, t.video].includes('rising'))
  const research = week.filter((e) => e.lane === 'research' && !e.labels.includes('CORRECTION'))
  const kinds = new Map<string, number>()
  for (const e of research) { const k = String(e.primary.facts.studyKind ?? 'unclear'); kinds.set(k, (kinds.get(k) ?? 0) + 1) }
  const KIND: Record<string, string> = { 'human-trial': 'human trials', human: 'studies in people', rats: 'rat studies', mice: 'mouse studies', animals: 'other animal studies', cells: 'lab studies', review: 'reviews', case: 'case reports', unclear: 'other papers' }
  const claims = week.filter((e) => e.primary.sourceClass !== 'primary').sort((a, b) => (b.distinctVoices - a.distinctVoices) || (Number(b.primary.facts.views ?? 0) - Number(a.primary.facts.views ?? 0))).slice(0, 8)
  return (
    <div className="chain-reaction">
      <p className="label label-violet">The Chain Reaction</p>
      <h2 className="display-md text-[clamp(1.6rem,4vw,2.4rem)] mt-2">The week in peptide research, regulation and conversation.</h2>
      <h3 className="cr-h">5 things that mattered</h3>
      <ol className="cr-top">{top.map((e) => <li key={e.id}><PulseCard e={e} compact /></li>)}</ol>
      <h3 className="cr-h">What changed</h3>
      {changed.length ? <ul className="cr-list">{changed.map((e) => <li key={e.id}>{e.summary.whatHappened}</li>)}</ul> : <p className="cr-none">No status changes or corrections this week.</p>}
      <h3 className="cr-h">What got louder</h3>
      {louder.length ? <ul className="cr-list">{louder.map((t) => <li key={t.slug}>{displayName(COMPOUND_BY_SLUG[t.slug])}</li>)}</ul> : <p className="cr-none">Nothing is rising yet. Trends need two weeks of history to compare against.</p>}
      <h3 className="cr-h">What research appeared</h3>
      {research.length ? <p className="cr-list">{research.length} new papers: {[...kinds.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${KIND[k] ?? k}`).join(', ')}.</p> : <p className="cr-none">No new papers this week.</p>}
      <h3 className="cr-h">What’s still just a claim</h3>
      {claims.length ? <ul className="cr-list">{claims.map((e) => <li key={e.id}>{e.headline} <span className="text-bone/50">({e.primary.outlet})</span></li>)}</ul> : <p className="cr-none">Nothing this week from commentary sources. Switch on YouTube and news feeds to fill this in.</p>}
    </div>
  )
}

function Heatmap({ trends, onPick }: { trends: Array<{ slug: string; research: Activity; trials: Activity; news: Activity; video: Activity }>; onPick: (name: string) => void }) {
  const rows = trends.filter((t) => [t.research, t.trials, t.news, t.video].some((a) => a !== 'none')).sort((a, b) => score(b) - score(a)).slice(0, 12)
  return (
    <div className="pulse-heat">
      <p className="label label-cyan">Where the activity is</p>
      <p className="mt-1 text-[12px] text-bone/55">Last 5 weeks. Tap a row to see its updates.</p>
      <div className="pulse-heat-grid" role="table" aria-label="Activity by peptide">
        <div role="row" className="pulse-heat-head"><span role="columnheader">Peptide</span><span role="columnheader">Research</span><span role="columnheader">Trials</span><span role="columnheader">Talk</span></div>
        {rows.map((t) => {
          const name = displayName(COMPOUND_BY_SLUG[t.slug])
          const talk = rankAct(t.news) >= rankAct(t.video) ? t.news : t.video
          return (
            <button role="row" key={t.slug} onClick={() => onPick(name)}>
              <span role="rowheader">{name}</span>
              {[t.research, t.trials, talk].map((a, i) => <span role="cell" key={i}><i className="heat" data-a={a}>{ACT_LABEL[a]}</i></span>)}
            </button>
          )
        })}
        {!rows.length && <p className="p-3 text-[13px] text-bone/60">No activity yet.</p>}
      </div>
    </div>
  )
}
const rankAct = (a: Activity) => ({ none: 0, low: 1, medium: 2, high: 3, rising: 4 }[a])
const score = (t: { research: Activity; trials: Activity; news: Activity; video: Activity }) => rankAct(t.research) + rankAct(t.trials) + rankAct(t.news) + rankAct(t.video)

function Sources({ runs }: { runs: Array<{ source: string; ok: boolean; items: number; note: string }> }) {
  return (
    <details className="pulse-sources">
      <summary>Where this comes from</summary>
      <ul>{runs.map((r) => <li key={r.source}><span className="dot" data-on={r.ok ? '1' : undefined} />{r.source}<small>{r.note}</small></li>)}</ul>
      <p className="mt-3 text-[12px] text-bone/55">Original sources rank above news, news above commentary, commentary above community posts. Copies of the same story are counted, not repeated. <Link to="/methodology" className="underline">How we work</Link></p>
    </details>
  )
}
