import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const res = {}
for (const [tag, w, h] of [['desk', 1440, 900], ['mob', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob', acceptDownloads: true })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1'); localStorage.removeItem('bond-theory-picks'); localStorage.removeItem('bond-theory-goals') } catch {} })
  await p.goto(base + '/bond-theory', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  await p.locator('.goal-input').fill('bad knee, bloating after meals and I want better skin')
  await p.waitForTimeout(300)
  res[tag + '_goals'] = await p.locator('.goal-chip[aria-pressed=true]').allInnerTexts()
  await p.locator('.goal-panel').screenshot({ path: `shots/bond2-${tag}-goals.png` })
  // add the strongest match for the first two goals
  const groups = p.locator('.match-group')
  await groups.nth(0).locator('.match-row').nth(0).getByRole('button', { name: 'Add to stack' }).click()
  await groups.nth(0).locator('.match-row').nth(1).getByRole('button', { name: 'Add to stack' }).click()
  await groups.nth(2).locator('.match-row').nth(0).getByRole('button', { name: 'Add to stack' }).click()
  await p.waitForTimeout(400)
  await groups.nth(0).screenshot({ path: `shots/bond2-${tag}-matches.png` })
  res[tag + '_picks'] = await p.locator('.bond-chip').allInnerTexts()
  await p.waitForTimeout(2500)
  await p.locator('.stack-card').scrollIntoViewIfNeeded(); await p.waitForTimeout(600)
  await p.locator('.stack-card').screenshot({ path: `shots/bond2-${tag}-card.png` })
  res[tag + '_together'] = (await p.locator('.stack-together').innerText()).replace(/\s+/g, ' ').slice(0, 500)
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }).catch(() => null), p.getByRole('button', { name: 'Save as picture' }).click()])
  if (dl) { await dl.saveAs(`shots/bond2-${tag}-export.png`); res[tag + '_export'] = dl.suggestedFilename() } else res[tag + '_export'] = 'none'
  res[tag + '_overflowX'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  res[tag + '_errors'] = errs
  await ctx.close()
}
console.log(JSON.stringify(res, null, 1)); await b.close()
