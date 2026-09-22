import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const res = {}
for (const [tag, w, h] of [['mob', 390, 844], ['desk', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  await p.evaluate(() => { const s = document.querySelector('.pulse-home'); window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 60) })
  await p.waitForTimeout(2600)
  res[tag + '_deckVisible'] = await p.locator('.pulse-home-deck').isVisible()
  res[tag + '_railVisible'] = await p.locator('.pulse-home-rail').isVisible()
  res[tag + '_ticker'] = await p.locator('.ticker-item').count()
  await p.screenshot({ path: `shots/deck-${tag}-a.png` })
  if (tag === 'mob') {
    const count = () => p.locator('.deck-count b').innerText()
    const c0 = await count()
    const box = await p.locator('.deck-top').boundingBox()
    // swipe left with touch-like pointer drag
    await p.mouse.move(box.x + box.width * 0.7, box.y + 200); await p.mouse.down()
    for (let k = 1; k <= 10; k++) { await p.mouse.move(box.x + box.width * 0.7 - k * 22, box.y + 202); await p.waitForTimeout(16) }
    await p.mouse.up(); await p.waitForTimeout(600)
    const c1 = await count()
    await p.getByRole('button', { name: 'Previous update' }).click(); await p.waitForTimeout(600)
    const c2 = await count()
    res.swipe = `${c0} → swipe left → ${c1} → back → ${c2}`
    res.laneColor = await p.$eval('.pulse-home', (s) => getComputedStyle(s).getPropertyValue('--deck-lane'))
    await p.screenshot({ path: 'shots/deck-mob-b.png' })
    // vertical scroll over the deck still scrolls the page
    const y0 = await p.evaluate(() => scrollY)
    await p.mouse.wheel(0, 300); await p.waitForTimeout(400)
    res.pageScrollsOverDeck = (await p.evaluate(() => scrollY)) > y0
  }
  const ages = await p.evaluate(async () => { const r = await fetch('/pulse.json').then((x) => x.json()); return r.events.map((e) => (Date.now() - new Date(e.primary.publishedAt).getTime()) / 864e5) })
  res[tag + '_oldestInSeedDays'] = Math.round(Math.max(...ages) * 10) / 10
  res[tag + '_overflowX'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  res[tag + '_errors'] = errs
  await ctx.close()
}
console.log(JSON.stringify(res, null, 1)); await b.close()
