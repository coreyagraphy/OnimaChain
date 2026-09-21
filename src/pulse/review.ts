import type { PulseEvent, PulseSnapshot } from './types.ts'

/*
 * The review queue. The engine holds back what it shouldn't publish on its own (a loud claim that conflicts
 * with the regulatory record, an item it couldn't tie to anything). A person decides:
 *
 *   approve  → goes into the public feed, marked "Checked by our team"
 *   reject   → stays out for good, even if the next run finds it again
 *   pull     → takes something that auto-published back out of the feed
 *   restore  → undoes reject / pull
 *   note     → adds an editor's note shown on the card (works on anything)
 *
 * Decisions live next to the snapshot (Blobs key "decisions") and are applied every time the feed is read,
 * so they take effect immediately and survive every future collection run.
 */
export type ReviewAction = 'approve' | 'reject' | 'pull' | 'restore' | 'note'
export interface Decision { action: Exclude<ReviewAction, 'note' | 'restore'> | null; note?: string; at: string }
export type Decisions = Record<string, Decision>

export type ReviewedEvent = PulseEvent

export function applyDecision(all: Decisions, id: string, action: ReviewAction, note: string | undefined, now = new Date()): Decisions {
  const prev = all[id]
  const at = now.toISOString()
  const next = { ...all }
  if (action === 'note') next[id] = { action: prev?.action ?? null, note: note?.trim() || undefined, at }
  else if (action === 'restore') next[id] = { action: null, note: prev?.note, at }
  else next[id] = { action, note: note?.trim() || prev?.note, at }
  if (!next[id].action && !next[id].note) delete next[id]
  return next
}

/** The public feed after human decisions. */
export function publicView(snap: PulseSnapshot, d: Decisions): PulseSnapshot {
  const mark = (e: PulseEvent): ReviewedEvent => (d[e.id] ? { ...e, reviewed: { action: d[e.id].action, note: d[e.id].note, at: d[e.id].at } } : e)
  const approved = snap.review.filter((e) => d[e.id]?.action === 'approve').map((e) => ({ ...mark(e), tier: 'auto-labeled' as const }))
  const events = [...snap.events.filter((e) => d[e.id]?.action !== 'pull' && d[e.id]?.action !== 'reject').map(mark), ...approved]
  return { ...snap, events, review: [] }
}

export interface QueueView {
  generatedAt: string
  runs: PulseSnapshot['runs']
  /** Held by the engine, nobody has decided yet. */
  waiting: ReviewedEvent[]
  /** Everything a person has acted on. */
  decided: ReviewedEvent[]
  /** What's public right now (so things can be pulled). */
  live: ReviewedEvent[]
}

export function queueView(snap: PulseSnapshot, d: Decisions): QueueView {
  const mark = (e: PulseEvent): ReviewedEvent => (d[e.id] ? { ...e, reviewed: { action: d[e.id].action, note: d[e.id].note, at: d[e.id].at } } : e)
  const all = [...snap.review, ...snap.events]
  return {
    generatedAt: snap.generatedAt,
    runs: snap.runs,
    waiting: snap.review.filter((e) => !d[e.id]?.action).map(mark),
    decided: all.filter((e) => d[e.id]).map(mark).sort((a, b) => (b.reviewed?.at ?? '').localeCompare(a.reviewed?.at ?? '')),
    live: snap.events.filter((e) => d[e.id]?.action !== 'pull' && d[e.id]?.action !== 'reject').slice(0, 60).map(mark),
  }
}

/** Constant-time token check. */
export function tokenOk(given: string | null, expected: string | undefined): boolean {
  if (!expected || !given) return false
  const a = new TextEncoder().encode(given), b = new TextEncoder().encode(expected)
  let diff = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}
