import assert from 'node:assert/strict'
import { COMPOUND_OPTIONS, EXPERIENCES, PEPTIDES } from '../src/data/experiences.ts'
import { DEFAULT_FILTERS, interpretQuery, matchesQuery, searchExperiences, TOPICS, validateFilters } from '../src/data/experience-search.ts'

assert.equal(PEPTIDES.length, 21)
assert.equal(COMPOUND_OPTIONS.length, 22)
assert.equal(new Set(EXPERIENCES.map(r => r.id)).size, EXPERIENCES.length)
for (const [id] of COMPOUND_OPTIONS) {
  const accounts = EXPERIENCES.filter(r => r.compounds.includes(id))
  assert.ok(accounts.length, `${id} has actual sourced coverage`)
  assert.ok(accounts.some(r => ['positive', 'mixed'].includes(r.outcome)), `${id} has a benefit or mixed account`)
  assert.ok(accounts.some(r => ['adverse', 'mixed'].includes(r.outcome)), `${id} has an adverse or mixed account`)
}
for (const r of EXPERIENCES) {
  assert.ok(['www.reddit.com', 'inghh.com'].includes(new URL(r.source).hostname))
  if (r.video) {
    assert.equal(new URL(r.video.url).hostname, 'www.youtube.com')
    assert.ok(r.video.reviewBasis.includes('transcript not verified'))
  }
  assert.ok(r.route.length > 30 && r.context.length > 30 && r.locator)
  for (const id of r.compounds) assert.ok(COMPOUND_OPTIONS.some(c => c[0] === id))
  for (const topic of r.topics) assert.ok(Object.hasOwn(TOPICS, topic), topic)
}
const query = (q: string) => searchExperiences({ ...DEFAULT_FILTERS, q })
const kneeIds = ['bpc-knee-worse', 'bpc-knee-video', 'bpc-tb-update']
for (const phrase of ['my knee hurts', 'My knees are really hurting!', 'I have pain in my knee', 'my left knee is painful', 'both knees are sore', 'show me knee pain', 'what peptides help my knee pain']) {
  assert.deepEqual(query(phrase).map(r => r.id), kneeIds, phrase)
}
for (const phrase of ['my leg is swollen', 'my legs are swollen', 'my left leg is swollen', 'both ankles are swelling', 'my feet are swollen', 'I have swollen ankles']) {
  assert.deepEqual(query(phrase).map(r => r.id), ['reta-leg-swelling', 'tirz-leg-swelling'], phrase)
}
for (const phrase of ['pinch nerve', 'I have a pinched nerve in my neck', 'trapped nerve', 'compressed nerve']) {
  assert.deepEqual(query(phrase).map(r => r.id), ['bpc-tb-pinched-nerve'], phrase)
}
for (const [phrase, topic] of [['I can’t sleep', 'sleep'], ['I am tired all the time', 'energy'], ['I have no energy', 'energy'], ['I can’t concentrate', 'focus'], ['my cholesterol is high', 'cholesterol']]) {
  const expected = query(TOPICS[topic].label).map(r => r.id)
  assert.deepEqual(query(phrase).map(r => r.id), expected, phrase)
}
assert.deepEqual(query('my elbow hurts'), [], 'do not substitute knee accounts for an unreviewed body part')
assert.deepEqual(query('my knee is swollen'), [], 'knee swelling must not be expanded to leg edema or knee pain')
assert.deepEqual(query('my knee hurts and my leg is swollen'), [], 'all symptoms must occur in the same account')
assert.deepEqual(query('no knee pain'), [], 'do not discard negation')
assert.deepEqual(query('my knee does not hurt'), [], 'do not discard negation')
assert.equal(interpretQuery('my knee does not hurt').ambiguousNegation, true)
assert.deepEqual(query('my'), [], 'filler alone must not match every account')
assert.deepEqual(query('my knee hurts and TB-500').map(r => r.id), ['bpc-tb-update'])
assert.ok(query('nerve pain').some(r => r.outcome === 'adverse'))
for (const id of ['knee', 'shoulder', 'neck', 'nerve', 'pinched-nerve', 'leg-swelling']) {
  for (const r of query(TOPICS[id].label)) assert.ok(r.topicNotes?.[id], `Specific match explanation required: ${r.id}/${id}`)
}
const cholesterolIds = ['sema-lipids', 'tirz-lipids', 'tirz-lipids-reversal']
for (const q of ['cholesterol', 'high cholesterol', 'LDL', 'HDL cholesterol', 'triglycerides', 'lipid panel', 'Cholesterol & blood lipids']) {
  assert.deepEqual(query(q).map(r => r.id), cholesterolIds, `Cholesterol coverage: ${q}`)
}
assert.deepEqual(query('semaglutide cholesterol').map(r => r.id), ['sema-lipids'])
assert.deepEqual(query('cholesterol and weight loss').map(r => r.id), cholesterolIds)
assert.deepEqual(query('cholesterol cancer'), [], 'unrelated disease must not match cholesterol accounts')
assert.deepEqual(searchExperiences({ ...DEFAULT_FILTERS, q: 'cholesterol', outcome: 'adverse' }).map(r => r.id), ['tirz-lipids-reversal'])
for (const [id, { label, aliases }] of Object.entries(TOPICS)) {
  const expected = EXPERIENCES.filter(r => r.topics.includes(id) && !r.compounds.includes('5-amino-1mq')).map(r => r.id)
  assert.ok(expected.length, `${label} needs actual source coverage`)
  assert.deepEqual(searchExperiences({ ...DEFAULT_FILTERS, topic: id }).map(r => r.id), expected, `Topic filter: ${label}`)
  for (const term of [label, ...aliases]) assert.deepEqual(query(term).map(r => r.id), expected, `Search phrase: ${term}`)
}
assert.ok(query('sleep').some(r => r.compounds.includes('sermorelin')), 'sleep must not be mistaken for the DSIP alias')
assert.ok(query('GHK Cu eczema').some(r => r.id === 'ghk-skin'))
assert.deepEqual(query('cancer'), [], 'no invented coverage for cancer')
assert.deepEqual(query('fatty liver'), [], 'do not expand a diagnosis into generic weight topics')
assert.deepEqual(query('no anxiety'), [], 'negation must not silently become a benefit claim')
assert.ok(query('sleep and anxiety').every(r => r.topics.includes('sleep') && r.topics.includes('anxiety')))
assert.ok(query('sleep and anxiety').length)
assert.ok(query('CJC1295').every(r => r.compounds.includes('cjc-1295')))
assert.equal(searchExperiences({ ...DEFAULT_FILTERS, group: 'other' }).length, 2)
assert.ok(searchExperiences(DEFAULT_FILTERS).every(r => !r.compounds.includes('5-amino-1mq')))
assert.ok(searchExperiences({ ...DEFAULT_FILTERS, outcome: 'adverse', compound: 'bpc-157' }).every(r => r.outcome === 'adverse' && r.compounds.includes('bpc-157')))
assert.ok(matchesQuery(EXPERIENCES.find(r => r.id === '5mq-energy')!, '5-Amino-1MQ energy'))
assert.deepEqual(validateFilters({ q: [], outcome: '__proto__', topic: 'constructor', compound: 'imaginary' }), DEFAULT_FILTERS)
console.log(`PASS: ${EXPERIENCES.length} sourced accounts; 21 peptides + 1 separate non-peptide; condition, alias, combination and outcome filters.`)
