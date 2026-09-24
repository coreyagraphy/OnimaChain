import type { Config } from '@netlify/functions'

/** Historical review data is retained in storage, but the live-feed service is retired. */
export default async () => new Response(JSON.stringify({ error: 'Automated feed review is paused pending editorial review.' }), {
  status: 410,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
})

export const config: Config = { path: '/api/pulse-review' }
