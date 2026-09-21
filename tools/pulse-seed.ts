/*
 * Build-time PulseChain snapshot. Runs the same pipeline as the scheduled Netlify function and writes
 * public/pulse.json, which ships with the site: the feed has real content on day one and still works
 * if the live /api/pulse endpoint is unreachable. Never fails the build — on any error the previous seed stays.
 *   node --experimental-strip-types tools/pulse-seed.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { collect } from '../src/pulse/pipeline.ts'
import type { PulseSnapshot } from '../src/pulse/types.ts'

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/pulse.json')
let prev: PulseSnapshot | null = null
try { prev = JSON.parse(readFileSync(out, 'utf8')) } catch { /* first run */ }
try {
  const snap = await collect(prev, {
    youtubeKey: process.env.YOUTUBE_API_KEY,
    ncbiKey: process.env.NCBI_API_KEY,
    newsFeeds: (process.env.PULSE_NEWS_FEEDS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  })
  // the review queue stays out of the shipped bundle
  writeFileSync(out, JSON.stringify({ ...snap, review: [] }))
  console.log(`pulse-seed: ${snap.events.length} events (${snap.review.length} held) · ${snap.runs.map((r) => `${r.source} ${r.ok ? r.items : 'off'}`).join(' · ')}`)
} catch (e) {
  console.warn('pulse-seed: kept previous snapshot —', String(e).slice(0, 200))
}
