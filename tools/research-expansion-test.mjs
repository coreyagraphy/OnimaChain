import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://127.0.0.1:8084'
const browser = await chromium.launch({ channel: 'chrome' })
const routes = ['/', '/explore', '/watchlist', '/watchlist/zenagamtide', '/targets', '/combinations', '/coa', '/research-tools', '/research-tools/preclinical-calculator']
let failures = 0
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 850 } })
  await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  for (const route of routes) {
    const errors = []
    const onError = (error) => errors.push(error.message)
    page.on('pageerror', onError)
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(450)
    const result = await page.evaluate(() => ({
      heading: document.querySelector('h1')?.textContent?.trim() ?? null,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      price: !!document.querySelector('.strength-price'),
      addToCart: [...document.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Add to cart'),
    }))
    if (route === '/explore' && (result.price || result.addToCart)) errors.push('Unverified commerce control on Explore')
    if (!response?.ok() || !result.heading || result.overflow || errors.length) failures++
    console.log(width, route, response?.status(), JSON.stringify(result), errors)
    if (['/watchlist', '/targets', '/research-tools/preclinical-calculator'].includes(route)) {
      await page.screenshot({ path: `shots/research-${width}-${route.slice(1).replaceAll('/', '-')}.png` })
    }
    page.off('pageerror', onError)
  }
  if (width === 1440) {
    await page.goto(base + '/targets', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.getByRole('button', { name: /GLP-1R/ }).click()
    await page.getByRole('button', { name: /GCGR/ }).click()
    const matches = await page.locator('.research-target-result strong').allTextContents()
    if (!matches.includes('GLP3') || !matches.includes('Mazdutide') || matches.includes('Semaglutide')) { console.error('Target intersection mismatch', matches); failures++ }
    await page.goto(base + '/research-tools/preclinical-calculator', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.locator('#compound-stock-mass').fill('5')
    await page.locator('#research-diluent-volume').fill('1')
    await page.locator('#mouse-body-mass').fill('25')
    await page.locator('#target-dose').fill('2')
    await page.locator('#number-of-animals').fill('10')
    await page.locator('#number-of-administrations').fill('3')
    const text = await page.locator('.calculator-results').innerText()
    for (const expected of ['5 mg/mL', '0.05 mg', '10 µL', '0.3 mL', '1.5 mg']) if (!text.includes(expected)) { console.error('Calculator missing', expected, text); failures++ }
    await page.goto(base + '/compound/wolverine-blend')
    if (!page.url().includes('/combinations')) { console.error('Legacy stack route did not redirect'); failures++ }
  }
  await page.close()
}
await browser.close()
if (failures) process.exitCode = 1
