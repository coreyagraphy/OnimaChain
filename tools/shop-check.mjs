import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const res = {}
const clipped = (p) => p.evaluate(() => {
  // any visible text that runs past the right edge of the screen (clipped by an overflow:hidden parent)
  const out = []
  for (const el of document.querySelectorAll('h1,h2,h3,p,dd,dt,span,a,button,li')) {
    if (el.children.length) continue
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    if (!r.width || cs.visibility === 'hidden' || +cs.opacity < 0.1 || r.bottom < 0 || r.top > innerHeight * 3) continue
    if (el.closest('.ticker,.pulse-rail,.orbit-stage,.pulse-tabs,.research-tabs,.shop-bar,[aria-hidden="true"],.deck-card:not(.deck-top)')) continue
    if (r.right > innerWidth + 1 && el.textContent.trim()) out.push(el.textContent.trim().slice(0, 40))
  }
  return out.slice(0, 6)
})
for (const [tag, w, h] of [['mob', 390, 844], ['desk', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  // shop: products visible on first screen, bar sticky, cards fly in
  await p.goto(base + '/explore', { waitUntil: 'networkidle' }); await p.waitForTimeout(1800)
  res[tag + '_firstCardTop'] = Math.round(await p.locator('.shop-card').first().evaluate((e) => e.getBoundingClientRect().top))
  res[tag + '_cardsInOnLoad'] = await p.locator('.shop-card[data-in]').count()
  await p.screenshot({ path: `shots/shop-${tag}.png` })
  await p.evaluate(() => window.scrollTo(0, 1800)); await p.waitForTimeout(900)
  res[tag + '_barStickyTop'] = Math.round(await p.locator('.shop-bar').evaluate((e) => e.getBoundingClientRect().top))
  res[tag + '_cardsInAfterScroll'] = await p.locator('.shop-card[data-in]').count()
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  await p.locator('.shop-select select').first().selectOption('cognitive'); await p.waitForTimeout(1500)
  res[tag + '_filtered'] = await p.locator('[role=status]').first().innerText()
  // quick view: 3D scene, hint, beacon beside the price
  await p.locator('.shop-card').first().getByRole('button', { name: 'Quick view' }).click(); await p.waitForTimeout(2500)
  res[tag + '_quickCanvas'] = await p.locator('.quick-view-scene canvas').count()
  res[tag + '_hint'] = await p.locator('.quick-view .move-hint').innerText()
  const price = await p.locator('.quick-price-row').evaluate((row) => { const a = row.children[0].getBoundingClientRect(), b = row.children[1].getBoundingClientRect(); return { sameRow: Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) < 30, beacon: getComputedStyle(row.children[1]).animationName } })
  res[tag + '_beaconBesidePrice'] = price
  await p.locator('.quick-view').screenshot({ path: `shots/quick-${tag}-a.png` })
  await p.waitForTimeout(4200) // into the burst
  await p.locator('.quick-view').screenshot({ path: `shots/quick-${tag}-burst.png` })
  const box = await p.locator('.quick-view-scene').boundingBox()
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(700)
  res[tag + '_hintHiddenAfterDrag'] = await p.locator('.quick-view .move-hint[data-hidden]').count()
  res[tag + '_quickNameClipped'] = await p.locator('.quick-view h2').evaluate((e) => e.scrollWidth > e.clientWidth + 1)
  await p.keyboard.press('Escape')
  // product pages with long names
  for (const slug of ['cerebrolysin', 'follistatin-344', 'thymosin-alpha-1', 'wolverine-blend', 'kisspeptin-10']) {
    await p.goto(base + '/compound/' + slug, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
    const c = await clipped(p)
    res[`${tag}_${slug}_clipped`] = c.length ? c : 'none'
    if (slug === 'cerebrolysin') { await p.screenshot({ path: `shots/product-${tag}-cerebrolysin.png` }); res[tag + '_viewerHint'] = await p.locator('#structure .move-hint').innerText().catch(() => 'missing') }
  }
  res[tag + '_errors'] = errs
  await ctx.close()
}
console.log(JSON.stringify(res, null, 1)); await b.close()
