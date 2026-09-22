import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://127.0.0.1:8084'
const browser = await chromium.launch({ channel: 'chrome' })
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } })
    await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto(`${base}/compare`, { waitUntil: 'networkidle' })
    await page.locator('select').first().selectOption('zenagamtide')
    await page.locator('select').nth(1).selectOption('cagrisema')
    const comparison = await page.locator('table').innerText()
    assert.match(comparison, /Zenagamtide/)
    assert.match(comparison, /CagriSema/)
    assert.match(comparison, /Cagrilintide.*Semaglutide/)
    assert.match(comparison, /Informational profile/)
    assert.doesNotMatch(comparison, /\$XX\.XX/)

    await page.goto(`${base}/claims`, { waitUntil: 'networkidle' })
    await page.locator('select').selectOption('wolverine-blend')
    assert.match(await page.locator('main').innerText(), /No claims are indexed to this exact record/)
    await page.locator('select').selectOption('bpc-157')
    assert.ok(await page.locator('.neon-card').count() > 0)

    await page.goto(`${base}/timeline`, { waitUntil: 'networkidle' })
    await page.locator('select').selectOption('zenagamtide')
    assert.match(await page.locator('main').innerText(), /Research status snapshot for Zenagamtide/)
    await page.locator('select').selectOption('wolverine-blend')
    assert.doesNotMatch(await page.locator('main').innerText(), /Research status snapshot for Zenagamtide/)

    await page.goto(`${base}/signal`, { waitUntil: 'networkidle' })
    await page.locator('.signal-controls select').first().selectOption('wolverine-blend')
    const nodes = await page.locator('.signal-node:not(.signal-node-core) span').allTextContents()
    assert.deepEqual(nodes.sort(), ['BPC-157', 'TB-500 (Thymosin β4)'].sort())
    await page.locator('.signal-controls select').first().selectOption('zenagamtide')
    await page.getByRole('button', { name: 'Connections', exact: true }).click()
    assert.match(await page.locator('.signal-network').innerText(), /Amylin receptor family/)
    await page.getByRole('button', { name: 'Topic map', exact: true }).click()
    assert.match(await page.locator('.signal-heatmap').innerText(), /Watchlist/)
    assert.match(await page.locator('.signal-heatmap').innerText(), /Combinations/)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    assert.equal(overflow, false, `Signal topic map overflows at ${width}px`)
    assert.deepEqual(errors, [])
    console.log(`Canonical legacy pages passed at ${width}px`)
    await page.close()
  }
} finally {
  await browser.close()
}
