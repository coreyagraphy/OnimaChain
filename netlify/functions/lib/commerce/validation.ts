import { createHash } from 'node:crypto'
import { CommerceError, type Catalog, type CheckoutPlan } from './types.ts'

export const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

export function checkoutPlan(body: unknown, id: string | null, products: Catalog, providers: string[], origin: string): CheckoutPlan {
  if (!isUuid(id)) throw new CommerceError(400, 'Send a UUID v4 Idempotency-Key.')
  if (!record(body) || Object.keys(body).some(k => !['provider', 'items'].includes(k))) throw new CommerceError(400, 'Send only a provider and cart items.')
  if (typeof body.provider !== 'string' || !providers.includes(body.provider)) throw new CommerceError(400, 'Payment provider is not available.')
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) throw new CommerceError(400, 'Cart must have 1–30 items.')
  const seen = new Set<string>()
  const lines = body.items.map(item => {
    if (!record(item) || Object.keys(item).some(k => !['sku', 'quantity'].includes(k)) || typeof item.sku !== 'string' || !/^[a-z0-9-]{1,80}$/.test(item.sku) || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 10) throw new CommerceError(400, 'Invalid cart item.')
    if (seen.has(item.sku)) throw new CommerceError(400, 'Combine duplicate cart items.')
    seen.add(item.sku)
    const p = Object.hasOwn(products, item.sku) ? products[item.sku] : undefined
    if (!p?.enabled || !Number.isSafeInteger(p.unitAmount) || p.unitAmount < 1) throw new CommerceError(400, 'An item is not available for checkout.')
    return { sku: item.sku, name: p.name, unitAmount: p.unitAmount, quantity: Number(item.quantity) }
  }).sort((a, b) => a.sku.localeCompare(b.sku))
  const total = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0)
  if (!Number.isSafeInteger(total) || total > 1_000_000) throw new CommerceError(400, 'Cart total is outside the supported range.')
  return { orderId: id.toLowerCase(), provider: body.provider, currency: 'usd', total, lines, returnOrigin: origin }
}

export const fingerprint = (plan: CheckoutPlan) => createHash('sha256').update(JSON.stringify(plan)).digest('hex')

export async function limitedBody(req: Request, maxBytes: number): Promise<string> {
  if (!req.body) return ''
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) { await reader.cancel(); throw new CommerceError(413, 'Request is too large.') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  return Buffer.concat(chunks).toString('utf8')
}
