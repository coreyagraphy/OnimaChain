import type { Config } from '@netlify/functions'

/* Public automatic feed retired while source-level editorial review is incomplete. */
export default async () => {
  return new Response(JSON.stringify({ error: 'The public live feed is retired. Explore the sourced Research Time Machine instead.', destination: '/observatory?station=history' }), { status: 410, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}

export const config: Config = { path: '/api/pulse' }
