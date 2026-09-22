import { COMPOUNDS } from '../data/compounds.ts'
import { MARKET_TERMS, fda, news, pubmed, reddit, termsFor, tiktok, trials, youtube, type AdapterEnv, type AdapterResult } from './adapters.ts'
import { MAX_AGE_DAYS } from './fresh.ts'
import type { Activity, CompoundTrend, Label, Lane, PulseEvent, PulseSnapshot, SourceItem, Summary } from './types.ts'

/*
 * DISCOVER → NORMALIZE → DEDUPLICATE → LINK TO COMPOUNDS → CLASSIFY → SIGNIFICANCE → DELTA → SUMMARIZE → PUBLISH/REVIEW
 *
 * Deduplicate first, summarize second. Summaries are fixed templates filled only from the stored source record
 * (title, outlet, date, first lines, structured facts) — nothing is invented and no AI rewrites them.
 */

const NAME_BY_SLUG = Object.fromEntries(COMPOUNDS.map((c) => [c.slug, c.slug === 'retatrutide' ? 'GLP3 (retatrutide)' : (c.displayName ?? c.name)]))
/** In the U.S., only these catalog compounds have an FDA-approved use (used to catch "FDA approved X" headlines). */
const FDA_APPROVED = new Set(['semaglutide', 'tirzepatide', 'tesamorelin', 'pt-141'])
const FEATURED = new Set(['bpc-157', 'tb-500', 'ghk-cu', 'mots-c', 'pt-141', 'semaglutide', 'semax', 'epitalon', 'retatrutide', 'tirzepatide'])
/** Events leave the feed once their source date is older than MAX_AGE_DAYS. */
const KEEP_DAYS = MAX_AGE_DAYS
const DAY = 864e5

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const MATCHERS = COMPOUNDS.filter((c) => c.slug !== 'wolverine-blend').map((c) => ({
  slug: c.slug,
  re: new RegExp(`(^|[^a-z0-9])(${[...termsFor(c), c.displayName ?? c.name].map((t) => escape(t).replace(/[-\s]+/g, '[-\\s]?')).join('|')})(?![a-z0-9])`, 'i'),
}))
MATCHERS.push({ slug: 'wolverine-blend', re: /wolverine (?:blend|stack|peptide)/i })
// "p21" alone is a gene name; only the peptide's own names count
MATCHERS.find((m) => m.slug === 'p21')!.re = /(^|[^a-z0-9])(P021|P21 peptide|peptide 021)(?![a-z0-9])/i

/** Which catalog compounds a piece of text names. */
export function mentions(text: string): string[] {
  return MATCHERS.filter((m) => m.re.test(text)).map((m) => m.slug)
}

const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3))
function jaccard(a: string, b: string): number {
  const A = words(a), B = words(b)
  if (!A.size || !B.size) return 0
  let n = 0
  for (const w of A) if (B.has(w)) n++
  return n / (A.size + B.size - n)
}
const CLASS_RANK = { primary: 4, 'verified-reporting': 3, commentary: 2, community: 1, unknown: 0 } as const
const PROMO = /discount code|promo code|use code|coupon|% off|affiliate|link in bio|sponsored/i
const names = (slugs: string[]) => {
  const n = slugs.map((s) => NAME_BY_SLUG[s] ?? s)
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}
const phaseLabel = (p: string[]) => (p.length ? p.map((x) => x.replace('PHASE', 'Phase ').replace('EARLY_Phase 1', 'Early phase 1').replace('NA', 'Not phased')).join('/') : 'Unphased')
const statusLabel = (s: string) => s.toLowerCase().replace(/_/g, ' ').replace(/^./, (x) => x.toUpperCase())

/** Run every adapter, then fold the results into the previous snapshot. */
export async function collect(prev: PulseSnapshot | null, opts: { youtubeKey?: string; newsFeeds?: string[]; ncbiKey?: string; now?: Date; youtubePerRun?: number } = {}): Promise<PulseSnapshot> {
  const now = opts.now ?? new Date()
  const env: AdapterEnv = { ...opts, runCount: prev?.runCount ?? 0, now }
  const timed = async (f: () => Promise<AdapterResult>) => { const t = Date.now(); const r = await f(); return { r, ms: Date.now() - t } }
  const results = await Promise.all([
    timed(() => pubmed(env)), timed(() => trials(env)), timed(() => fda(env, mentions)), timed(() => news(env, mentions)),
    timed(() => youtube(env)), timed(() => reddit()), timed(() => tiktok()),
  ])
  return build(prev, results.flatMap((x) => x.r.items), results.map(({ r, ms }) => ({ source: r.source, ok: r.ok, items: r.items.length, note: r.note, ms })), now)
}

export function build(prev: PulseSnapshot | null, fresh: SourceItem[], runs: PulseSnapshot['runs'], now: Date): PulseSnapshot {
  const nowIso = now.toISOString()
  const cutoff = now.getTime() - KEEP_DAYS * DAY
  const trialStatus: Record<string, string> = { ...(prev?.trialStatus ?? {}) }

  // 1. start from what we already know (so mentions accumulate and "first seen" survives)
  const events = new Map<string, PulseEvent>()
  for (const e of [...(prev?.events ?? []), ...(prev?.review ?? [])]) if (new Date(e.primary.publishedAt).getTime() >= cutoff) events.set(e.id, { ...e, mentions: [...e.mentions] })
  const seenKeys = new Set<string>()
  for (const e of events.values()) { seenKeys.add(e.primary.key); for (const m of e.mentions) seenKeys.add(m.key) }

  // 2. dedupe by identity and attach compounds
  const items = new Map<string, SourceItem & { compounds: string[] }>()
  for (const it of fresh) {
    if (items.has(it.key)) continue
    // too old to be news, whatever the source returned
    if (!(new Date(it.publishedAt).getTime() >= cutoff)) continue
    const linked = new Set(mentions(it.kind === 'youtube' ? `${it.title} ${it.snippet.slice(0, 160)}` : `${it.title} ${it.snippet}`))
    if (typeof it.facts.query === 'string' && it.kind !== 'youtube') linked.add(it.facts.query)
    if (it.kind === 'youtube' && typeof it.facts.query === 'string' && linked.size === 0 && new RegExp(escape(NAME_BY_SLUG[it.facts.query] ?? ''), 'i').test(it.title)) linked.add(it.facts.query)
    items.set(it.key, { ...it, compounds: [...linked] })
  }

  // 3. primary sources: each paper / trial / FDA post is its own event
  for (const it of items.values()) {
    if (it.sourceClass !== 'primary') continue
    const id = it.key
    const old = events.get(id)
    let change: PulseEvent['change'] = old?.change ?? null
    let changedNow = false
    if (it.kind === 'trials') {
      const status = String(it.facts.status)
      const before = trialStatus[String(it.facts.nct)]
      if (before && before !== status) { change = { before: statusLabel(before), after: statusLabel(status) }; changedNow = true }
      trialStatus[String(it.facts.nct)] = status
    }
    events.set(id, finish({
      id, lane: it.kind === 'pubmed' ? 'research' : it.kind === 'trials' ? 'trials' : 'regulation', labels: [], headline: it.title,
      compounds: it.compounds, primary: it, mentions: old?.mentions ?? [], distinctVoices: 0, concentrated: false, promotional: false,
      conflict: null, change, summary: blankSummary, why: [], tier: 'auto', firstSeen: old?.firstSeen ?? nowIso, updatedAt: old && !changedNow ? old.updatedAt : nowIso,
    }, now, prev !== null && !seenKeys.has(id)))
  }

  // 4. secondary sources: fold into the event they are about, or cluster with each other
  const secondary = [...items.values()].filter((it) => it.sourceClass !== 'primary' && !seenKeys.has(it.key))
  for (const it of secondary) {
    const t = new Date(it.publishedAt).getTime()
    let best: PulseEvent | null = null, bestScore = 0
    for (const e of events.values()) {
      if (Math.abs(new Date(e.primary.publishedAt).getTime() - t) > 14 * DAY && e.primary.kind !== 'pubmed') continue
      const shared = e.compounds.some((c) => it.compounds.includes(c))
      if (!shared && it.compounds.length) continue
      const score = Math.max(jaccard(it.title, e.headline), ...e.mentions.map((m) => jaccard(it.title, m.title)))
      // a video/article that names the paper's identifier is the same event, whatever the headline
      const cites = e.primary.kind === 'pubmed' && `${it.snippet} ${(it.facts.links as string[] | undefined ?? []).join(' ')}`.includes(String(e.primary.facts.pmid))
      const s = cites ? 1 : score
      if (s > bestScore) { bestScore = s; best = e }
    }
    if (best && bestScore >= (best.primary.sourceClass === 'primary' ? 0.34 : 0.42)) {
      best.mentions.push(it)
      best.updatedAt = nowIso
      events.set(best.id, finish(best, now, false))
    } else {
      events.set(it.key, finish({
        id: it.key, lane: it.kind === 'youtube' ? 'video' : it.kind === 'news' ? 'industry' : 'community', labels: [], headline: it.title,
        compounds: it.compounds, primary: it, mentions: [], distinctVoices: 0, concentrated: false, promotional: false, conflict: null, change: null,
        summary: blankSummary, why: [], tier: 'auto', firstSeen: nowIso, updatedAt: nowIso,
      }, now, true))
    }
  }

  // 5. trends, then claim movement on the newest event of each accelerating compound
  const all = [...events.values()]
  for (const e of all) { e.labels = e.labels.filter((l) => l !== 'CLAIM MOVEMENT'); e.why = e.why.filter((w) => !w.startsWith('Talk about ')) }
  const startedAt = prev?.startedAt ?? nowIso
  const trends = trendsFor(all, now, now.getTime() - new Date(startedAt).getTime() >= 14 * DAY)
  for (const tr of trends) {
    if (tr.research !== 'rising' && tr.video !== 'rising' && tr.news !== 'rising') continue
    const latest = all.filter((e) => e.compounds.includes(tr.slug)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    if (latest && !latest.labels.includes('CLAIM MOVEMENT')) {
      latest.labels.push('CLAIM MOVEMENT')
      latest.why.push(`Talk about ${NAME_BY_SLUG[tr.slug]} is picking up: ${tr.velocity.last7} mentions this week vs. about ${tr.velocity.weeklyBaseline} a week before`)
    }
  }

  const ranked = all.sort((a, b) => rank(b, now) - rank(a, now))
  return {
    version: 1, generatedAt: nowIso, runs,
    events: ranked.filter((e) => e.tier === 'auto' || e.tier === 'auto-labeled').slice(0, 400),
    review: ranked.filter((e) => e.tier === 'review' || e.tier === 'hold').slice(0, 100),
    trends, trialStatus, startedAt, runCount: (prev?.runCount ?? 0) + 1,
  }
}

const blankSummary: Summary = { whatHappened: '', whyItMatters: '', whatItDoesNotShow: null, method: '' }

/** Labels, flags, summary, "why you're seeing this", and publish tier — all from the stored record. */
function finish(e: PulseEvent, now: Date, isNew: boolean): PulseEvent {
  const p = e.primary
  const all = [p, ...e.mentions]
  const voices = new Map<string, number>()
  for (const m of all) voices.set(m.outlet, (voices.get(m.outlet) ?? 0) + 1)
  e.distinctVoices = voices.size
  e.concentrated = all.length >= 4 && Math.max(...voices.values()) / all.length > 0.6
  e.promotional = all.some((m) => PROMO.test(`${m.title} ${m.snippet}`))
  const loud = e.mentions.filter((m) => m.sourceClass !== 'primary')
  const recentVoices = new Set(loud.filter((m) => now.getTime() - new Date(m.publishedAt).getTime() < 3 * DAY).map((m) => m.outlet)).size

  // clickbait check against the regulatory record
  e.conflict = null
  for (const m of all) {
    if (m.sourceClass === 'primary') continue
    if (/fda[\s-]*(approv|clear)/i.test(m.title)) {
      const wrong = mentions(m.title).filter((s) => !FDA_APPROVED.has(s))
      if (wrong.length) { e.conflict = `A headline says “FDA approved”, but ${names(wrong)} ${wrong.length > 1 ? 'have' : 'has'} no FDA-approved use on record.`; break }
    }
  }

  const labels = new Set<Label>()
  const kind = String(p.facts.studyKind ?? '')
  if (p.kind === 'pubmed') {
    const pubTypes = ((p.facts.pubTypes as string[]) ?? []).join(' ')
    labels.add(kind === 'correction' ? 'CORRECTION' : 'NEW RESEARCH')
    // a human trial counts as major only when it is registered as a trial AND the compound is in the title (not a side mention)
    if (/randomized controlled trial|clinical trial/i.test(pubTypes) && e.compounds.some((c) => mentions(p.title).includes(c))) labels.add('MAJOR UPDATE')
    const age = now.getTime() - new Date(p.publishedAt).getTime()
    if (recentVoices >= 2 && age > 180 * DAY) labels.add('OLD RESEARCH TRENDING AGAIN')
  } else if (p.kind === 'trials') {
    labels.add('TRIAL UPDATE')
    const phases = (p.facts.phases as string[]) ?? []
    if ((e.change && /completed|terminated|withdrawn|suspended/i.test(e.change.after)) || p.facts.hasResults || (isNew && phases.includes('PHASE3'))) labels.add('MAJOR UPDATE')
  } else if (p.kind === 'fda') {
    labels.add('REGULATORY')
    if (e.compounds.length) labels.add('MAJOR UPDATE')
  } else if (p.kind === 'news') {
    if (/fda|regulat|ban\b|banned|approv|warning letter|compounding/i.test(p.title)) labels.add('REGULATORY')
    else if (/study|trial|research|scientists/i.test(p.title)) labels.add('NEW RESEARCH')
    else labels.add('EARLY SIGNAL')
  } else if (p.kind === 'youtube') {
    labels.add(recentVoices >= 3 || e.distinctVoices >= 3 ? 'TRENDING DISCUSSION' : 'COMMENTARY')
  } else labels.add('EARLY SIGNAL')
  if (p.kind !== 'youtube' && recentVoices >= 3) labels.add('TRENDING DISCUSSION')
  e.labels = [...labels]

  e.summary = summarize(e)
  const why: string[] = []
  if (e.compounds.length) why.push(`Mentions ${names(e.compounds)}`)
  else if (MARKET_TERMS.test(`${p.title} ${p.snippet}`)) why.push('About the peptide market as a whole')
  const ageH = (now.getTime() - new Date(p.publishedAt).getTime()) / 36e5
  if (ageH < 48) why.push(ageH < 24 ? 'New in the last 24 hours' : 'New in the last 2 days')
  why.push({ primary: 'Straight from the original source', 'verified-reporting': 'From an established news outlet', commentary: 'Someone’s take, not the original source', community: 'Community discussion', unknown: 'Origin not confirmed yet' }[p.sourceClass])
  if (e.change) why.push(`Status changed: ${e.change.before} → ${e.change.after}`)
  if (e.mentions.length) why.push(`${e.mentions.length} other ${e.mentions.length === 1 ? 'mention' : 'mentions'} of the same thing, from ${Math.max(1, e.distinctVoices - 1)} ${e.distinctVoices - 1 === 1 ? 'outlet' : 'outlets'} — shown once`)
  if (e.concentrated) why.push('Most of the noise comes from one channel, so it counts once')
  if (e.promotional) why.push('Looks promotional (codes, discounts or affiliate links)')
  if (e.conflict) why.push(e.conflict)
  e.why = why

  // publish tiers: primary auto-publishes; opinions publish with their label; loud unsupported claims wait for a person
  e.tier = p.sourceClass === 'primary' ? 'auto' : 'auto-labeled'
  if (e.conflict && e.distinctVoices >= 3) e.tier = 'review'
  if (!e.compounds.length && !MARKET_TERMS.test(`${p.title} ${p.snippet}`)) e.tier = 'hold'
  if (p.sourceClass === 'unknown') e.tier = 'hold'
  return e
}

function summarize(e: PulseEvent): Summary {
  const p = e.primary
  const who = e.compounds.length ? names(e.compounds) : 'peptides'
  const method = 'Written from the source’s own title, date, first lines and listed details, using fixed wording. Nothing added, no AI rewrite. Read the source for the full picture.'
  if (p.kind === 'pubmed') {
    const k = String(p.facts.studyKind)
    const what: Record<string, string> = { 'human-trial': 'a clinical trial in people', human: 'a study in people', rats: 'a study in rats', mice: 'a study in mice', animals: 'an animal study', cells: 'a lab study in cells', review: 'a review of earlier research', case: 'a case report', correction: 'a correction notice', unclear: 'a new paper' }
    const not: Record<string, string | null> = {
      'human-trial': null, human: null, case: 'A case report describes one person, so it can’t show how common a result is.',
      rats: 'Rat results don’t always carry over to people.', mice: 'Mouse results don’t always carry over to people.', animals: 'Animal results don’t always carry over to people.',
      cells: 'Cell results are an early step and haven’t been tested in a living body here.', review: 'A review pulls together earlier studies; it isn’t new data.', correction: 'A correction or retraction changes an earlier paper; check which one.', unclear: null,
    }
    return { whatHappened: `New paper in ${p.outlet}: “${p.title}”`, whyItMatters: `It adds ${what[k] ?? 'a new paper'} to the research on ${who}.`, whatItDoesNotShow: not[k] ?? null, method }
  }
  if (p.kind === 'trials') {
    const ph = phaseLabel((p.facts.phases as string[]) ?? [])
    const whatHappened = e.change ? `${ph} trial ${p.facts.nct} moved from ${e.change.before} to ${e.change.after}: “${p.title}”` : `${ph} trial ${p.facts.nct} is ${statusLabel(String(p.facts.status)).toLowerCase()}: “${p.title}”`
    const phases = ((p.facts.phases as string[]) ?? []).join(' ')
    const why = p.facts.hasResults ? 'Results have been posted on the registry.' : /PHASE3/.test(phases) ? 'Phase 3 trials are the large ones regulators use to decide on approval.' : /PHASE2/.test(phases) ? 'Phase 2 tests whether it works in a bigger group of people.' : /PHASE1/.test(phases) ? 'Phase 1 is the first step in people.' : `A registered study involving ${who}.`
    return { whatHappened, whyItMatters: why, whatItDoesNotShow: p.facts.hasResults ? null : 'A registry update shows the trial’s status, not its results.', method }
  }
  if (p.kind === 'fda') return { whatHappened: `The FDA posted: “${p.title}”`, whyItMatters: e.compounds.length ? `Official update that can change how ${who} is sold, compounded or prescribed.` : 'Official update that affects the peptide market broadly.', whatItDoesNotShow: null, method }
  if (p.kind === 'youtube') {
    const n = e.mentions.length + 1
    return {
      whatHappened: n > 1 ? `${n} videos from ${e.distinctVoices} ${e.distinctVoices === 1 ? 'channel' : 'channels'} are talking about this. Latest: “${p.title}” (${p.outlet})` : `New video from ${p.outlet}: “${p.title}”`,
      whyItMatters: e.distinctVoices >= 3 ? `Several separate channels picked this up about ${who}.` : `One creator’s take on ${who}.`,
      whatItDoesNotShow: 'This is commentary. Check the sources the video links to.', method,
    }
  }
  return { whatHappened: `${p.outlet} reports: “${p.title}”`, whyItMatters: `Coverage of ${who}${e.mentions.length ? `, also picked up by ${e.mentions.length} other ${e.mentions.length === 1 ? 'outlet' : 'outlets'}` : ''}.`, whatItDoesNotShow: e.conflict ?? 'A news report; the original source has the details.', method }
}

const LABEL_WEIGHT: Record<Label, number> = { 'MAJOR UPDATE': 100, CORRECTION: 70, REGULATORY: 80, 'TRIAL UPDATE': 58, 'CLAIM MOVEMENT': 55, 'NEW RESEARCH': 50, 'TRENDING DISCUSSION': 45, 'OLD RESEARCH TRENDING AGAIN': 40, 'EARLY SIGNAL': 30, COMMENTARY: 20 }
/** Internal ordering only — never shown as a number. Authority and freshness first; copies don't add weight. */
function rank(e: PulseEvent, now: Date): number {
  const days = (now.getTime() - new Date(e.primary.publishedAt).getTime()) / DAY
  const label = Math.max(0, ...e.labels.map((l) => LABEL_WEIGHT[l]))
  const echo = e.mentions.length - (e.distinctVoices - 1)
  // a video nobody has watched yet shouldn't outrank research; a widely watched one earns a little
  const views = e.primary.kind === 'youtube' ? Number(e.primary.facts.views ?? 0) : -1
  const reach = views < 0 ? 0 : views < 200 ? -15 : Math.min(8, Math.log10(views) * 2)
  return reach + label + CLASS_RANK[e.primary.sourceClass] * 5 + (e.compounds.some((c) => FEATURED.has(c)) ? 10 : 0) + Math.min(10, e.distinctVoices * 2) - Math.max(0, echo) - days * 2.5 - (e.concentrated ? 8 : 0) - (e.promotional ? 10 : 0)
}

function trendsFor(events: PulseEvent[], now: Date, enoughHistory: boolean): CompoundTrend[] {
  const t = now.getTime()
  return COMPOUNDS.map((c) => {
    const items = events.filter((e) => e.compounds.includes(c.slug)).flatMap((e) => [e.primary, ...e.mentions])
    const inWindow = (kind: string[], from: number, to: number) => items.filter((i) => kind.includes(i.kind) && t - new Date(i.publishedAt).getTime() >= from * DAY && t - new Date(i.publishedAt).getTime() < to * DAY).length
    const level = (kind: string[]): Activity => {
      const last7 = inWindow(kind, 0, 7), before = inWindow(kind, 7, 35) / 4
      const month = inWindow(kind, 0, 35)
      if (enoughHistory && last7 >= 3 && last7 >= 2 * Math.max(1, before)) return 'rising'
      return month === 0 ? 'none' : month <= 2 ? 'low' : month <= 6 ? 'medium' : 'high'
    }
    const every = ['pubmed', 'trials', 'fda', 'news', 'youtube', 'reddit', 'tiktok']
    return { slug: c.slug, research: level(['pubmed']), trials: level(['trials', 'fda']), news: level(['news']), video: level(['youtube']), velocity: { last7: inWindow(every, 0, 7), weeklyBaseline: Math.round(inWindow(every, 7, 35) / 4) } }
  })
}

export type { Lane }
