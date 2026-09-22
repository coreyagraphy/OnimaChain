import type { Config } from '@netlify/functions'
import { catalog } from './lib/commerce/catalog.ts'
import { failure, json, paymentProviders, requireTestAccess, returnOrigin } from './lib/commerce/config.ts'
import { checkoutPlan, limitedBody } from './lib/commerce/validation.ts'
import { createCheckout } from './lib/commerce/orders.ts'
import { CommerceError } from './lib/commerce/types.ts'

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405)
  try {
    const providers = paymentProviders()
    requireTestAccess(req)
    const origin = returnOrigin()
    if (req.headers.has('origin') && req.headers.get('origin') !== origin) throw new CommerceError(403, 'Unrecognized checkout origin.')
    if (req.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new CommerceError(415, 'Send JSON.')
    let body: unknown
    const raw = await limitedBody(req, 16384)
    try { body = JSON.parse(raw) } catch { throw new CommerceError(400, 'Invalid JSON.') }
    const plan = checkoutPlan(body, req.headers.get('idempotency-key'), catalog, [...providers.keys()], origin)
    const session = await createCheckout(plan, providers.get(plan.provider)!)
    return json({ orderId: plan.orderId, provider: plan.provider, checkoutUrl: session.url, expiresAt: session.expiresAt, mode: 'test' })
  } catch (e) { return failure(e) }
}
export const config: Config = { path: '/api/checkout' }
