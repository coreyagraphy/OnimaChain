/*
 * PulseChain data model.
 *
 * The unit is the EVENT, not the article. Many source items (a paper, the press write-ups, the videos about it)
 * can point at one event. The feed shows events; the mentions are counted, never shown as separate "news".
 */

/** Where a source sits in the evidence hierarchy. Never merged into one "news" bucket. */
export type SourceClass = 'primary' | 'verified-reporting' | 'commentary' | 'community' | 'unknown'

/** What kind of adapter produced the item. */
export type SourceKind = 'pubmed' | 'trials' | 'fda' | 'news' | 'youtube' | 'reddit' | 'tiktok'

/** Plain labels instead of a fake 0–100 score. */
export type Label =
  | 'MAJOR UPDATE'
  | 'NEW RESEARCH'
  | 'TRIAL UPDATE'
  | 'REGULATORY'
  | 'CLAIM MOVEMENT'
  | 'TRENDING DISCUSSION'
  | 'OLD RESEARCH TRENDING AGAIN'
  | 'EARLY SIGNAL'
  | 'COMMENTARY'
  | 'CORRECTION'

/** Feed lanes on /pulse. */
export type Lane = 'research' | 'trials' | 'regulation' | 'video' | 'community' | 'industry'

export type PublishTier = 'auto' | 'auto-labeled' | 'review' | 'hold'

/** One thing one source published. */
export interface SourceItem {
  /** Stable identity: pmid:…, nct:…, url:…, yt:… — the dedupe key. */
  key: string
  kind: SourceKind
  sourceClass: SourceClass
  /** Publisher / channel / journal / agency. */
  outlet: string
  title: string
  url: string
  /** ISO date the source says it was published or updated. */
  publishedAt: string
  /** Short text from the source itself (abstract start, description, RSS summary). Summaries may only use this + title. */
  snippet: string
  /** Extra structured facts the adapter pulled out (phase, status, pub types, species, views). */
  facts: Record<string, string | number | boolean | string[]>
}

export interface Summary {
  whatHappened: string
  whyItMatters: string
  whatItDoesNotShow: string | null
  /** How this summary was made, shown in the drawer. */
  method: string
}

export interface PulseEvent {
  id: string
  lane: Lane
  labels: Label[]
  headline: string
  compounds: string[]
  /** The best source for the event (highest class). */
  primary: SourceItem
  /** Every other item that points at the same event (write-ups, videos, reposts). */
  mentions: SourceItem[]
  /** Distinct outlets/channels among the mentions. */
  distinctVoices: number
  /** One voice making most of the noise. */
  concentrated: boolean
  /** Looks like an ad, coupon or affiliate post. */
  promotional: boolean
  /** A commentary headline says something the primary record doesn't support (e.g. "FDA approved X"). */
  conflict: string | null
  /** A change against the previous run, e.g. "Recruiting → Completed". */
  change: { before: string | null; after: string } | null
  summary: Summary
  /** "Why you're seeing this". */
  why: string[]
  tier: PublishTier
  firstSeen: string
  updatedAt: string
}

export type Activity = 'none' | 'low' | 'medium' | 'high' | 'rising'

export interface CompoundTrend {
  slug: string
  research: Activity
  trials: Activity
  news: Activity
  video: Activity
  /** Mentions in the last 7 days vs. the 4 weeks before (per-week average). */
  velocity: { last7: number; weeklyBaseline: number }
}

export interface AdapterRun {
  source: string
  ok: boolean
  items: number
  note: string
  ms: number
}

export interface PulseSnapshot {
  version: 1
  generatedAt: string
  runs: AdapterRun[]
  events: PulseEvent[]
  /** Held back from the public feed until someone looks at them. */
  review: PulseEvent[]
  trends: CompoundTrend[]
  /** Last known trial status per NCT id, so the next run can report changes. */
  trialStatus: Record<string, string>
  /** When the engine first ran; trends need two weeks of history before anything is called "rising". */
  startedAt: string
  /** How many runs have happened (YouTube rotates through compounds by run). */
  runCount: number
}
