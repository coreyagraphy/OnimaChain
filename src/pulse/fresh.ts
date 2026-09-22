import type { PulseEvent } from './types.ts'

/** Nothing in PulseChain is older than this, by the date the source itself gives. Enforced when collecting, when serving, and in the browser. */
export const MAX_AGE_DAYS = 30
export function isFresh(e: Pick<PulseEvent, 'primary'>, now = Date.now()): boolean {
  const t = new Date(e.primary.publishedAt).getTime()
  return Number.isFinite(t) && now - t <= MAX_AGE_DAYS * 864e5
}
