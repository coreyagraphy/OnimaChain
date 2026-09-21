// Product-page hands-on controls + site-wide backdrop + hero recording (desktop) + phone frames.
import { chromium } from 'playwright'
import { mkdirSync, readdirSync, renameSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
mkdirSync('shots/v5', { recursive: true })
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const res = {}
{ // phone hero + phone product page
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const p = await ctx.newPage(); await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(3500)
  for (const f of [0, 0.3, 0.64]) { await p.evaluate((y) => window.scrollTo(0, y), Math.round(f * 844 * 2.2)); await p.waitForTimeout(1400); await p.screenshot({ path: `shots/v5/mob-hero-${Math.round(f * 100)}.png` }) }
  await p.goto(base + '/compound/ghk-cu', { waitUntil: 'networkidle' }); await p.waitForTimeout(3500)
  await p.screenshot({ path: 'shots/v5/mob-product.png' })
  await p.evaluate(() => window.scrollTo(0, 1400)); await p.waitForTimeout(1500)
  await p.screenshot({ path: 'shots/v5/mob-product-scrolled.png' })
  res.phoneOverflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
  await ctx.close()
}
{ // desktop product controls
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  await p.goto(base + '/compound/bpc-157?quality=high', { waitUntil: 'networkidle' }); await p.waitForTimeout(4200)
  const stage = p.locator('#structure')
  await stage.screenshot({ path: 'shots/v5/stage-default.png' })
  await p.getByRole('button', { name: 'Look closer' }).click(); await p.waitForTimeout(1600)
  await stage.screenshot({ path: 'shots/v5/stage-look-closer.png' })
  await p.getByRole('button', { name: 'Whole view' }).click(); await p.waitForTimeout(1200)
  await p.getByRole('button', { name: 'Move the light' }).click(); await p.waitForTimeout(300)
  const slider = p.getByLabel('Light position around the molecule')
  await slider.fill('5'); await p.waitForTimeout(900); await stage.screenshot({ path: 'shots/v5/stage-light-a.png' })
  await slider.fill('55'); await p.waitForTimeout(900); await stage.screenshot({ path: 'shots/v5/stage-light-b.png' })
  await p.getByRole('button', { name: 'Close', exact: true }).click()
  const whatBtn = p.getByRole('button', { name: 'What is this?' })
  await whatBtn.click(); await p.waitForTimeout(300)
  const firstFeature = p.locator('.stage-feature').first()
  const featureCount = await p.locator('.stage-feature').count()
  if (featureCount) { await firstFeature.click(); await p.waitForTimeout(1600); await stage.screenshot({ path: 'shots/v5/stage-feature.png' }) }
  const explanation = featureCount ? await p.locator('[aria-live="polite"]').first().textContent() : null
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
  const focusBack = await p.evaluate(() => document.activeElement?.textContent)
  await p.getByRole('button', { name: 'Turn it around' }).click(); await p.waitForTimeout(200)
  const doneVisible = await p.getByRole('button', { name: 'Done', exact: true }).isVisible()
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
  const turningAfterEsc = await p.getByRole('button', { name: 'Done turning' }).count()
  await p.getByRole('button', { name: 'Reset view' }).click(); await p.waitForTimeout(1200)
  // site-wide backdrop visible on an inner page
  await p.goto(base + '/terms', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  const backdrop = await p.evaluate(() => { const c = document.querySelector('.depth-backdrop'); return c ? { w: c.width, h: c.height } : null })
  await p.screenshot({ path: 'shots/v5/terms-backdrop.png' })
  res.controls = { featureCount, explanation: explanation?.slice(0, 90), focusReturnedTo: focusBack, doneVisible, turningAfterEsc, backdrop, errors: errs.length ? errs : 'none' }
  await ctx.close()
}
{ // desktop recording: forward, traverse, theme, headline, pause, reverse
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: 'shots/v5', size: { width: 1280, height: 800 } } })
  const p = await ctx.newPage(); await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(3500)
  const span = 800 * 2.2
  await p.mouse.move(640, 400)
  for (let i = 1; i <= 40; i++) { await p.evaluate((y) => window.scrollTo(0, y), (span * i) / 40); await p.mouse.move(640 + Math.sin(i / 4) * 300, 400 + Math.cos(i / 5) * 160); await p.waitForTimeout(140) }
  await p.waitForTimeout(1800)
  for (let i = 40; i >= 14; i--) { await p.evaluate((y) => window.scrollTo(0, y), (span * i) / 40); await p.waitForTimeout(90) }
  await p.waitForTimeout(1200)
  await ctx.close()
  for (const f of readdirSync('shots/v5')) if (f.endsWith('.webm') && !f.startsWith('hero-')) renameSync(`shots/v5/${f}`, 'shots/v5/hero-scroll-v2.webm')
}
console.log(JSON.stringify(res, null, 1))
await b.close()
