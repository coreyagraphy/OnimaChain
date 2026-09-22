import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:8083'
const fast = process.argv.includes('--fast')
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default'] })
const errors = []

for (const [width, height] of [[390, 900], [1440, 900]]) {
  const context = await browser.newContext({ viewport: { width, height } })
  await context.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${base}/explore?quality=low`, { waitUntil: 'networkidle' })
  const card = page.locator('.product-card').filter({ has: page.getByRole('heading', { name: 'AOD-9604', exact: true }) })
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  const activeCards = await page.locator('.product-card .product-molecule[data-render-3d="true"]').count()
  assert.ok(activeCards < 36, `Off-screen cards should not mount 3D scenes; found ${activeCards}`)
  const separation = await card.evaluate((el) => ({ stageBottom: el.querySelector('.product-molecule').getBoundingClientRect().bottom, titleTop: el.querySelector('h3').getBoundingClientRect().top }))
  assert.ok(separation.stageBottom <= separation.titleTop, `Molecule viewport overlaps title at ${width}px: ${JSON.stringify(separation)}`)
  await card.screenshot({ path: `shots/portal-refresh/aod-contained-${width}.png` })
  if (width === 1440) await page.screenshot({ path: 'shots/portal-refresh/shop-contained-1440.png' })

  await page.getByRole('searchbox', { name: 'Search the collection' }).fill('semaglutide')
  const sema = page.locator('.product-card').filter({ has: page.getByRole('heading', { name: 'Semaglutide', exact: true }) })
  await sema.getByRole('button', { name: 'Quick view' }).click()
  const modal = page.getByRole('dialog', { name: /semaglutide quick view/i })
  await modal.locator('canvas').waitFor()
  await page.waitForTimeout(1200)
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
  assert.equal(await page.locator('.product-card .product-molecule[data-render-3d="true"]').count(), 0, 'card scenes pause behind Quick View')
  await modal.screenshot({ path: `shots/portal-refresh/quick-semaglutide-${width}.png` })
  const beforeScroll = await page.evaluate(() => window.scrollY)
  const scene = modal.locator('.quick-view-scene')
  const box = await scene.boundingBox()
  assert.ok(box)
  const x = box.x + box.width * 0.5, y = box.y + box.height * 0.5
  for (let i = 0; i < 8; i++) {
    await page.mouse.move(x - 65, y)
    await page.mouse.down()
    await page.mouse.move(x + 65, y + ((i % 2) ? 25 : -25), { steps: 8 })
    await page.mouse.up()
  }
  await page.mouse.wheel(0, 550)
  await page.waitForTimeout(700)
  assert.equal(await page.evaluate(() => window.scrollY), beforeScroll, `Background scrolled while turning at ${width}px`)
  await modal.screenshot({ path: `shots/portal-refresh/quick-semaglutide-spun-${width}.png` })
  await page.waitForTimeout(fast ? 750 : 25000)
  await modal.screenshot({ path: `shots/portal-refresh/quick-semaglutide-held-${width}.png` })
  await modal.getByRole('button', { name: 'Close', exact: true }).click()
  assert.notEqual(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
  await context.close()
}

assert.deepEqual(errors, [])
await browser.close()
console.log(`Quick View framing, drag isolation, ${fast ? 'short' : '25-second'} persistence, and card-title separation passed at 390px and 1440px.`)
