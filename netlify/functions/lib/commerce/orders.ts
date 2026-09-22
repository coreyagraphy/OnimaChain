import { Pool } from 'pg'
import type { PoolClient } from 'pg'
import { CommerceError, type CheckoutPlan, type PaymentEvent, type PaymentProvider, type PaymentSession } from './types.ts'
import { fingerprint } from './validation.ts'

let pool: Pool | undefined
function database() {
  const url = process.env.COMMERCE_DATABASE_URL
  if (!url) throw new CommerceError(503, 'Order storage is not configured.')
  // Use a pooled TLS connection string supplied by the database host. Never disable certificate validation.
  return pool ??= new Pool({ connectionString: url, max: 2, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, statement_timeout: 25000 })
}
async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await database().connect()
  try { await client.query('BEGIN'); const result = await run(client); await client.query('COMMIT'); return result }
  catch (e) { await client.query('ROLLBACK'); throw e }
  finally { client.release() }
}

export async function createCheckout(plan: CheckoutPlan, provider: PaymentProvider): Promise<PaymentSession> {
  const hash = fingerprint(plan)
  // Persist BEFORE calling the processor: a timeout/restart must retain the same intent and idempotency key.
  await database().query('INSERT INTO commerce_orders (id, provider, fingerprint, plan, total, currency) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [plan.orderId, provider.id, hash, JSON.stringify(plan), plan.total, plan.currency])
  return transaction(async client => {
    const { rows: [order] } = await client.query('SELECT * FROM commerce_orders WHERE id=$1 FOR UPDATE', [plan.orderId])
    if (order.fingerprint !== hash || order.provider !== provider.id) throw new CommerceError(409, 'This checkout key belongs to a different cart.')
    if (order.status !== 'pending') throw new CommerceError(409, 'This checkout is already closed.')
    if (order.session) {
      if (order.session.expiresAt * 1000 <= Date.now()) throw new CommerceError(409, 'Checkout expired. Start a new checkout.')
      return order.session as PaymentSession
    }
    // Stripe may prune idempotency keys after 24h; never recreate an uncertain old charge intent.
    if (Date.now() - new Date(order.created_at).getTime() > 20 * 3600_000) throw new CommerceError(409, 'Checkout needs review before retrying.')
    const session = await provider.createSession(order.plan as CheckoutPlan)
    await client.query('UPDATE commerce_orders SET session=$2, session_id=$3 WHERE id=$1', [plan.orderId, JSON.stringify(session), session.id])
    return session
  })
}

export function validatePayment(order: { provider: string; session_id: string | null; total: number; currency: string }, event: PaymentEvent) {
  if (order.provider !== event.provider || !order.session_id || order.session_id !== event.sessionId) throw new CommerceError(409, 'Payment session does not match the order.')
  if (event.status === 'paid' && (order.total !== event.amount || order.currency !== event.currency)) throw new CommerceError(409, 'Payment amount does not match the order.')
}

export const nextOrderStatus = (current: string, incoming: PaymentEvent['status']) => current === 'paid' ? 'paid' : incoming

export async function recordPayment(event: PaymentEvent) {
  return transaction(async client => {
    const { rows: [order] } = await client.query('SELECT * FROM commerce_orders WHERE id=$1 FOR UPDATE', [event.orderId])
    if (!order) throw new CommerceError(503, 'Order is not available yet. Retry notification.')
    validatePayment(order, event)
    const recorded = await client.query('INSERT INTO commerce_payment_events (provider, event_id, order_id, status) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING event_id', [event.provider, event.id, event.orderId, event.status])
    if (!recorded.rowCount) return { duplicate: true }
    // Never downgrade a paid order when an older/duplicate failure arrives.
    await client.query('UPDATE commerce_orders SET status=$2, updated_at=now() WHERE id=$1', [event.orderId, nextOrderStatus(order.status, event.status)])
    if (event.status === 'paid') {
      // Durable, deduplicated handoff. No shipping/email side effects inside a webhook.
      await client.query('INSERT INTO commerce_fulfillment_outbox (order_id) VALUES ($1) ON CONFLICT DO NOTHING', [event.orderId])
    }
    return { duplicate: false }
  })
}
