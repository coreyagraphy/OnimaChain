import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

/* GET /api/pulse — the latest PulseChain snapshot (public events only; the review queue never leaves the server). */
export default async () => {
  const snap = await getStore('pulse').get('latest', { type: 'json' }).catch(() => null) as { review?: unknown } | null
  if (!snap) return new Response(JSON.stringify({ error: 'no snapshot yet' }), { status: 404, headers: { 'content-type': 'application/json' } })
  const { review: _r, ...pub } = snap
  void _r
  return new Response(JSON.stringify(pub), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' } })
}

export const config: Config = { path: '/api/pulse' }
