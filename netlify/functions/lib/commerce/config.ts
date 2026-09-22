import { timingSafeEqual } from 'node:crypto'
import { CommerceError, type PaymentProvider } from './types.ts'
import { stripeProvider } from './stripe.ts'

export function paymentProviders(): Map<string, PaymentProvider> {
  if (process.env.PAYMENTS_MODE !== 'test') throw new CommerceError(503, 'Online payments are not enabled.')
  if (!process.env.COMMERCE_DATABASE_URL) throw new CommerceError(503, 'Order storage is not configured.')
  // Register future approved adapters here; disabled providers need no credentials.
  // Never fail over to a second processor after an uncertain response from the first.
  const factories: Record<string, () => PaymentProvider> = {
    stripe: () => stripeProvider(process.env.STRIPE_SECRET_KEY ?? '', process.env.STRIPE_WEBHOOK_SECRET ?? ''),
  }
  const enabled = [...new Set((process.env.PAYMENT_PROVIDERS ?? 'stripe').split(',').map(s => s.trim()).filter(Boolean))]
  if (!enabled.length || enabled.some(id => !Object.hasOwn(factories, id))) throw new CommerceError(503, 'Payment provider configuration is incomplete.')
  return new Map(enabled.map(id => [id, factories[id]()]))
}
export function requireTestAccess(req: Request) {
  const expected = process.env.COMMERCE_TEST_TOKEN ?? ''
  const supplied = req.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  const a = Buffer.from(expected), b = Buffer.from(supplied)
  if (a.length < 32 || a.length !== b.length || !timingSafeEqual(a, b)) throw new CommerceError(401, 'Test checkout access required.')
}
export function returnOrigin() {
  const origin = process.env.COMMERCE_SITE_ORIGIN ?? ''
  let u: URL
  try { u = new URL(origin) } catch { throw new CommerceError(503, 'Checkout return address is not configured.') }
  if (u.origin !== origin || (u.protocol !== 'https:' && !(u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname)))) throw new CommerceError(503, 'Checkout return address must be a trusted origin.')
  return u.origin
}
export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } })
}
export function failure(error: unknown) {
  // Do not log keys, card details, database URLs, raw webhook bodies, or customer data.
  if (error instanceof CommerceError) return json({ error: error.message }, error.status)
  return json({ error: 'Payment service is temporarily unavailable. Retry with the same checkout key.' }, 503)
}
