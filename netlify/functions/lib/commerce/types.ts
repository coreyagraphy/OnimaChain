export interface Product { name: string; unitAmount: number; enabled: boolean }
export type Catalog = Readonly<Record<string, Product>>
export interface Line { sku: string; name: string; quantity: number; unitAmount: number }
export interface CheckoutPlan {
  orderId: string
  provider: string
  currency: string
  total: number
  lines: Line[]
  returnOrigin: string
}
export interface PaymentSession { id: string; url: string; expiresAt: number }
export interface PaymentEvent {
  id: string
  provider: string
  orderId: string
  sessionId: string
  status: 'paid' | 'failed' | 'expired'
  amount: number | null
  currency: string | null
}
/** Processor-specific SDK types never leave an adapter. */
export interface PaymentProvider {
  id: string
  createSession(plan: CheckoutPlan): Promise<PaymentSession>
  verifyEvent(rawBody: string, headers: Headers): PaymentEvent | null
}
export class CommerceError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}
