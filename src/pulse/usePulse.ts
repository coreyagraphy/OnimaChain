import { useEffect, useState } from 'react'
import type { Lane, PulseEvent, PulseSnapshot } from './types'

/*
 * Client access to PulseChain. Live snapshot from the scheduled collector (/api/pulse) first;
 * the snapshot built at deploy time (/pulse.json) if the live one isn't there yet or can't be reached.
 */
let cache: Promise<PulseSnapshot | null> | null = null
function load(): Promise<PulseSnapshot | null> {
  if (!cache) {
    const get = (u: string) => fetch(u, { headers: { accept: 'application/json' } }).then((r) => (r.ok ? (r.json() as Promise<PulseSnapshot>) : Promise.reject(r.status)))
    cache = get('/api/pulse').catch(() => get('/pulse.json')).catch(() => null)
  }
  return cache
}

export function usePulse(): { snap: PulseSnapshot | null; loading: boolean } {
  const [snap, setSnap] = useState<PulseSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { let on = true; load().then((s) => { if (on) { setSnap(s); setLoading(false) } }); return () => { on = false } }, [])
  return { snap, loading }
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
