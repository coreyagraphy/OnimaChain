import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import { publicView, type Decisions } from '../../src/pulse/review.ts'
import type { PulseSnapshot } from '../../src/pulse/types.ts'

/* GET /api/pulse — the latest snapshot with reviewer decisions applied. The review queue never leaves the server. */
export default async () => {
  const store = getStore('pulse')
  const snap = (await store.get('latest', { type: 'json' }).catch(() => null)) as PulseSnapshot | null
  if (!snap) return new Response(JSON.stringify({ error: 'no snapshot yet' }), { status: 404, headers: { 'content-type': 'application/json' } })
  const decisions = ((await store.get('decisions', { type: 'json' }).catch(() => null)) ?? {}) as Decisions
  return new Response(JSON.stringify(publicView(snap, decisions)), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=120, stale-while-revalidate=3600' } })
}

export const config: Config = { path: '/api/pulse' }
