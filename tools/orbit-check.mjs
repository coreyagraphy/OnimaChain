import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const out = {}
for (const [tag, w, h] of [['desk', 1440, 900], ['mob', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  const sec = p.locator('section[aria-label="Featured compounds"]')
  await sec.scrollIntoViewIfNeeded(); await p.evaluate(() => { const s = document.querySelector('section[aria-label="Featured compounds"]'); window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 40) })
  await p.waitForTimeout(2500)
  await p.screenshot({ path: `shots/orbit-${tag}-a.png` })
  const pos = () => p.$$eval('.orbit-card', (els) => els.map((e) => Math.round(parseFloat(e.style.transform.slice(12)))))
  const a = await pos(); await p.waitForTimeout(1500); const bpos = await pos()
  out[tag + '_drifts'] = a[0] !== bpos[0]
  await p.waitForTimeout(1500); await p.screenshot({ path: `shots/orbit-${tag}-b.png` })
  if (tag === 'desk') {
    const card = p.locator('.orbit-card').nth(2); const box = await card.boundingBox()
    await p.mouse.move(box.x + box.width / 2, box.y + 120); await p.waitForTimeout(1500)
    const s1 = await pos(); await p.waitForTimeout(800); const s2 = await pos()
    out.hover_stops = Math.abs(s1[0] - s2[0]) <= 1
    await p.locator('.liquid-glass').first().hover(); await p.waitForTimeout(500)
    await p.locator('.liquid-glass').first().screenshot({ path: 'shots/orbit-glass.png' })
    await p.locator('.atmo-title').screenshot({ path: 'shots/orbit-title.png' })
  }
  out[tag + '_font'] = await p.$eval('.atmo-title', (e) => getComputedStyle(e).fontFamily)
  out[tag + '_overflowX'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  out[tag + '_titleFits'] = await p.$eval('.atmo-title', (e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth })
  out[tag + '_errors'] = errs
  await ctx.close()
}
console.log(JSON.stringify(out, null, 1)); await b.close()
