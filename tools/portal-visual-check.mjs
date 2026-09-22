import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const base = process.argv[2] || 'http://localhost:8083'
await mkdir('shots/portal-refresh', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default'] })
const results = []
for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(`${base}/signal`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `shots/portal-refresh/title-${width}.png` })
  await page.locator('.signal-controls select').nth(1).selectOption('cognitive')
  await page.locator('.signal-controls select').first().selectOption('cerebrolysin')
  const fit = await page.locator('.signal-selected h2').evaluate(e => ({ text: e.textContent, fits: e.scrollWidth <= e.clientWidth + 1, size: getComputedStyle(e).fontSize }))
  for (const name of ['Constellation', 'Connections', 'Timeline', 'Topic map']) {
    await page.getByRole('button', { name, exact: true }).click()
    await page.locator('.signal-stage').scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await page.locator('.signal-stage').screenshot({ path: `shots/portal-refresh/${name.replaceAll(' ', '-')}-${width}.png` })
  }
  await page.locator('.island-names button').first().click()
  const selected = await page.locator('.signal-controls select').first().inputValue()
  const active = await page.locator('.island-names button[aria-pressed=true]').innerText()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  await page.locator('.signal-controls select').nth(1).selectOption('all')
  const allNames = await page.locator('.island-names button').count()
  const allOptions = await page.locator('.signal-controls select').first().locator('option').count()
  await page.locator('.signal-stage').screenshot({ path: `shots/portal-refresh/all-topics-${width}.png` })
  await page.goto(`${base}/explore`, { waitUntil: 'networkidle' })
  await page.locator('.shop-select select').first().selectOption('cognitive')
  const card = page.locator('.product-card').filter({ has: page.getByRole('heading', { name: 'Cerebrolysin', exact: true }) })
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  const cardFit = await card.locator('h3').evaluate(e => ({ fits: e.scrollWidth <= e.clientWidth + 1, height: e.clientHeight, size: getComputedStyle(e).fontSize }))
  await card.screenshot({ path: `shots/portal-refresh/card-${width}.png` })
  await card.getByRole('button', { name: 'Quick view', exact: true }).click()
  await page.waitForTimeout(2200)
  const canvas = await page.locator('.quick-view-scene canvas').count()
  await page.locator('.quick-view').screenshot({ path: `shots/portal-refresh/quick-${width}.png` })
  await page.keyboard.press('Escape')
  await card.getByRole('button', { name: 'Add to cart', exact: true }).click()
  const checkoutDisabled = await page.getByRole('button', { name: 'Checkout unavailable' }).isDisabled()
  results.push({ width, fit, cardFit, selected, active, overflow, canvas, checkoutDisabled, allNames, allOptions, errors })
  await context.close()
}
await browser.close()
console.log(JSON.stringify(results, null, 2))
if(results.some(r => r.errors.length || r.overflow || !r.fit.fits || !r.cardFit.fits || !r.checkoutDisabled || r.allNames !== r.allOptions)) process.exitCode = 1
