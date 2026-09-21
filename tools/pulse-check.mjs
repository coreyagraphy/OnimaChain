import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const res = {}
for (const [tag, w, h] of [['mob', 390, 844], ['desk', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  // home section
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
  await p.locator('.pulse-home').scrollIntoViewIfNeeded(); await p.waitForTimeout(1500)
  res[tag + '_homeCards'] = await p.locator('.pulse-home .pulse-rail-item').count()
  await p.locator('.pulse-home').screenshot({ path: `shots/pulse-${tag}-home.png` })
  const rail = p.locator('.pulse-home .pulse-rail')
  const x0 = await rail.evaluate((el) => el.scrollLeft); await rail.evaluate((el) => el.scrollBy({ left: 400 })); await p.waitForTimeout(600)
  res[tag + '_railScrolls'] = (await rail.evaluate((el) => el.scrollLeft)) > x0
  // /pulse
  await p.goto(base + '/pulse', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  res[tag + '_pulseCards'] = await p.locator('.pulse-list .pulse-card').count()
  await p.screenshot({ path: `shots/pulse-${tag}-page.png` })
  await p.getByRole('tab', { name: /Trials/ }).click(); await p.waitForTimeout(300)
  res[tag + '_trialsTab'] = await p.locator('.pulse-list .pulse-card').count()
  await p.getByRole('tab', { name: /This week/ }).click(); await p.waitForTimeout(300)
  res[tag + '_weekly'] = await p.locator('.chain-reaction').isVisible()
  await p.locator('.chain-reaction').screenshot({ path: `shots/pulse-${tag}-week.png` }).catch(() => {})
  await p.getByRole('tab', { name: /^Now/ }).click()
  await p.getByPlaceholder('Search a peptide, e.g. BPC-157').fill('tirzepatide'); await p.waitForTimeout(300)
  res[tag + '_search'] = await p.locator('[role=status]').first().innerText()
  const card = p.locator('.pulse-list .pulse-card').first()
  await card.locator('summary').click(); await p.waitForTimeout(200)
  res[tag + '_why'] = (await card.locator('.pulse-drawer ul').innerText()).replace(/\n/g, ' | ')
  await card.screenshot({ path: `shots/pulse-${tag}-card.png` })
  res[tag + '_overflowPulse'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  // small tap targets on /pulse
  res[tag + '_smallTargets'] = await p.$$eval('.pulse-tabs button, .pulse-read, .pulse-search button, .pulse-heat-grid > button', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 40 }).length)
  // compound page
  await p.goto(base + '/compound/tirzepatide', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  const sec = p.locator('section[aria-labelledby=whatsnew-h]'); await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
  res[tag + '_compoundCards'] = await sec.locator('.pulse-rail-item').count()
  await sec.screenshot({ path: `shots/pulse-${tag}-compound.png` })
  res[tag + '_overflowCompound'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  res[tag + '_errors'] = errs
  await ctx.close()
}
console.log(JSON.stringify(res, null, 1)); await b.close()
