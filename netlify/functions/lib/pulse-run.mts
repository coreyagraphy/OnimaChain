import { collect } from '../../../src/pulse/pipeline.ts'
import type { PulseSnapshot } from '../../../src/pulse/types.ts'

interface Store { get(key: string, o: { type: 'json' }): Promise<unknown>; setJSON(key: string, v: unknown): Promise<unknown> }

/** One collection run: read the last snapshot, poll every source, store the new one (plus a dated copy for history). */
export async function runAndStore(store: Store): Promise<PulseSnapshot> {
  const prev = (await store.get('latest', { type: 'json' }).catch(() => null)) as PulseSnapshot | null
  const snap = await collect(prev, {
    youtubeKey: process.env.YOUTUBE_API_KEY,
    ncbiKey: process.env.NCBI_API_KEY,
    newsFeeds: (process.env.PULSE_NEWS_FEEDS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  })
  await store.setJSON('latest', snap)
  await store.setJSON(`runs/${snap.generatedAt.slice(0, 13)}`, { generatedAt: snap.generatedAt, runs: snap.runs, events: snap.events.length, review: snap.review.length })
  return snap
}
