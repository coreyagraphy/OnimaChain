/*
 * PulseChain engine tests — offline, synthetic inputs, no network. Run: npm run test:pulse
 * Each case is one of the refuter / adversarial attacks the design has to survive.
 */
import assert from 'node:assert/strict'
import { build, mentions } from '../src/pulse/pipeline.ts'
import { applyDecision, publicView, queueView, tokenOk } from '../src/pulse/review.ts'
import { looksEnglish } from '../src/pulse/adapters.ts'
import { diversify } from '../src/pulse/fresh.ts'
import type { PulseSnapshot, SourceItem } from '../src/pulse/types.ts'

const now = new Date('2026-09-21T12:00:00Z')
const day = (n: number) => new Date(now.getTime() - n * 864e5).toISOString()
const paper = (id: string, title: string, extra: Partial<SourceItem> = {}): SourceItem => ({ key: `pmid:${id}`, kind: 'pubmed', sourceClass: 'primary', outlet: 'J Test', title, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, publishedAt: day(1), snippet: 'In rats, tendon healing was measured.', facts: { pmid: id, query: 'bpc-157', pubTypes: ['Journal Article'], studyKind: 'rats' }, ...extra })
const video = (id: string, channel: string, title: string, extra: Partial<SourceItem> = {}): SourceItem => ({ key: `yt:${id}`, kind: 'youtube', sourceClass: 'commentary', outlet: channel, title, url: `https://youtube.com/watch?v=${id}`, publishedAt: day(0.5), snippet: '', facts: { query: 'bpc-157', links: [] }, ...extra })
const trial = (status: string): SourceItem => ({ key: 'nct:NCT0000001', kind: 'trials', sourceClass: 'primary', outlet: 'Sponsor', title: 'Semaglutide for knee pain', url: 'https://clinicaltrials.gov/study/NCT0000001', publishedAt: day(1), snippet: '', facts: { nct: 'NCT0000001', query: 'semaglutide', status, phases: ['PHASE2'], hasResults: false } })
const runs: PulseSnapshot['runs'] = []
let passed = 0
const test = (name: string, fn: () => void) => { fn(); passed++; console.log('  ✓', name) }

test('names and aliases resolve to compounds; the p21 gene does not', () => {
  assert.deepEqual(mentions('New BPC 157 tendon study'), ['bpc-157'])
  assert.ok(mentions('Thymosin beta-4 in wound repair').includes('tb-500'))
  assert.deepEqual(mentions('p21 regulates the cell cycle'), [])
  assert.ok(mentions('the Wolverine stack is everywhere').includes('wolverine-blend'))
})

test('one paper + videos about it = ONE event with downstream mentions', () => {
  const s = build(null, [
    paper('111', 'BPC-157 accelerates Achilles tendon healing in rats'),
    video('a', 'Chan A', 'BPC-157 accelerates Achilles tendon healing in rats — new study!'),
    video('b', 'Chan B', 'New rat study: BPC-157 accelerates Achilles tendon healing'),
    video('c', 'Chan C', 'BPC-157 tendon healing in rats, accelerates recovery (study breakdown)'),
  ], runs, now)
  const e = s.events.find((x) => x.id === 'pmid:111')!
  assert.equal(s.events.filter((x) => x.compounds.includes('bpc-157')).length, 1)
  assert.equal(e.mentions.length, 3)
  assert.equal(e.distinctVoices, 4)
  assert.ok(e.labels.includes('NEW RESEARCH'))
  assert.ok(e.labels.includes('TRENDING DISCUSSION'))
  assert.ok(e.why.some((w) => /3 other mentions/.test(w)))
})

test('a video that cites the PMID joins the paper even with a different headline', () => {
  const s = build(null, [paper('222', 'Gastric protection by BPC-157'), video('d', 'Chan D', 'You won’t believe this gut peptide', { snippet: 'Study: https://pubmed.ncbi.nlm.nih.gov/222/' })], runs, now)
  assert.equal(s.events.find((x) => x.id === 'pmid:222')!.mentions.length, 1)
})

test('one creator spamming 5 videos is flagged as concentrated and counts once', () => {
  const s = build(null, Array.from({ length: 5 }, (_, i) => video(`s${i}`, 'SpamChannel', `BPC-157 miracle healing results part ${i + 1} miracle healing`)), runs, now)
  const e = s.events.find((x) => x.compounds.includes('bpc-157'))!
  assert.equal(e.distinctVoices, 1)
  assert.ok(e.concentrated)
  assert.ok(!e.labels.includes('TRENDING DISCUSSION'))
})

test('"FDA approved BPC-157" clickbait conflicts with the regulatory record', () => {
  const s = build(null, [video('x', 'Hype TV', 'FDA APPROVED BPC-157?! Huge news')], runs, now)
  const e = s.events[0]
  assert.match(e.conflict ?? '', /no FDA-approved use/)
  assert.equal(e.tier, 'auto-labeled')
})

test('a loud unsupported claim (conflict + 3 voices) goes to the review queue, not the feed', () => {
  const s = build(null, [
    video('x1', 'A', 'FDA approved BPC-157 today'), video('x2', 'B', 'BPC-157 FDA approved today'), video('x3', 'C', 'Today FDA approved BPC-157!'),
  ], runs, now)
  assert.equal(s.events.length, 0)
  assert.equal(s.review.length, 1)
})

test('promotional posts are labelled, not hidden', () => {
  const s = build(null, [video('p', 'Shop', 'My BPC-157 results', { snippet: 'Use code HEAL20 for 20% off' })], runs, now)
  assert.ok(s.events[0].promotional)
  assert.ok(s.events[0].why.some((w) => /promotional/i.test(w)))
})

test('a trial status change is detected on the next run', () => {
  const first = build(null, [trial('RECRUITING')], runs, now)
  const second = build(first, [trial('COMPLETED')], runs, new Date(now.getTime() + 4 * 36e5))
  const e = second.events.find((x) => x.id === 'nct:NCT0000001')!
  assert.deepEqual(e.change, { before: 'Recruiting', after: 'Completed' })
  assert.ok(e.labels.includes('MAJOR UPDATE'))
  assert.match(e.summary.whatHappened, /moved from Recruiting to Completed/)
})

test('trial cards describe the fresh registry action instead of presenting an old status as new', () => {
  const posted = trial('COMPLETED')
  posted.publishedAt = day(0)
  posted.facts.firstPostedAt = day(0)
  posted.facts.completionAt = day(150)
  let e = build(null, [posted], runs, now).events[0]
  assert.match(e.summary.whatHappened, /record was posted on ClinicalTrials\.gov/)

  const updated = trial('COMPLETED')
  updated.publishedAt = day(0)
  updated.facts.firstPostedAt = day(300)
  updated.facts.completionAt = day(150)
  e = build(null, [updated], runs, now).events[0]
  assert.match(e.summary.whatHappened, /updated the record for completed Phase 2 trial/)
  assert.doesNotMatch(e.summary.whatHappened, /^Phase 2 trial .* is completed/)
})

test('the visible feed alternates lanes whenever another lane is available', () => {
  const trials = Array.from({ length: 3 }, (_, i) => ({ ...build(null, [trial('RECRUITING')], runs, now).events[0], id: `trial-${i}` }))
  const research = Array.from({ length: 2 }, (_, i) => build(null, [paper(`mix-${i}`, `BPC-157 paper ${i}`)], runs, now).events[0])
  const mixed = diversify([...trials, ...research])
  assert.deepEqual(mixed.slice(0, 4).map((e) => e.lane), ['trials', 'research', 'trials', 'research'])
})

test('re-running with the same sources adds nothing new (dedupe across runs)', () => {
  const items = [paper('333', 'BPC-157 study'), video('v', 'Chan', 'BPC-157 study review')]
  const a = build(null, items, runs, now)
  const b = build(a, items, runs, new Date(now.getTime() + 4 * 36e5))
  assert.equal(b.events.length, a.events.length)
  assert.equal(b.events.find((x) => x.id === 'pmid:333')!.mentions.length, a.events.find((x) => x.id === 'pmid:333')!.mentions.length)
})

test('nothing is "rising" before two weeks of history', () => {
  const s = build(null, Array.from({ length: 6 }, (_, i) => paper(`r${i}`, `BPC-157 paper ${i}`)), runs, now)
  assert.equal(s.trends.find((t) => t.slug === 'bpc-157')!.research === 'rising', false)
})

test('summaries only use the stored record', () => {
  const s = build(null, [paper('444', 'BPC-157 and tendons', { outlet: 'Journal X' })], runs, now)
  const sum = s.events[0].summary
  assert.match(sum.whatHappened, /Journal X/)
  assert.match(sum.whatHappened, /BPC-157 and tendons/)
  assert.match(sum.whatItDoesNotShow ?? '', /Rat results/)
})

test('review: approving a held claim publishes it, marked as checked, with the note', () => {
  const snap = build(null, [video('x1', 'A', 'FDA approved BPC-157 today'), video('x2', 'B', 'BPC-157 FDA approved today'), video('x3', 'C', 'Today FDA approved BPC-157!')], runs, now)
  const id = snap.review[0].id
  let d = applyDecision({}, id, 'approve', 'Not FDA-approved. This video is wrong; shown so you know what is circulating.', now)
  const pub = publicView(snap, d)
  const e = pub.events.find((x) => x.id === id)!
  assert.equal(e.reviewed?.action, 'approve')
  assert.match(e.reviewed?.note ?? '', /Not FDA-approved/)
  assert.equal(pub.review.length, 0)
  assert.equal(queueView(snap, d).waiting.length, 0)
  d = applyDecision(d, id, 'restore', undefined, now)
  assert.equal(publicView(snap, d).events.some((x) => x.id === id), false)
  assert.equal(queueView(snap, d).waiting.length, 1)
})

test('review: pull removes a live item and it stays out after the next run', () => {
  const a = build(null, [paper('555', 'BPC-157 in rats')], runs, now)
  const d = applyDecision({}, 'pmid:555', 'pull', undefined, now)
  const b = build(a, [paper('555', 'BPC-157 in rats')], runs, new Date(now.getTime() + 4 * 36e5))
  assert.equal(publicView(b, d).events.some((x) => x.id === 'pmid:555'), false)
  assert.equal(queueView(b, d).decided[0].id, 'pmid:555')
})

test('review: a note alone shows on a live card without changing its status', () => {
  const a = build(null, [paper('666', 'TB-500 wound study')], runs, now)
  const d = applyDecision({}, 'pmid:666', 'note', 'Same group as the 2010 paper.', now)
  const e = publicView(a, d).events.find((x) => x.id === 'pmid:666')!
  assert.equal(e.reviewed?.action, null)
  assert.equal(e.reviewed?.note, 'Same group as the 2010 paper.')
})

test('review key: exact match only', () => {
  assert.ok(tokenOk('abc123', 'abc123'))
  assert.ok(!tokenOk('abc124', 'abc123'))
  assert.ok(!tokenOk('abc12', 'abc123'))
  assert.ok(!tokenOk('anything', undefined))
  assert.ok(!tokenOk(null, 'abc123'))
})

test('YouTube language filter keeps English, drops Spanish/Portuguese/French', () => {
  assert.ok(looksEnglish('BPC-157: What the science actually says'))
  assert.ok(!looksEnglish('GHK-Cu: El péptido de cobre que está revolucionando'))
  assert.ok(!looksEnglish('GHK Cu peptídios de colágeno facial'))
  assert.ok(!looksEnglish('Tout savoir sur la R3 pour les débutants'))
})

test('freshness: nothing older than 30 days gets in, and items age out on later runs', () => {
  const s1 = build(null, [paper('old', 'BPC-157 old paper', { publishedAt: day(40) }), paper('new', 'BPC-157 new paper', { publishedAt: day(29) })], runs, now)
  assert.deepEqual(s1.events.map((e) => e.id), ['pmid:new'])
  const s2 = build(s1, [], runs, new Date(now.getTime() + 2 * 864e5))
  assert.equal(s2.events.length, 0)
})

console.log(`pulse engine: ${passed} passed`)
