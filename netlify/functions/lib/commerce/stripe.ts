import Stripe from 'stripe'
import { CommerceError, type CheckoutPlan, type PaymentEvent, type PaymentProvider } from './types.ts'
import { isUuid } from './validation.ts'

export function stripeProvider(secret: string, webhookSecret: string, testClient?: Stripe): PaymentProvider {
  // Hard stop: live payments are outside this pre-launch scaffold.
  if (!secret.startsWith('sk_test_') || !webhookSecret.startsWith('whsec_')) throw new CommerceError(503, 'Stripe test configuration is incomplete.')
  const stripe = testClient ?? new Stripe(secret, { maxNetworkRetries: 1, timeout: 8000 })
  return {
    id: 'stripe',
    async createSession(plan: CheckoutPlan) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: plan.orderId,
        metadata: { orderId: plan.orderId, integration: 'onimachain-commerce-v1' },
        payment_method_types: ['card'],
        line_items: plan.lines.map(l => ({ quantity: l.quantity, price_data: { currency: plan.currency, unit_amount: l.unitAmount, product_data: { name: l.name, metadata: { sku: l.sku } } } })),
        success_url: `${plan.returnOrigin}/explore?checkout=returned`,
        cancel_url: `${plan.returnOrigin}/explore?checkout=cancelled`,
      }, { idempotencyKey: `onimachain:test:${plan.orderId}` })
      if (!session.url || session.livemode) throw new CommerceError(502, 'Could not open a test payment session.')
      return { id: session.id, url: session.url, expiresAt: session.expires_at }
    },
    verifyEvent(rawBody: string, headers: Headers): PaymentEvent | null {
      let event: Stripe.Event
      try { event = stripe.webhooks.constructEvent(rawBody, headers.get('stripe-signature') ?? '', webhookSecret) }
      catch { throw new CommerceError(400, 'Invalid payment notification signature.') }
      if (event.livemode) throw new CommerceError(400, 'Live payment notifications are not accepted.')
      if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'].includes(event.type)) return null
      const s = event.data.object as Stripe.Checkout.Session
      const metadata = s.metadata
      // Accept the former identifier for test sessions created before the brand lock.
      if (!metadata || !['onimachain-commerce-v1', 'ominachain-commerce-v1', 'cyravon-commerce-v1'].includes(metadata.integration ?? '')) return null
      const orderId = metadata.orderId
      if (!isUuid(orderId)) throw new CommerceError(400, 'Invalid order reference.')
      // A completed browser flow is not proof of payment (delayed methods may still be pending).
      if (event.type === 'checkout.session.completed' && s.payment_status !== 'paid') return null
      const status = event.type === 'checkout.session.expired' ? 'expired' : event.type === 'checkout.session.async_payment_failed' ? 'failed' : 'paid'
      if (status === 'paid' && s.payment_status !== 'paid') throw new CommerceError(400, 'Payment is not settled.')
      return { id: event.id, provider: 'stripe', orderId, sessionId: s.id, status, amount: s.amount_total, currency: s.currency }
    },
  }
}
