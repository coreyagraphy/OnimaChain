import { Link } from '@tanstack/react-router'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { LANE_META, countSince, dayAgo, diversify, shareEvent, timeAgo, useFollows, useLastVisit, usePulse } from '~/pulse/usePulse'
import type { PulseEvent, SourceClass } from '~/pulse/types'

const CLASS_LABEL: Record<SourceClass, string> = {
  primary: 'Original source', 'verified-reporting': 'News report', commentary: 'Commentary', community: 'Community', unknown: 'Origin unconfirmed',
}
const views = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K` : String(n))

/** One event: what happened, why it matters, where it came from — and the drawer that explains why it surfaced. */
export function PulseCard({ e, compact = false, isNew = false, highlight = false, footer }: { e: PulseEvent; compact?: boolean; isNew?: boolean; highlight?: boolean; footer?: ReactNode }) {
  const lane = LANE_META[e.lane]
  const [shared, setShared] = useState<string | null>(null)
  const thumb = e.primary.kind === 'youtube' ? String(e.primary.facts.thumb ?? '') : ''
  const share = async () => { const r = await shareEvent(e); setShared(r === 'copied' ? 'Link copied' : r === 'failed' ? 'Couldn’t share' : null); if (r !== 'shared') setTimeout(() => setShared(null), 2200) }
  return (
    <article id={`e-${e.id}`} className={`pulse-card${compact ? ' pulse-card-compact' : ''}${highlight ? ' pulse-card-hl' : ''}`} style={{ '--lane': lane.color } as CSSProperties}>
      <div className="pulse-card-top">
        <span className="pulse-lane">{lane.label}</span>
        {isNew && <span className="pulse-new">New</span>}
        {e.labels.filter((l) => l !== 'NEW RESEARCH' && l !== 'TRIAL UPDATE').slice(0, 2).map((l) => <span key={l} className="pulse-label" data-major={l === 'MAJOR UPDATE' ? '1' : undefined}>{l.toLowerCase()}</span>)}
        <time className="pulse-time" dateTime={e.primary.publishedAt}>{['youtube', 'news', 'reddit', 'tiktok'].includes(e.primary.kind) ? timeAgo(e.primary.publishedAt) : dayAgo(e.primary.publishedAt)}</time>
      </div>
      {thumb && (
        <a className="pulse-thumb" href={e.primary.url} target="_blank" rel="noreferrer noopener" aria-label={`Watch on YouTube: ${e.primary.title}`}>
          <img src={thumb} alt="" loading="lazy" decoding="async" width={320} height={180} />
          <span className="pulse-play" aria-hidden />
          {Number(e.primary.facts.views) > 0 && <span className="pulse-views">{views(Number(e.primary.facts.views))} views</span>}
        </a>
      )}
      {e.compounds.length > 0 && (
        <div className="pulse-compounds">{e.compounds.slice(0, 3).map((c) => COMPOUND_BY_SLUG[c] && <Link key={c} to="/compound/$slug" params={{ slug: c }} className="pulse-chip">{displayName(COMPOUND_BY_SLUG[c])}</Link>)}</div>
      )}
      <h3 className="pulse-headline">{e.summary.whatHappened}</h3>
      {e.change && <p className="pulse-change"><span>{e.change.before}</span><i aria-hidden>→</i><b>{e.change.after}</b></p>}
      {e.reviewed?.note && <p className="pulse-note"><b>Editor’s note:</b> {e.reviewed.note}</p>}
      {!compact && <p className="pulse-why-matters"><b>Why it matters:</b> {e.summary.whyItMatters}</p>}
      {!compact && e.summary.whatItDoesNotShow && <p className="pulse-not"><b>Keep in mind:</b> {e.summary.whatItDoesNotShow}</p>}
      {e.conflict && <p className="pulse-conflict">{e.conflict}</p>}
      <div className="pulse-source">
        <span className="pulse-class" data-class={e.primary.sourceClass}>{CLASS_LABEL[e.primary.sourceClass]}</span>
        {e.reviewed?.action === 'approve' && <span className="pulse-checked">Checked by our team</span>}
        <span className="pulse-outlet">{e.primary.outlet}</span>
        {e.mentions.length > 0 && <span className="pulse-echo">+{e.mentions.length} more {e.mentions.length === 1 ? 'mention' : 'mentions'}</span>}
      </div>
      <div className="pulse-actions">
        <div className="pulse-actions-row">
          <a className="pulse-read" href={e.primary.url} target="_blank" rel="noreferrer noopener">{e.primary.kind === 'youtube' ? 'Watch on YouTube' : e.primary.kind === 'trials' ? 'See the trial' : 'Read the source'} <span aria-hidden>→</span></a>
          <button className="pulse-share" onClick={share} aria-label="Share this update">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></svg>
            <span>{shared ?? 'Share'}</span>
          </button>
        </div>
        <details className="pulse-drawer">
          <summary>Why am I seeing this?</summary>
          <ul>{e.why.map((w) => <li key={w}>{w}</li>)}</ul>
          <p className="pulse-method"><b>How we summarized this:</b> {e.summary.method}</p>
        </details>
      </div>
      {footer}
    </article>
  )
}

/** Home + compound pages: a swipeable row of the most significant events (followed peptides first on the home page). */
export function PulseStream({ compound, limit = 10 }: { compound?: string; limit?: number }) {
  const { snap, loading } = usePulse()
  const { follows } = useFollows()
  const last = useLastVisit()
  const events = useMemo(() => {
    const all = diversify((snap?.events ?? []).filter((e) => !compound || e.compounds.includes(compound)))
    if (compound || !follows.length) return all.slice(0, limit)
    const mine = all.filter((e) => e.compounds.some((c) => follows.includes(c)))
    return [...mine.slice(0, Math.ceil(limit / 2)), ...all.filter((e) => !mine.slice(0, Math.ceil(limit / 2)).includes(e))].slice(0, limit)
  }, [snap, compound, limit, follows])
  if (loading) return <div className="pulse-rail" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="pulse-card pulse-skeleton" />)}</div>
  if (!events.length) return <p className="wrap text-[14px] text-bone/60">Nothing new in the last few weeks. The feed checks every 4 hours.</p>
  return <div className="pulse-rail" role="list">{events.map((e) => <div role="listitem" key={e.id} className="pulse-rail-item"><PulseCard e={e} compact isNew={isNewSince(e, last)} /></div>)}</div>
}

export function isNewSince(e: PulseEvent, last: string | null): boolean {
  return !!last && new Date(e.firstSeen).getTime() > new Date(last).getTime()
}

/** Follow / unfollow a peptide's pulse. */
export function FollowButton({ slug }: { slug: string }) {
  const { isFollowing, toggle } = useFollows()
  const on = isFollowing(slug)
  const name = COMPOUND_BY_SLUG[slug] ? displayName(COMPOUND_BY_SLUG[slug]) : slug
  return (
    <button className="pulse-follow" aria-pressed={on} onClick={() => toggle(slug)}>
      <svg viewBox="0 0 24 24" aria-hidden><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>
      {on ? `Following ${name}` : `Follow ${name}`}
    </button>
  )
}

/** "Since your last visit" counters. */
export function SinceLastVisit({ events }: { events: PulseEvent[] }) {
  const last = useLastVisit()
  const { follows } = useFollows()
  const c = countSince(events, last)
  const from = last ? new Date(last).getTime() : Date.now() - 7 * 864e5
  const mine = follows.length ? events.filter((e) => e.compounds.some((x) => follows.includes(x)) && new Date(e.firstSeen).getTime() > from).length : 0
  const rows: Array<[number, string, string]> = [
    [mine, mine === 1 ? 'about peptides you follow' : 'about peptides you follow', '#FFC46B'],
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
