import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import { applyDecision, queueView, tokenOk, type Decisions, type ReviewAction } from '../../src/pulse/review.ts'
import type { PulseSnapshot } from '../../src/pulse/types.ts'

/*
 * /api/pulse-review — the review queue. Every request needs `Authorization: Bearer <PULSE_ADMIN_TOKEN>`.
 *   GET                               → waiting / decided / live lists + last run health
 *   POST { id, action, note? }        → approve | reject | pull | restore | note
 *   POST { action: "run" }            → start a collection run now (background function)
 */
const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
const ACTIONS: ReviewAction[] = ['approve', 'reject', 'pull', 'restore', 'note']

export default async (req: Request) => {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!tokenOk(token, process.env.PULSE_ADMIN_TOKEN)) return json({ error: 'Wrong or missing review key' }, 401)
  const store = getStore('pulse')
  const snap = (await store.get('latest', { type: 'json' }).catch(() => null)) as PulseSnapshot | null
  let decisions = ((await store.get('decisions', { type: 'json' }).catch(() => null)) ?? {}) as Decisions

  if (req.method === 'POST') {
    const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string; note?: string }
    if (body.action === 'run') {
      const key = process.env.PULSE_SECRET || ''
      if (!key || !process.env.URL) return json({ started: false, reason: 'Collector trigger is not configured.' }, 503)
      const r = await fetch(`${process.env.URL}/.netlify/functions/pulse-run-background`, { method: 'POST', headers: { 'x-pulse-key': key } }).catch(() => null)
      return json({ started: r?.status === 202 })
    }
    if (!body.id || !ACTIONS.includes(body.action as ReviewAction)) return json({ error: 'Need an item id and an action' }, 400)
    const known = snap && [...snap.events, ...snap.review].some((e) => e.id === body.id)
    if (!known) return json({ error: 'That item is no longer in the feed' }, 404)
    decisions = applyDecision(decisions, body.id, body.action as ReviewAction, typeof body.note === 'string' ? body.note.slice(0, 400) : undefined)
    await store.setJSON('decisions', decisions)
  } else if (req.method !== 'GET') return json({ error: 'GET or POST' }, 405)

  if (!snap) return json({ generatedAt: null, runs: [], waiting: [], decided: [], live: [] })
  return json(queueView(snap, decisions))
}

export const config: Config = { path: '/api/pulse-review' }
