import test from 'node:test'
import assert from 'node:assert/strict'
import Stripe from 'stripe'
import { checkoutPlan, fingerprint, limitedBody } from '../netlify/functions/lib/commerce/validation.ts'
import { stripeProvider } from '../netlify/functions/lib/commerce/stripe.ts'
import { nextOrderStatus, validatePayment } from '../netlify/functions/lib/commerce/orders.ts'
import { requireTestAccess, returnOrigin } from '../netlify/functions/lib/commerce/config.ts'
import checkout from '../netlify/functions/checkout.mts'
import webhook from '../netlify/functions/payment-stripe-webhook.mts'
import type { PaymentEvent } from '../netlify/functions/lib/commerce/types.ts'

const id = '734df0ea-aa74-4ae1-a62b-aa92c0ffd770'
const origin = 'https://example.com'
const products = { 'test-item': { name: 'Test item (not for sale)', unitAmount: 1250, enabled: true } }
const cart = { provider: 'stripe', items: [{ sku: 'test-item', quantity: 2 }] }
const plan = () => checkoutPlan(cart, id, products, ['stripe'], origin)
const secret = 'whsec_unit_test_only'
const adapter = stripeProvider('sk_test_unit_test_only', secret)
function notification(type: string, overrides: Record<string, unknown> = {}, live = false) {
  const raw = JSON.stringify({ id: 'evt_test', type, livemode: live, data: { object: { id: 'cs_test_1', payment_status: 'paid', amount_total: 2500, currency: 'usd', metadata: { orderId: id, integration: 'onimachain-commerce-v1' }, ...overrides } } })
  const signature = Stripe.webhooks.generateTestHeaderString({ payload: raw, secret })
  return { raw, headers: new Headers({ 'stripe-signature': signature }) }
}
function event(type: string, overrides: Record<string, unknown> = {}) {
  const n = notification(type, overrides)
  return adapter.verifyEvent(n.raw, n.headers)
}

test('server catalog determines totals; canonical line ordering is stable', () => {
  assert.equal(plan().total, 2500)
  assert.equal(plan().currency, 'usd')
  assert.equal(fingerprint(plan()), fingerprint(plan()))
  const two = { ...products, other: { name: 'Other', unitAmount: 100, enabled: true } }
  const items = [...cart.items, { sku: 'other', quantity: 1 }]
  const a = checkoutPlan({ provider: 'stripe', items }, id, two, ['stripe'], origin)
  const b = checkoutPlan({ provider: 'stripe', items: [...items].reverse() }, id, two, ['stripe'], origin)
  assert.equal(fingerprint(a), fingerprint(b))
})
test('client prices, totals and redirect URLs are rejected', () => {
  for (const injected of [{ total: 1 }, { returnOrigin: 'https://evil.example' }]) assert.throws(() => checkoutPlan({ ...cart, ...injected }, id, products, ['stripe'], origin))
  assert.throws(() => checkoutPlan({ ...cart, items: [{ ...cart.items[0], unitAmount: 1 }] }, id, products, ['stripe'], origin))
})
test('unknown/disabled SKUs, unknown providers and missing retry keys fail closed', () => {
  assert.throws(() => checkoutPlan(cart, id, {}, ['stripe'], origin))
  assert.throws(() => checkoutPlan(cart, id, { 'test-item': { ...products['test-item'], enabled: false } }, ['stripe'], origin))
  assert.throws(() => checkoutPlan({ ...cart, provider: 'paypal' }, id, products, ['stripe'], origin))
  assert.throws(() => checkoutPlan(cart, null, products, ['stripe'], origin))
})
test('cart limits reject fractions, negative quantities, duplicates and excessive totals', () => {
  for (const quantity of [0, -1, 1.5, 11, '2', null]) assert.throws(() => checkoutPlan({ ...cart, items: [{ sku: 'test-item', quantity }] }, id, products, ['stripe'], origin))
  assert.throws(() => checkoutPlan({ ...cart, items: [...cart.items, ...cart.items] }, id, products, ['stripe'], origin))
  assert.throws(() => checkoutPlan(cart, id, { 'test-item': { ...products['test-item'], unitAmount: 1000000 } }, ['stripe'], origin))
})
test('request body size is enforced while reading, not just from Content-Length', async () => {
  await assert.rejects(limitedBody(new Request(origin, { method: 'POST', body: '123456' }), 5))
  assert.equal(await limitedBody(new Request(origin, { method: 'POST', body: '12345' }), 5), '12345')
})
test('Stripe signature required; tampering and stale signatures rejected', () => {
  const n = notification('checkout.session.completed')
  assert.throws(() => adapter.verifyEvent(n.raw, new Headers()))
  assert.throws(() => adapter.verifyEvent(n.raw + ' ', n.headers))
  const stale = Stripe.webhooks.generateTestHeaderString({ payload: n.raw, secret, timestamp: 1 })
  assert.throws(() => adapter.verifyEvent(n.raw, new Headers({ 'stripe-signature': stale })))
  assert.equal(adapter.verifyEvent(n.raw, n.headers)?.status, 'paid')
})
test('live keys and live notifications are rejected', () => {
  assert.throws(() => stripeProvider('sk_live_never_allowed', secret))
  const n = notification('checkout.session.completed', {}, true)
  assert.throws(() => adapter.verifyEvent(n.raw, n.headers))
})
test('completed but unpaid sessions never mark an order paid', () => {
  assert.equal(event('checkout.session.completed', { payment_status: 'unpaid' }), null)
  assert.equal(event('checkout.session.async_payment_succeeded')?.status, 'paid')
  assert.equal(event('checkout.session.async_payment_failed', { payment_status: 'unpaid' })?.status, 'failed')
  assert.equal(event('checkout.session.expired', { payment_status: 'unpaid' })?.status, 'expired')
})
test('other integrations and irrelevant Stripe events are ignored', () => {
  assert.equal(event('payment_intent.succeeded'), null)
  assert.equal(event('checkout.session.completed', { metadata: {} }), null)
})
test('payment amount, currency, processor and session must match', () => {
  const order = { provider: 'stripe', session_id: 'cs_test_1', total: 2500, currency: 'usd' }
  const paid = event('checkout.session.completed')!
  validatePayment(order, paid)
  for (const change of [{ amount: 1 }, { currency: 'eur' }, { provider: 'other' }, { sessionId: 'cs_other' }]) assert.throws(() => validatePayment(order, { ...paid, ...change } as PaymentEvent))
})
test('paid state cannot be downgraded by out-of-order failure or expiration', () => {
  assert.equal(nextOrderStatus('paid', 'failed'), 'paid')
  assert.equal(nextOrderStatus('paid', 'expired'), 'paid')
  assert.equal(nextOrderStatus('failed', 'paid'), 'paid')
})
test('Stripe session request uses server prices, fixed redirects and stable idempotency', async () => {
  let called = 0
  const client = new Stripe('sk_test_unit_test_only', { httpClient: Stripe.createFetchHttpClient(async (_url, init) => {
    called++
    const data = new URLSearchParams(String(init?.body))
    assert.equal(data.get('line_items[0][price_data][unit_amount]'), '1250')
    assert.equal(data.get('line_items[0][quantity]'), '2')
    assert.equal(data.get('success_url'), `${origin}/explore?checkout=returned`)
    assert.equal(new Headers(init?.headers).get('idempotency-key'), `onimachain:test:${id}`)
    return new Response(JSON.stringify({ id: 'cs_test_mock', url: 'https://checkout.stripe.com/test', expires_at: 2000000000, livemode: false }), { headers: { 'content-type': 'application/json' } })
  }) })
  const result = await stripeProvider('sk_test_unit_test_only', secret, client).createSession(plan())
  assert.equal(called, 1)
  assert.equal(result.id, 'cs_test_mock')
})
test('test gate and redirect-origin validation fail closed', () => {
  const oldToken = process.env.COMMERCE_TEST_TOKEN, oldOrigin = process.env.COMMERCE_SITE_ORIGIN
  try {
    process.env.COMMERCE_TEST_TOKEN = 'x'.repeat(40)
    assert.throws(() => requireTestAccess(new Request(origin)))
    requireTestAccess(new Request(origin, { headers: { authorization: `Bearer ${'x'.repeat(40)}` } }))
    for (const bad of ['https://example.com/path', 'http://example.com', 'https://user:pass@example.com']) { process.env.COMMERCE_SITE_ORIGIN = bad; assert.throws(returnOrigin) }
    process.env.COMMERCE_SITE_ORIGIN = origin
    assert.equal(returnOrigin(), origin)
  } finally {
    if (oldToken === undefined) delete process.env.COMMERCE_TEST_TOKEN; else process.env.COMMERCE_TEST_TOKEN = oldToken
    if (oldOrigin === undefined) delete process.env.COMMERCE_SITE_ORIGIN; else process.env.COMMERCE_SITE_ORIGIN = oldOrigin
  }
})
test('unconfigured endpoints reject checkout and webhook requests without network calls', async () => {
  const old = process.env.PAYMENTS_MODE
  try {
    delete process.env.PAYMENTS_MODE
    assert.equal((await checkout(new Request(origin, { method: 'POST' }))).status, 503)
    assert.equal((await webhook(new Request(origin, { method: 'POST' }))).status, 503)
    assert.equal((await checkout(new Request(origin))).status, 405)
  } finally { if (old === undefined) delete process.env.PAYMENTS_MODE; else process.env.PAYMENTS_MODE = old }
})
