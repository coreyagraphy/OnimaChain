import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

// Start `npm run dev`; override only when its port differs.
const base = process.env.CALCULATOR_TEST_URL ?? 'http://127.0.0.1:8080'
let browser

before(async () => { browser = await chromium.launch({ channel: 'chrome' }) })
after(async () => { await browser?.close() })

async function calculator(width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.goto(`${base}/research-tools/preclinical-calculator`, { waitUntil: 'networkidle' })
  assert.equal(response?.status(), 200)
  return { page, errors }
}

async function fillKnownAnswer(page) {
  await page.getByRole('spinbutton', { name: 'How much compound is in the vial?' }).fill('10')
  await page.getByRole('spinbutton', { name: 'How much research diluent did you add?' }).fill('3')
  await page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' }).fill('500')
}

async function calculateDraw(page) {
  await page.getByRole('button', { name: 'Do the Math' }).click()
}

test('10 mg plus 3 mL and 500 mcg produces mark 15 and 20 full doses', async () => {
  const { page, errors } = await calculator()
  try {
    await fillKnownAnswer(page)
    assert.equal(await page.locator('.calculator-results').count(), 0)
    await calculateDraw(page)
    const results = await page.locator('.calculator-results').innerText()
    assert.match(results, /3\.33333 mg\/mL/)
    assert.match(results, /0\.15 mL/)
    assert.match(results, /150 µL/)
    assert.match(results, /RESULTING RESEARCH VOLUME\s+150\s+µL/i)
    assert.match(results, /U-100 reference · mark 15/i)
    assert.match(results, /APPROXIMATE PROTOCOL-SIZED DRAWS\s+20/i)
    assert.match(results, /No calculated remainder/)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('editing an input hides stale results until Do the Math is selected again', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    await calculateDraw(page)
    assert.equal(await page.locator('.calculator-results').count(), 1)
    await page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' }).fill('250')
    assert.equal(await page.locator('.calculator-results').count(), 0)
    await calculateDraw(page)
    const results = await page.locator('.calculator-results').innerText()
    assert.match(results, /RESULTING RESEARCH VOLUME\s+75\s+µL/i)
    assert.match(results, /U-100 reference · mark 7\.5/i)
    assert.match(results, /APPROXIMATE PROTOCOL-SIZED DRAWS\s+40/i)
  } finally { await page.close() }
})

test('vial and dose segmented units preserve equivalent calculations', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    const vial = page.getByRole('spinbutton', { name: 'How much compound is in the vial?' })
    const dose = page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' })
    await page.getByRole('group', { name: 'Vial amount unit' }).getByRole('button', { name: 'mcg' }).click()
    await page.getByRole('group', { name: 'Dose amount unit' }).getByRole('button', { name: 'mg', exact: true }).click()
    assert.equal(await vial.inputValue(), '10000')
    assert.equal(await dose.inputValue(), '0.5')
    await calculateDraw(page)
    assert.match(await page.locator('.calculator-results').innerText(), /U-100 reference · mark 15/i)
  } finally { await page.close() }
})

test('reset clears values, results, and restores default units', async () => {
  const { page } = await calculator()
  try {
    await fillKnownAnswer(page)
    await calculateDraw(page)
    await page.getByRole('group', { name: 'Vial amount unit' }).getByRole('button', { name: 'mcg' }).click()
    await page.getByRole('group', { name: 'Dose amount unit' }).getByRole('button', { name: 'mg', exact: true }).click()
    await page.getByRole('button', { name: 'Reset' }).click()
    assert.equal(await page.locator('.calculator-results').count(), 0)
    assert.equal(await page.getByRole('spinbutton', { name: 'How much compound is in the vial?' }).inputValue(), '')
    assert.equal(await page.getByRole('spinbutton', { name: 'How much research diluent did you add?' }).inputValue(), '')
    assert.equal(await page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' }).inputValue(), '')
    assert.equal(await page.getByRole('group', { name: 'Vial amount unit' }).getByRole('button', { name: 'mg', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(await page.getByRole('group', { name: 'Dose amount unit' }).getByRole('button', { name: 'mcg' }).getAttribute('aria-pressed'), 'true')
  } finally { await page.close() }
})

test('validation focuses the first missing field and rejects amounts larger than the vial', async () => {
  const { page } = await calculator()
  try {
    await calculateDraw(page)
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'vial-amount')
    assert.equal(await page.getByText('Enter the total amount printed on the vial.').isVisible(), true)
    await page.getByRole('spinbutton', { name: 'How much compound is in the vial?' }).fill('1')
    await page.getByRole('spinbutton', { name: 'How much research diluent did you add?' }).fill('3')
    await page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' }).fill('1001')
    await calculateDraw(page)
    assert.equal(await page.getByText('The protocol amount cannot be greater than the total amount in the vial.').isVisible(), true)
    assert.equal(await page.locator('.calculator-results').count(), 0)
  } finally { await page.close() }
})

test('the example loads the requested values without calculating automatically', async () => {
  const { page } = await calculator()
  try {
    await page.getByRole('button', { name: /Load 10 mg example/ }).click()
    assert.equal(await page.getByRole('spinbutton', { name: 'How much compound is in the vial?' }).inputValue(), '10')
    assert.equal(await page.getByRole('spinbutton', { name: 'How much research diluent did you add?' }).inputValue(), '3')
    assert.equal(await page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' }).inputValue(), '500')
    assert.equal(await page.locator('.calculator-results').count(), 0)
    assert.match(await page.getByRole('status').innerText(), /10 mg.*3 mL.*500 mcg/i)
  } finally { await page.close() }
})

test('volumes over one U-100 syringe show an explicit fit warning', async () => {
  const { page } = await calculator()
  try {
    await page.getByRole('spinbutton', { name: 'How much compound is in the vial?' }).fill('1')
    await page.getByRole('spinbutton', { name: 'How much research diluent did you add?' }).fill('3')
    await page.getByRole('spinbutton', { name: 'Mouse-study protocol amount' }).fill('500')
    await calculateDraw(page)
    assert.match(await page.locator('.calculator-results').innerText(), /U-100 reference · mark 150/i)
    assert.equal(await page.getByRole('alert').filter({ hasText: /will not fit/i }).isVisible(), true)
  } finally { await page.close() }
})

for (const width of [320, 390]) {
  test(`calculator and syringe results fit at ${width}px`, async () => {
    const { page, errors } = await calculator(width)
    try {
      await fillKnownAnswer(page)
      await calculateDraw(page)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
      assert.equal(overflow, false)
      assert.equal(await page.locator('.calculator-result-syringe').isVisible(), true)
      assert.equal(await page.locator('.syringe-scene').isVisible(), true)
      assert.deepEqual(errors, [])
    } finally { await page.close() }
  })
}

test('the old mouse and administration fields are gone and Mouse Math stays prominent', async () => {
  const { page } = await calculator()
  try {
    assert.equal(await page.getByText('How many administrations?').count(), 0)
    assert.equal(await page.getByText('Number of mice').count(), 0)
    assert.equal(await page.getByRole('spinbutton').count(), 3)
    assert.equal(await page.getByRole('group', { name: 'Vial amount unit' }).count(), 1)
    assert.equal(await page.getByRole('group', { name: 'Dose amount unit' }).count(), 1)
    assert.equal(await page.locator('[aria-live="polite"][aria-atomic="true"]').count(), 1)
    const restriction = page.getByRole('note', { name: 'Research-use restriction' })
    assert.equal(await restriction.isVisible(), true)
    assert.match(await restriction.innerText(), /Mouse research only[\s\S]*Not for human use/i)
    assert.match(await page.locator('.calculator-boundary').innerText(), /Mouse research only\. Not for human use\./i)
    const calculatorLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Mouse Math' })
    assert.equal(await calculatorLink.getAttribute('href'), '/research-tools/preclinical-calculator')
  } finally { await page.close() }
})

test('representative sitewide routes retain their structure and expose warm signal states', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    let response = await page.goto(`${base}/watchlist`, { waitUntil: 'networkidle' })
    assert.equal(response?.status(), 200)
    assert.equal(await page.locator('.watchlist-signal').isVisible(), true)
    assert.equal(await page.locator('.research-status-pill').filter({ hasText: 'Watchlist' }).first().isVisible(), true)

    response = await page.goto(`${base}/targets`, { waitUntil: 'networkidle' })
    assert.equal(response?.status(), 200)
    const target = page.locator('.research-target-node').first()
    await target.click()
    assert.equal(await target.getAttribute('aria-pressed'), 'true')

    response = await page.goto(`${base}/learn`, { waitUntil: 'networkidle' })
    assert.equal(response?.status(), 200)
    const filter = page.getByRole('button', { name: /Research basics/ })
    await filter.click()
    assert.equal(await filter.getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.learn-card-top > span').first().isVisible(), true)

    response = await page.goto(`${base}/timeline`, { waitUntil: 'networkidle' })
    assert.equal(response?.status(), 200)
    assert.equal(await page.locator('.timeline-current').count(), 1)
    assert.equal(await page.locator('.timeline-now').isVisible(), true)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})
