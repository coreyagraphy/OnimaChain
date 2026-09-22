import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import { runAndStore } from './lib/pulse-run.mts'

/*
 * Every 2 hours. Hands the work to the background function (15-minute limit); if background functions
 * aren't available on this plan, runs inline instead (scheduled functions get 30 seconds).
 */
export default async () => {
  const base = process.env.URL
  const key = process.env.PULSE_SECRET || ''
  if (base && key) {
    const r = await fetch(`${base}/.netlify/functions/pulse-run-background`, { method: 'POST', headers: { 'x-pulse-key': key } }).catch(() => null)
    if (r?.status === 202) return
  }
  await runAndStore(getStore('pulse'))
}

export const config: Config = { schedule: '0 */2 * * *' }
