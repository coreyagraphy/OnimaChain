import type { Config } from '@netlify/functions'

/** No payment provider is connected to Site A. Preserve historical records separately. */
export default async () => new Response(JSON.stringify({ error: 'Payment processing is retired on this educational site.' }), {
  status: 410,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
})
export const config: Config = { path: '/api/payments/stripe/webhook' }
