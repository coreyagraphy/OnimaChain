import { Link } from '@tanstack/react-router'
import { useMemo, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { LANE_META, countSince, dayAgo, timeAgo, useLastVisit, usePulse } from '~/pulse/usePulse'
import type { PulseEvent, SourceClass } from '~/pulse/types'

const CLASS_LABEL: Record<SourceClass, string> = {
  primary: 'Original source', 'verified-reporting': 'News report', commentary: 'Commentary', community: 'Community', unknown: 'Origin unconfirmed',
}

/** One event: what happened, why it matters, where it came from — and the drawer that explains why it surfaced. */
export function PulseCard({ e, compact = false }: { e: PulseEvent; compact?: boolean }) {
  const lane = LANE_META[e.lane]
  return (
    <article className={`pulse-card${compact ? ' pulse-card-compact' : ''}`} style={{ '--lane': lane.color } as CSSProperties}>
      <div className="pulse-card-top">
        <span className="pulse-lane">{lane.label}</span>
        {e.labels.filter((l) => l !== 'NEW RESEARCH' && l !== 'TRIAL UPDATE').slice(0, 2).map((l) => <span key={l} className="pulse-label" data-major={l === 'MAJOR UPDATE' ? '1' : undefined}>{l.toLowerCase()}</span>)}
        <time className="pulse-time" dateTime={e.primary.publishedAt}>{['youtube', 'news', 'reddit', 'tiktok'].includes(e.primary.kind) ? timeAgo(e.primary.publishedAt) : dayAgo(e.primary.publishedAt)}</time>
      </div>
      {e.compounds.length > 0 && (
        <div className="pulse-compounds">{e.compounds.slice(0, 3).map((c) => COMPOUND_BY_SLUG[c] && <Link key={c} to="/compound/$slug" params={{ slug: c }} className="pulse-chip">{displayName(COMPOUND_BY_SLUG[c])}</Link>)}</div>
      )}
      <h3 className="pulse-headline">{e.summary.whatHappened}</h3>
      {e.change && <p className="pulse-change"><span>{e.change.before}</span><i aria-hidden>→</i><b>{e.change.after}</b></p>}
      {!compact && <p className="pulse-why-matters"><b>Why it matters:</b> {e.summary.whyItMatters}</p>}
      {!compact && e.summary.whatItDoesNotShow && <p className="pulse-not"><b>Keep in mind:</b> {e.summary.whatItDoesNotShow}</p>}
      {e.conflict && <p className="pulse-conflict">{e.conflict}</p>}
      <div className="pulse-source">
        <span className="pulse-class" data-class={e.primary.sourceClass}>{CLASS_LABEL[e.primary.sourceClass]}</span>
        <span className="pulse-outlet">{e.primary.outlet}</span>
        {e.mentions.length > 0 && <span className="pulse-echo">+{e.mentions.length} more {e.mentions.length === 1 ? 'mention' : 'mentions'}</span>}
      </div>
      <div className="pulse-actions">
        <a className="pulse-read" href={e.primary.url} target="_blank" rel="noreferrer noopener">Read the source <span aria-hidden>→</span></a>
        <details className="pulse-drawer">
          <summary>Why am I seeing this?</summary>
          <ul>{e.why.map((w) => <li key={w}>{w}</li>)}</ul>
          <p className="pulse-method"><b>How we summarized this:</b> {e.summary.method}</p>
        </details>
      </div>
    </article>
  )
}

/** Home + compound pages: a swipeable row of the most significant events. */
export function PulseStream({ compound, limit = 10 }: { compound?: string; limit?: number }) {
  const { snap, loading } = usePulse()
  const events = useMemo(() => (snap?.events ?? []).filter((e) => !compound || e.compounds.includes(compound)).slice(0, limit), [snap, compound, limit])
  if (loading) return <div className="pulse-rail" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="pulse-card pulse-skeleton" />)}</div>
  if (!events.length) return <p className="text-[14px] text-bone/60">Nothing new in the last few weeks. The feed checks every 4 hours.</p>
  return <div className="pulse-rail" role="list">{events.map((e) => <div role="listitem" key={e.id} className="pulse-rail-item"><PulseCard e={e} compact /></div>)}</div>
}

/** "Since your last visit" counters. */
export function SinceLastVisit({ events }: { events: PulseEvent[] }) {
  const last = useLastVisit()
  const c = countSince(events, last)
  const rows: Array<[number, string, string]> = [
    [c.research, c.research === 1 ? 'new research paper' : 'new research papers', LANE_META.research.color],
    [c.trials, c.trials === 1 ? 'trial update' : 'trial updates', LANE_META.trials.color],
    [c.regulation, c.regulation === 1 ? 'regulatory update' : 'regulatory updates', LANE_META.regulation.color],
    [c.claims, c.claims === 1 ? 'claim gaining attention' : 'claims gaining attention', LANE_META.community.color],
    [c.video, c.video === 1 ? 'new video discussion' : 'new video discussions', LANE_META.video.color],
    [c.corrections, c.corrections === 1 ? 'correction' : 'corrections', '#F2EEE6'],
  ]
  return (
    <div className="pulse-since">
      <p className="label label-cyan">{last ? 'Since your last visit' : 'In the last 7 days'}</p>
      <ul>{rows.filter(([n]) => n > 0).map(([n, t, color]) => <li key={t} style={{ '--c': color } as CSSProperties}><b>{n}</b> {t}</li>)}{c.total === 0 && <li>Nothing new yet. Check back soon.</li>}</ul>
    </div>
  )
}
