import { getStore } from '@netlify/blobs'
import { runAndStore } from './lib/pulse-run.mts'

/*
 * Background function: up to 15 minutes, so every source can be polled politely (PubMed asks for ≤3 requests a second).
 * Only the scheduler (or someone holding the key) can start it.
 */
export default async (req: Request) => {
  const key = process.env.PULSE_SECRET || ''
  if (!key || req.headers.get('x-pulse-key') !== key) return new Response('forbidden', { status: 403 })
  await runAndStore(getStore('pulse'))
}
