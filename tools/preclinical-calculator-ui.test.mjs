import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

// Start `npm run dev`; override only when its port differs.
const base = process.env.CALCULATOR_TEST_URL ?? 'http://127.0.0.1:8080'
let browser

before(async () => { browser = await chromium.launch({ channel: 'chrome' }) })
after(async () => { await browser?.close() })

async function calculator(width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 850 } })
  await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.goto(`${base}/research-tools/preclinical-calculator`, { waitUntil: 'networkidle' })
  assert.equal(response?.status(), 200)
  return { page, errors }
}

async function fillKnownAnswer(page) {
  await page.getByRole('spinbutton', { name: 'Compound stock mass' }).fill('5')
  await page.getByRole('spinbutton', { name: 'Research diluent volume' }).fill('1')
  await page.getByRole('spinbutton', { name: 'Mouse body mass' }).fill('25')
  await page.getByRole('spinbutton', { name: 'Target experimental dose' }).fill('2')
  await page.getByRole('spinbutton', { name: 'Number of animals' }).fill('10')
  await page.getByRole('spinbutton', { name: 'Number of administrations' }).fill('3')
  await page.getByRole('spinbutton', { name: 'Expected handling loss' }).fill('10')
}

test('UI recalculates after edits and shows both mg and mcg', async () => {
  const { page, errors } = await calculator()
  try {
    await fillKnownAnswer(page)
    let worksheet = await page.locator('.calculator-results').innerText()
    assert.match(worksheet, /5 mg\/mL/)
    assert.match(worksheet, /0\.05 mg · 50 mcg/)
    assert.match(worksheet, /10 µL/)
    assert.match(worksheet, /0\.333333 mL/)
    assert.match(worksheet, /1\.66667 mg/)
    await page.getByRole('spinbutton', { name: 'Number of animals' }).fill('20')
    worksheet = await page.locator('.calculator-results').innerText()
    assert.match(worksheet, /0\.6 mL/)
    assert.match(worksheet, /3 mg/)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('stock mass UI converts mg to mcg and back without changing the represented mass', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    const stock = page.getByRole('spinbutton', { name: 'Compound stock mass' })
    await page.getByRole('combobox', { name: 'Stock mass unit' }).selectOption('mcg')
    assert.equal(await stock.inputValue(), '5000')
    assert.match(await page.locator('.calculator-results').innerText(), /5 mg\/mL/)
    await stock.fill('2500')
    assert.match(await page.locator('.calculator-results').innerText(), /2\.5 mg\/mL/)
    await page.getByRole('combobox', { name: 'Stock mass unit' }).selectOption('mg')
    assert.equal(await stock.inputValue(), '2.5')
  } finally { await page.close() }
})

test('experimental dose UI converts equivalent mg/kg and mcg/kg inputs', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    await page.getByRole('combobox', { name: 'Dose unit' }).selectOption('µg/kg')
    await page.getByRole('spinbutton', { name: 'Target experimental dose' }).fill('2000')
    assert.match(await page.locator('.calculator-results').innerText(), /0\.05 mg · 50 mcg/)
  } finally { await page.close() }
})

test('reset clears the worksheet and restores input units', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    await page.getByRole('combobox', { name: 'Stock mass unit' }).selectOption('mcg')
    await page.getByRole('button', { name: 'Reset' }).click()
    assert.equal(await page.locator('.calculator-results').count(), 0)
    assert.equal(await page.getByRole('spinbutton', { name: 'Compound stock mass' }).inputValue(), '')
    assert.equal(await page.getByRole('combobox', { name: 'Stock mass unit' }).inputValue(), 'mg')
    assert.equal(await page.getByRole('combobox', { name: 'Dose unit' }).inputValue(), 'mg/kg')
  } finally { await page.close() }
})

test('blank, zero, and negative required inputs remove calculated output', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    const mass = page.getByRole('spinbutton', { name: 'Mouse body mass' })
    for (const value of ['', '0', '-1']) {
      await mass.fill(value)
      assert.equal(await page.locator('.calculator-results').count(), 0)
    }
  } finally { await page.close() }
})

for (const width of [320, 390]) {
  test(`mobile controls fit at ${width}px`, async () => {
    const { page, errors } = await calculator(width)
    try {
      await fillKnownAnswer(page)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
      assert.equal(overflow, false)
      assert.equal(await page.getByRole('spinbutton', { name: 'Compound stock mass' }).isVisible(), true)
      assert.equal(await page.locator('.calculator-results').isVisible(), true)
      assert.deepEqual(errors, [])
    } finally { await page.close() }
  })
}

test('fields and units have accessible names, keyboard order, and live results', async () => {
  const { page } = await calculator()
  try {
    for (const name of ['Compound stock mass', 'Research diluent volume', 'Mouse body mass', 'Target experimental dose', 'Number of animals', 'Number of administrations', 'Expected handling loss']) {
      assert.equal(await page.getByRole('spinbutton', { name }).count(), 1)
    }
    assert.equal(await page.getByRole('combobox', { name: 'Stock mass unit' }).count(), 1)
    assert.equal(await page.getByRole('combobox', { name: 'Dose unit' }).count(), 1)
    assert.equal(await page.locator('[aria-live="polite"][aria-atomic="true"]').count(), 1)
    await page.getByRole('spinbutton', { name: 'Compound stock mass' }).focus()
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Stock mass unit')
  } finally { await page.close() }
})

test('worksheet exposes no human, veterinary, or syringe-unit calculations', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    const labels = await page.locator('.calculator-results dt').allTextContents()
    assert.equal(labels.length, 7)
    assert.ok(labels.every((label) => !/human|veterinary|syringe|U-100|equivalent/i.test(label)))
    const values = await page.locator('.calculator-results dd').allTextContents()
    assert.ok(values.every((value) => !/\bIU\b|U-100|units\b|human|veterinary/i.test(value)))
    assert.equal(await page.getByRole('combobox', { name: 'Dose unit' }).locator('option').count(), 2)
  } finally { await page.close() }
})
