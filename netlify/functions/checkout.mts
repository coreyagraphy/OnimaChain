import type { Config } from '@netlify/functions'

/** Retired at the server boundary: no request can create an order. */
export default async () => new Response(JSON.stringify({ error: 'Ordering is not available on this educational site.' }), {
  status: 410,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
})
export const config: Config = { path: '/api/checkout' }
