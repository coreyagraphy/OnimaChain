// Screenshot the flagship views at desktop + mobile. Usage: node tools/shots.mjs [baseUrl]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] })
const views = [['desk', 1440, 900], ['mob', 390, 844]]
const routes = [
  ['home', '/', [0, 0.35, 0.62, 0.92, 1.0]],
  ['dossier', '/compound/bpc-157', [0]],
  ['dossier-scrolled', '/compound/bpc-157', [0.55]],
  ['claim', '/claim/CLAIM-BPC157-TENDON-REPAIR', [0, 0.18, 0.33]],
  ['signal', '/signal', [0]],
  ['timeline', '/timeline', [0]],
  ['compare', '/compare', [0]],
  ['explore', '/explore', [0]],
]
for (const [tag, w, h] of views) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  for (const [name, path, fracs] of routes) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(4200)
    for (const f of fracs) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
      const y = name === 'home' ? Math.round(f * innerHeightPx(h) * 1.5) : Math.round(f * total)
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      await page.waitForTimeout(2600)
      await page.screenshot({ path: `shots/${name}-${String(Math.round(f * 100)).padStart(3, '0')}-${tag}.png` })
    }
  }
  console.log(tag, 'errors:', errs.length ? errs.slice(0, 8) : 'none')
  await ctx.close()
}
function innerHeightPx(h) { return h }
await browser.close()
