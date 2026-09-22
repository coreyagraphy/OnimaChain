// Explicit opt-in only. Requires an already-migrated dedicated TEST database.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import { createCheckout, recordPayment } from '../netlify/functions/lib/commerce/orders.ts'
import type { CheckoutPlan, PaymentEvent, PaymentProvider } from '../netlify/functions/lib/commerce/types.ts'

const url = process.env.COMMERCE_TEST_DATABASE_URL
if (!url) throw new Error('Set COMMERCE_TEST_DATABASE_URL to a dedicated, migrated test database. No database tests were run.')
process.env.COMMERCE_DATABASE_URL = url
const db = new Pool({ connectionString: url, max: 1 })
const ids = [randomUUID(), randomUUID()]
const plan: CheckoutPlan = { orderId: ids[0], provider: 'fake-integration-test', currency: 'usd', total: 500, returnOrigin: 'https://example.com', lines: [{ sku: 'test-only', name: 'Test only', unitAmount: 500, quantity: 1 }] }
let calls = 0
const provider: PaymentProvider = {
  id: plan.provider,
  async createSession(p) {
    calls++
    // Hold briefly so concurrent requests overlap on the order row lock.
    await new Promise(resolve => setTimeout(resolve, 50))
    return { id: `cs_fake_${p.orderId}`, url: 'https://example.com/test-only', expiresAt: Math.floor(Date.now() / 1000) + 1800 }
  },
  verifyEvent() { return null },
}
try {
  const [a, b] = await Promise.all([createCheckout(plan, provider), createCheckout(plan, provider)])
  assert.deepEqual(a, b)
  assert.equal(calls, 1, 'Concurrent retries must create one session')
  await assert.rejects(createCheckout({ ...plan, total: 1000 }, provider))
  const paid: PaymentEvent = { id: `evt_${randomUUID()}`, provider: plan.provider, orderId: plan.orderId, sessionId: a.id, status: 'paid', amount: 500, currency: 'usd' }
  await assert.rejects(recordPayment({ ...paid, amount: 1 }))
  assert.equal((await db.query('SELECT count(*)::int AS n FROM commerce_payment_events WHERE order_id=$1', [plan.orderId])).rows[0].n, 0, 'Rejected events must roll back')
  const receipts = await Promise.all([recordPayment(paid), recordPayment(paid)])
  assert.equal(receipts.filter(r => r.duplicate).length, 1)
  await recordPayment({ ...paid, id: `evt_${randomUUID()}`, status: 'expired' })
  await recordPayment({ ...paid, id: `evt_${randomUUID()}` })
  assert.equal((await db.query('SELECT status FROM commerce_orders WHERE id=$1', [plan.orderId])).rows[0].status, 'paid')
  assert.equal((await db.query('SELECT count(*)::int AS n FROM commerce_fulfillment_outbox WHERE order_id=$1', [plan.orderId])).rows[0].n, 1)
  await assert.rejects(createCheckout(plan, provider), 'Closed orders cannot open a new session')

  const retryPlan = { ...plan, orderId: ids[1] }
  let failedOnce = false
  const flaky: PaymentProvider = { ...provider, async createSession(p) {
    assert.equal(p.orderId, retryPlan.orderId)
    if (!failedOnce) { failedOnce = true; throw new Error('Simulated processor timeout') }
    return provider.createSession(p)
  } }
  await assert.rejects(createCheckout(retryPlan, flaky))
  assert.equal((await db.query('SELECT count(*)::int AS n FROM commerce_orders WHERE id=$1', [retryPlan.orderId])).rows[0].n, 1, 'Intent survives a processor error')
  await createCheckout(retryPlan, flaky)
  console.log('Payment database checks passed: concurrent retries, cart conflict, mismatch rollback, duplicate events, paid-state protection, unique outbox, timeout retry.')
} finally {
  // Narrow cleanup: only the two random IDs this invocation generated.
  await db.query('DELETE FROM commerce_fulfillment_outbox WHERE order_id=ANY($1::uuid[])', [ids])
  await db.query('DELETE FROM commerce_payment_events WHERE order_id=ANY($1::uuid[])', [ids])
  await db.query('DELETE FROM commerce_orders WHERE id=ANY($1::uuid[])', [ids])
  await db.end()
}
