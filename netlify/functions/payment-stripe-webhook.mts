import type { Config } from '@netlify/functions'
import { failure, json, paymentProviders } from './lib/commerce/config.ts'
import { limitedBody } from './lib/commerce/validation.ts'
import { recordPayment } from './lib/commerce/orders.ts'

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405)
  try {
    const stripe = paymentProviders().get('stripe')
    if (!stripe) return json({ error: 'Stripe is not enabled.' }, 503)
    const event = stripe.verifyEvent(await limitedBody(req, 262144), req.headers)
    if (!event) return json({ received: true, ignored: true })
    return json({ received: true, ...await recordPayment(event) })
  } catch (e) { return failure(e) }
}
export const config: Config = { path: '/api/payments/stripe/webhook' }
