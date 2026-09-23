import type { PulseEvent } from './types.ts'

/** Nothing in PulseChain is older than this, by the date the source itself gives. Enforced when collecting, when serving, and in the browser. */
export const MAX_AGE_DAYS = 30
export function isFresh(e: Pick<PulseEvent, 'primary'>, now = Date.now()): boolean {
  const t = new Date(e.primary.publishedAt).getTime()
  return Number.isFinite(t) && now - t <= MAX_AGE_DAYS * 864e5
}

/** Keep ranked order while alternating feed lanes whenever another lane is available. */
export function diversify(events: PulseEvent[], maxRun = 1): PulseEvent[] {
  const pool = [...events], out: PulseEvent[] = []
  while (pool.length) {
    const tail = out.slice(-maxRun)
    const blocked = tail.length === maxRun && tail.every((x) => x.lane === tail[0].lane) ? tail[0].lane : null
    const i = blocked ? pool.findIndex((x) => x.lane !== blocked) : 0
    out.push(pool.splice(i === -1 ? 0 : i, 1)[0])
  }
  return out
}
