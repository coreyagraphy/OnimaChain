import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const res = {}
for (const [tag, w, h] of [['desk', 1440, 900], ['mob', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob', acceptDownloads: true })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1'); localStorage.removeItem('bond-theory-picks') } catch {} })
  await p.goto(base + '/bond-theory', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500)
  await p.screenshot({ path: `shots/bond-${tag}-empty.png` })
  await p.getByRole('button', { name: 'Choose peptides' }).first().click(); await p.waitForTimeout(400)
  const search = p.getByPlaceholder('Name or other name…')
  for (const term of ['BPC-157', 'TB-500', 'GHK-Cu']) { await search.fill(term); await p.waitForTimeout(250); await p.locator('.stage-feature').first().click(); await p.waitForTimeout(250) }
  await search.fill('Bepecin'); await p.waitForTimeout(250); await p.locator('.stage-feature').first().click(); await p.waitForTimeout(250)
  const dup = await p.getByText('You already picked this one.').first().isVisible().catch(() => false)
  await p.getByRole('button', { name: 'Done', exact: true }).click(); await p.waitForTimeout(3500)
  await p.screenshot({ path: `shots/bond-${tag}-three.png` })
  const chips1 = await p.locator('.bond-chip').count()
  await p.getByRole('button', { name: 'Remove GHK-Cu' }).click(); await p.waitForTimeout(300)
  const chips2 = await p.locator('.bond-chip').count()
  await p.getByRole('button', { name: 'Undo' }).click(); await p.waitForTimeout(300)
  const chips3 = await p.locator('.bond-chip').count()
  const answers = {}
  for (const qn of ['What might they do?', 'Do they do similar things?', 'Have they been studied together?', 'What don’t we know?', 'See the studies']) {
    await p.getByRole('button', { name: qn }).click(); await p.waitForTimeout(500)
    answers[qn] = (await p.locator('[role=region]').first().innerText()).replace(/\s+/g, ' ').slice(0, 230)
    if (qn === 'Have they been studied together?') await p.locator('[role=region]').first().screenshot({ path: `shots/bond-${tag}-together.png` })
  }
  await p.getByRole('button', { name: 'Save your picks' }).click()
  const savedPicks = await p.evaluate(() => localStorage.getItem('bond-theory-picks'))
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Download your summary' }).click()])
  const dlPath = `shots/bond-${tag}-summary.txt`; await dl.saveAs(dlPath)
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
  res[tag] = { duplicateNotice: dup, chips: [chips1, chips2, chips3], savedPicks, overflow, errors: errs.length ? errs : 'none', ...(tag === 'desk' ? { answers } : {}) }
  await ctx.close()
}
console.log(JSON.stringify(res, null, 1))
await b.close()
