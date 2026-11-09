import assert from 'node:assert/strict'
import { COMPOUND_OPTIONS, EXPERIENCES, PEPTIDES } from '../src/data/experiences.ts'
import { DEFAULT_FILTERS, matchesQuery, searchExperiences, TOPICS, validateFilters } from '../src/data/experience-search.ts'

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
  assert.equal(new URL(r.source).hostname, 'www.reddit.com')
  assert.ok(r.route.length > 30 && r.context.length > 30 && r.locator)
  for (const id of r.compounds) assert.ok(COMPOUND_OPTIONS.some(c => c[0] === id))
  for (const topic of r.topics) assert.ok(Object.hasOwn(TOPICS, topic), topic)
}
const query = (q: string) => searchExperiences({ ...DEFAULT_FILTERS, q })
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
