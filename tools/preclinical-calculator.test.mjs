import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateMouseStudy, calculateReconstitution, formatStudyNumber, mcgToMg, mgToMcg, mlToUl, ulToMl } from '../src/data/preclinical-calculator.ts'

const base = { stockMassMg: 5, diluentMl: 1, mouseMassG: 25, targetDose: 2, doseUnit: 'mg/kg', animals: 10, administrations: 3, handlingLossPercent: 10 }

test('mouse-study arithmetic and handling allowance', () => {
  const result = calculateMouseStudy(base)
  assert.ok(result)
  assert.equal(result.concentrationMgMl, 5)
  assert.equal(result.dosePerAnimalMg, 0.05)
  assert.equal(result.volumePerAnimalUl, 10)
  assert.equal(result.totalSolutionMl, 0.3)
  assert.equal(result.totalCompoundMg, 1.5)
  assert.ok(Math.abs(result.volumeWithAllowanceMl - 1 / 3) < 1e-10)
  assert.ok(Math.abs(result.compoundWithAllowanceMg - 5 / 3) < 1e-10)
  assert.equal(result.stockSufficient, true)
})

test('micrograms per kilogram convert to milligrams', () => {
  const result = calculateMouseStudy({ ...base, targetDose: 2000, doseUnit: 'µg/kg' })
  assert.equal(result?.dosePerAnimalMg, 0.05)
})

test('invalid or incomplete study inputs do not produce output', () => {
  assert.equal(calculateMouseStudy({ ...base, animals: 0 }), null)
  assert.equal(calculateMouseStudy({ ...base, animals: 1.5 }), null)
  assert.equal(calculateMouseStudy({ ...base, handlingLossPercent: 100 }), null)
  assert.equal(calculateMouseStudy({ ...base, mouseMassG: Number.NaN }), null)
})

test('mass and volume conversion factors work in both directions', () => {
  assert.equal(mgToMcg(0.025), 25)
  assert.equal(mcgToMg(25), 0.025)
  assert.equal(mlToUl(0.2), 200)
  assert.equal(ulToMl(200), 0.2)
})

test('mg/kg and mcg/kg give the same full worksheet for equivalent inputs', () => {
  const mg = calculateMouseStudy(base)
  const mcg = calculateMouseStudy({ ...base, targetDose: 2000, doseUnit: 'µg/kg' })
  assert.deepEqual(mcg, mg)
})

test('multiple animals and administrations scale solution and material independently', () => {
  const one = calculateMouseStudy({ ...base, animals: 1, administrations: 1, handlingLossPercent: 0 })
  const many = calculateMouseStudy({ ...base, animals: 4, administrations: 5, handlingLossPercent: 0 })
  assert.equal(many.totalSolutionMl, one.totalSolutionMl * 20)
  assert.equal(many.totalCompoundMg, one.totalCompoundMg * 20)
  assert.equal(many.dosePerAnimalMg, one.dosePerAnimalMg)
})

test('zero handling loss leaves material and volume totals unchanged', () => {
  const result = calculateMouseStudy({ ...base, handlingLossPercent: 0 })
  assert.equal(result.volumeWithAllowanceMl, result.totalSolutionMl)
  assert.equal(result.compoundWithAllowanceMg, result.totalCompoundMg)
})

test('handling loss increases both material and volume using the same recovery fraction', () => {
  const result = calculateMouseStudy({ ...base, handlingLossPercent: 20 })
  assert.ok(Math.abs(result.volumeWithAllowanceMl - 0.375) < 1e-12)
  assert.ok(Math.abs(result.compoundWithAllowanceMg - 1.875) < 1e-12)
})

test('insufficient stock includes handling allowance', () => {
  const result = calculateMouseStudy({ ...base, stockMassMg: 1 })
  assert.equal(result?.stockSufficient, false)
})

test('known-answer microgram case covers all arithmetic and units', () => {
  const result = calculateMouseStudy({ stockMassMg: 5000 / 1000, diluentMl: 2, mouseMassG: 20, targetDose: 250, doseUnit: 'µg/kg', animals: 4, administrations: 2, handlingLossPercent: 20 })
  assert.ok(result)
  assert.equal(result.concentrationMgMl, 2.5)
  assert.equal(result.dosePerAnimalMg, 0.005)
  assert.equal(result.volumePerAnimalUl, 2)
  assert.equal(result.totalSolutionMl, 0.016)
  assert.equal(result.totalCompoundMg, 0.04)
  assert.equal(result.volumeWithAllowanceMl, 0.02)
  assert.ok(Math.abs(result.compoundWithAllowanceMg - 0.05) < 1e-12)
})

for (const [label, change] of [
  ['zero stock mass', { stockMassMg: 0 }], ['negative stock mass', { stockMassMg: -1 }],
  ['zero diluent', { diluentMl: 0 }], ['negative diluent', { diluentMl: -1 }],
  ['zero mouse mass', { mouseMassG: 0 }], ['negative mouse mass', { mouseMassG: -1 }],
  ['zero experimental dose', { targetDose: 0 }], ['negative experimental dose', { targetDose: -1 }],
  ['zero animals', { animals: 0 }], ['fractional animals', { animals: 1.5 }],
  ['zero administrations', { administrations: 0 }], ['fractional administrations', { administrations: 1.5 }],
  ['negative handling loss', { handlingLossPercent: -1 }], ['100% handling loss', { handlingLossPercent: 100 }],
  ['NaN input', { mouseMassG: Number.NaN }], ['infinite input', { stockMassMg: Infinity }],
  ['nonnumeric input', { targetDose: 'bad' }], ['blank input', { targetDose: '' }],
  ['invalid dose unit', { doseUnit: 'IU/kg' }],
]) {
  test(`rejects ${label}`, () => assert.equal(calculateMouseStudy({ ...base, ...change }), null))
}

test('extreme inputs cannot produce infinite or underflowed worksheet values', () => {
  assert.equal(calculateMouseStudy({ ...base, stockMassMg: 1e-300, diluentMl: 1e300 }), null)
  assert.equal(calculateMouseStudy({ ...base, targetDose: Number.MIN_VALUE }), null)
})

test('display precision preserves small nonzero values and rounds predictably', () => {
  assert.equal(formatStudyNumber(1e-8), '1.00000e-8')
  assert.equal(formatStudyNumber(0.000001), '0.000001')
  assert.equal(formatStudyNumber(1.23456789), '1.23457')
  assert.equal(formatStudyNumber(1e9), '1.00000e+9')
})

test('reconstitution known answer maps 10 mg plus 3 mL and 500 mcg to mark 15 and 20 doses', () => {
  const result = calculateReconstitution({ vialMassMg: 10, diluentMl: 3, amountPerDoseMcg: 500 })
  assert.ok(result)
  assert.ok(Math.abs(result.concentrationMgMl - 10 / 3) < 1e-12)
  assert.equal(result.concentrationMcgMl, 10000 / 3)
  assert.equal(result.drawVolumeMl, 0.15)
  assert.equal(result.drawVolumeUl, 150)
  assert.equal(result.u100Mark, 15)
  assert.equal(result.fullDoses, 20)
  assert.equal(result.remainderMcg, 0)
  assert.equal(result.remainderMl, 0)
})

test('reconstitution reports only full doses and the remaining amount', () => {
  const result = calculateReconstitution({ vialMassMg: 10, diluentMl: 2, amountPerDoseMcg: 600 })
  assert.equal(result?.fullDoses, 16)
  assert.equal(result?.remainderMcg, 400)
  assert.equal(result?.remainderMl, 0.08)
  assert.equal(result?.u100Mark, 12)
})

test('reconstitution rejects incomplete, nonfinite, and larger-than-vial amounts', () => {
  assert.equal(calculateReconstitution({ vialMassMg: 0, diluentMl: 3, amountPerDoseMcg: 500 }), null)
  assert.equal(calculateReconstitution({ vialMassMg: 10, diluentMl: Number.NaN, amountPerDoseMcg: 500 }), null)
  assert.equal(calculateReconstitution({ vialMassMg: 10, diluentMl: 3, amountPerDoseMcg: 10001 }), null)
})
