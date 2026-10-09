import type { Config } from '@netlify/functions'
import { publicOperator } from '../../src/operator'

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

function settings() {
  const operator = process.env.EDITORIAL_OPERATOR_NAME?.trim() || publicOperator.name
  const inbox = process.env.EDITORIAL_CONTACT_EMAIL?.trim() || publicOperator.email
  const sender = process.env.EDITORIAL_FROM_EMAIL?.trim() ?? ''
  const key = process.env.RESEND_API_KEY?.trim() ?? ''
  const tested = process.env.EDITORIAL_DELIVERY_VERIFIED === 'true'
  return { operator, inbox, sender, key, ready: Boolean(operator && inbox && sender && key && tested) }
}

/** Fail-closed editorial intake. No user submission is accepted until actual delivery was tested. */
export default async (request: Request) => {
  const config = settings()
  if (request.method === 'GET') return json({ ready: config.ready, ...(config.operator && config.inbox ? { operator: config.operator, email: config.inbox } : {}) })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  if (!config.ready) return json({ error: 'Editorial intake has not been configured and delivery-tested.' }, 503)
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Unrecognized origin.' }, 403)
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return json({ error: 'Send JSON.' }, 415)
  const raw = await request.text()
  if (raw.length > 12000) return json({ error: 'Message too large.' }, 413)
  let body: Record<string, unknown>
  try { body = JSON.parse(raw) as Record<string, unknown> } catch { return json({ error: 'Invalid JSON.' }, 400) }
  if (typeof body.website === 'string' && body.website.trim()) return json({ accepted: true }) // honeypot
  const page = typeof body.page === 'string' ? body.page.trim() : ''
  const statement = typeof body.statement === 'string' ? body.statement.trim() : ''
  const source = typeof body.source === 'string' ? body.source.trim() : ''
  const reply = typeof body.reply === 'string' ? body.reply.trim() : ''
  if (!/^\/[\w\-./?#=&%]{0,250}$/.test(page) || statement.length < 10 || statement.length > 4000) return json({ error: 'Add a site page and a description between 10 and 4,000 characters.' }, 400)
  if (source && (!/^https:\/\/[^\s]+$/.test(source) || source.length > 500)) return json({ error: 'Source must be an HTTPS URL.' }, 400)
  if (reply && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply) || reply.length > 200)) return json({ error: 'Reply email is invalid.' }, 400)
  const text = `OnimaChain editorial submission\n\nPage: ${page}\nStatement or correction: ${statement}\nSource: ${source || 'not supplied'}\nReply email: ${reply || 'not supplied'}\n\nDo not use this form for medical records or treatment questions.`
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${config.key}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: config.sender, to: [config.inbox], subject: 'OnimaChain editorial submission', text, ...(reply ? { reply_to: reply } : {}) }) })
  if (!response.ok) return json({ error: 'Delivery failed. Please try again later.' }, 502)
  return json({ accepted: true }, 202)
}

export const config: Config = { path: '/api/editorial' }
