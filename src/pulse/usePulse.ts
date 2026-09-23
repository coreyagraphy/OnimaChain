import { useEffect, useState } from 'react'
import { diversify, isFresh } from './fresh'
import type { Lane, PulseEvent, PulseSnapshot } from './types'

/*
 * Client access to PulseChain. Live snapshot from the scheduled collector (/api/pulse) first;
 * the snapshot built at deploy time (/pulse.json) if the live one isn't there yet or can't be reached.
 */
/** Every open page re-checks while it's visible, so the feed keeps moving without a reload. */
const REFRESH_MS = 5 * 60 * 1000
let current: PulseSnapshot | null = null
let loaded = false
let inflight: Promise<void> | null = null
let timer: ReturnType<typeof setInterval> | null = null
const subs = new Set<() => void>()

/** Old items never reach the screen, even from a cached or fallback copy. */
function clean(s: PulseSnapshot | null): PulseSnapshot | null {
  return s ? { ...s, events: (s.events ?? []).filter((e) => isFresh(e)) } : null
}
function fetchSnap(): Promise<void> {
  if (inflight) return inflight
  const get = (u: string) => fetch(u, { headers: { accept: 'application/json' }, cache: 'no-cache' }).then((r) => (r.ok ? (r.json() as Promise<PulseSnapshot>) : Promise.reject(r.status)))
  inflight = get('/api/pulse').catch(() => get('/pulse.json')).catch(() => null)
    .then((s) => { if (s && (!current || s.generatedAt !== current.generatedAt)) { current = clean(s); subs.forEach((f) => f()) } else if (!loaded) subs.forEach((f) => f()) ; loaded = true })
    .finally(() => { inflight = null })
  return inflight
}
function startPolling() {
  if (timer || typeof window === 'undefined') return
  timer = setInterval(() => { if (document.visibilityState === 'visible') fetchSnap() }, REFRESH_MS)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fetchSnap() })
}

export function usePulse(): { snap: PulseSnapshot | null; loading: boolean } {
  const [, force] = useState(0)
  useEffect(() => {
    const f = () => force((n) => n + 1)
    subs.add(f)
    if (!loaded) fetchSnap()
    startPolling()
    return () => { subs.delete(f) }
  }, [])
  return { snap: current, loading: !loaded }
}

/* ── "Since your last visit" ── */
const VISIT_KEY = 'pulse-last-visit'
/** The previous visit time, read once per page view; the stored time moves to "now" for next time. */
export function useLastVisit(): string | null {
  const [last, setLast] = useState<string | null>(null)
  useEffect(() => {
    try {
      const prev = localStorage.getItem(VISIT_KEY)
      setLast(prev)
      // only move the marker after they've had a moment with the page, so a quick reload doesn't zero the counts
      const t = setTimeout(() => { try { localStorage.setItem(VISIT_KEY, new Date().toISOString()) } catch { /* private mode */ } }, 8000)
      return () => clearTimeout(t)
    } catch { return undefined }
  }, [])
  return last
}

export interface SinceCounts { research: number; trials: number; regulation: number; video: number; corrections: number; claims: number; total: number }
export function countSince(events: PulseEvent[], since: string | null): SinceCounts {
  const from = since ? new Date(since).getTime() : Date.now() - 7 * 864e5
  const fresh = events.filter((e) => new Date(e.firstSeen).getTime() > from || new Date(e.updatedAt).getTime() > from)
  const lane = (l: Lane) => fresh.filter((e) => e.lane === l).length
  return {
    research: fresh.filter((e) => e.lane === 'research' && !e.labels.includes('CORRECTION')).length,
    trials: lane('trials'), regulation: lane('regulation') + fresh.filter((e) => e.lane !== 'regulation' && e.labels.includes('REGULATORY')).length,
    video: lane('video'), corrections: fresh.filter((e) => e.labels.includes('CORRECTION')).length,
    claims: fresh.filter((e) => e.labels.includes('CLAIM MOVEMENT') || e.labels.includes('TRENDING DISCUSSION')).length,
    total: fresh.length,
  }
}

export const LANE_META: Record<Lane, { label: string; color: string }> = {
  research: { label: 'Research', color: '#5FE3FF' },
  trials: { label: 'Trials', color: '#6EF2A6' },
  regulation: { label: 'Regulation', color: '#FFC46B' },
  video: { label: 'Video', color: '#C6A8FF' },
  industry: { label: 'Industry', color: '#6F8BFF' },
  community: { label: 'Community', color: '#FF6FC8' },
}

/** Papers, trials and FDA posts carry a date but no time, so they read as Today / Yesterday / date. */
export function dayAgo(iso: string): string {
  const d = new Date(iso), t = new Date()
  const days = Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())) / 864e5)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return days < 7 ? `${days} days ago` : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  const d = Math.round(s / 86400)
  return d < 30 ? `${d} day${d > 1 ? 's' : ''} ago` : new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/* ── Follow a peptide (no account: kept on this device) ── */
const FOLLOW_KEY = 'pulse-follow'
const followListeners = new Set<() => void>()
function readFollows(): string[] { try { const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
export function useFollows(): { follows: string[]; toggle: (slug: string) => void; isFollowing: (slug: string) => boolean } {
  const [follows, setFollows] = useState<string[]>([])
  useEffect(() => {
    const sync = () => setFollows(readFollows())
    sync()
    followListeners.add(sync)
    window.addEventListener('storage', sync)
    return () => { followListeners.delete(sync); window.removeEventListener('storage', sync) }
  }, [])
  const toggle = (slug: string) => {
    const cur = readFollows()
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
    try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(next)) } catch { /* private mode */ }
    followListeners.forEach((f) => f())
  }
  return { follows, toggle, isFollowing: (slug) => follows.includes(slug) }
}

/** Share an update: the phone's own share sheet when there is one, otherwise copy the link. */
export async function shareEvent(e: PulseEvent): Promise<'shared' | 'copied' | 'failed'> {
  const url = `${location.origin}/pulse?e=${encodeURIComponent(e.id)}`
  const title = e.headline.length > 90 ? e.headline.slice(0, 87) + '…' : e.headline
  if (navigator.share) {
    try { await navigator.share({ title, text: e.summary.whyItMatters, url }); return 'shared' }
    catch (err) { if ((err as Error)?.name === 'AbortError') return 'shared' /* they closed the sheet */ }
  }
  try { await navigator.clipboard.writeText(url); return 'copied' } catch { return 'failed' }
}

/** Mix research, trials, regulation and video instead of repeating one lane back to back. */
export { diversify }
