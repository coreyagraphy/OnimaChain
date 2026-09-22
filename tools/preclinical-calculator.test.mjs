import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateMouseStudy } from '../src/data/preclinical-calculator.ts'

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
