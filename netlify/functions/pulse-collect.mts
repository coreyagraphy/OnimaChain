import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import { runAndStore } from './lib/pulse-run.mts'

/*
 * Every 4 hours. Hands the work to the background function (15-minute limit); if background functions
 * aren't available on this plan, runs inline instead (scheduled functions get 30 seconds).
 */
export default async () => {
  const base = process.env.URL
  const key = process.env.PULSE_SECRET || process.env.SITE_ID || ''
  if (base && key) {
    const r = await fetch(`${base}/.netlify/functions/pulse-run-background`, { method: 'POST', headers: { 'x-pulse-key': key } }).catch(() => null)
    if (r?.status === 202) return
  }
  await runAndStore(getStore('pulse'))
}

export const config: Config = { schedule: '0 */4 * * *' }
