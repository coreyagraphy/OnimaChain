import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const snap = JSON.parse(readFileSync('public/pulse.json', 'utf8'))
const b = await chromium.launch({ channel: 'chrome' })
const res = {}
for (const [tag, w, h] of [['mob', 390, 844], ['desk', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob', permissions: ['clipboard-read', 'clipboard-write'] })
  const p = await ctx.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  await p.addInitScript((mob) => {
    try { localStorage.setItem('age-gate-21', '1'); if (!sessionStorage.getItem('t')) { localStorage.removeItem('pulse-follow'); sessionStorage.setItem('t', '1') } } catch {}
    // phones: record what the share sheet receives; desktop: no share sheet, so the link is copied
    if (mob) navigator.share = async (d) => { window.__shared = d }
    else Object.defineProperty(navigator, 'share', { value: undefined })
  }, tag === 'mob')
  // /pulse: video thumbs, follow, share, deep link
  await p.goto(base + '/pulse', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
  const lanes = await p.$$eval('.pulse-list .pulse-card .pulse-lane', (els) => els.slice(0, 10).map((e) => e.textContent))
  let maxRun = 1, run = 1; for (let i = 1; i < lanes.length; i++) { run = lanes[i] === lanes[i - 1] ? run + 1 : 1; maxRun = Math.max(maxRun, run) }
  res[tag + '_nowMaxSameInRow'] = maxRun
  await p.getByRole('tab', { name: /Video/ }).click(); await p.waitForTimeout(500)
  res[tag + '_thumbs'] = await p.locator('.pulse-list .pulse-thumb img').count()
  await p.locator('.pulse-list .pulse-card').first().screenshot({ path: `shots/pulse2-${tag}-video.png` })
  await p.getByRole('tab', { name: /^Now/ }).click()
  await p.getByPlaceholder('Search a peptide, e.g. BPC-157').fill('BPC-157'); await p.waitForTimeout(300)
  await p.getByRole('button', { name: /Follow BPC-157/ }).click(); await p.waitForTimeout(200)
  await p.getByPlaceholder('Search a peptide, e.g. BPC-157').fill('')
  await p.getByRole('tab', { name: /Following/ }).click(); await p.waitForTimeout(300)
  res[tag + '_followingCards'] = await p.locator('.pulse-list .pulse-card').count()
  const first = p.locator('.pulse-list .pulse-card').first()
  const id = (await first.getAttribute('id')).slice(2)
  await first.getByRole('button', { name: 'Share this update' }).click(); await p.waitForTimeout(400)
  res[tag + '_share'] = await first.locator('.pulse-share span').innerText()
  const link = tag === 'mob' ? await p.evaluate(() => window.__shared?.url ?? '') : await p.evaluate(() => navigator.clipboard.readText()).catch(() => '')
  res[tag + '_shareLinkOk'] = link.includes('/pulse?e=')
  await p.goto(base + '/pulse?e=' + encodeURIComponent(id), { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
  res[tag + '_deepLinkFirst'] = (await p.locator('.pulse-list .pulse-card').first().getAttribute('id')) === 'e-' + id
  res[tag + '_deepLinkHighlighted'] = await p.locator('.pulse-card-hl').count()
  res[tag + '_overflowPulse'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  // compound page follow button
  await p.goto(base + '/compound/bpc-157', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
  res[tag + '_compoundFollow'] = await p.getByRole('button', { name: /Following BPC-157/ }).count()
  // review queue with the service mocked (it only exists on the deployed site)
  const held = snap.events.slice(0, 2).map((e) => ({ ...e, tier: 'review', conflict: 'A headline says “FDA approved”, but BPC-157 has no FDA-approved use on record.' }))
  let posted = null
  await p.route('**/api/pulse-review', async (route) => {
    const req = route.request()
    if (req.headers().authorization !== 'Bearer test-key') return route.fulfill({ status: 401, body: '{"error":"Wrong or missing review key"}' })
    if (req.method() === 'POST') posted = JSON.parse(req.postData() ?? '{}')
    const waiting = posted?.action === 'approve' ? held.slice(1) : held
    const decided = posted?.action === 'approve' ? [{ ...held[0], reviewed: { action: 'approve', note: posted.note, at: new Date().toISOString() } }] : []
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ generatedAt: snap.generatedAt, runs: snap.runs, waiting, decided, live: snap.events.slice(0, 5) }) })
  })
  await p.goto(base + '/pulse/review', { waitUntil: 'networkidle' }); await p.waitForTimeout(800)
  await p.getByLabel('Review key').fill('wrong'); await p.getByRole('button', { name: 'Open the queue' }).click(); await p.waitForTimeout(500)
  res[tag + '_badKeyRejected'] = await p.getByRole('alert').innerText().catch(() => '')
  await p.getByLabel('Review key').fill('test-key'); await p.getByRole('button', { name: 'Open the queue' }).click(); await p.waitForTimeout(800)
  res[tag + '_waiting'] = await p.locator('.pulse-list .pulse-card').count()
  await p.screenshot({ path: `shots/review-${tag}.png` })
  await p.locator('.pulse-list .pulse-card').first().locator('textarea').fill('Not FDA-approved. Shown so you know what is circulating.')
  await p.locator('.pulse-list .pulse-card').first().getByRole('button', { name: 'Approve' }).click(); await p.waitForTimeout(600)
  res[tag + '_posted'] = posted
  res[tag + '_toast'] = await p.locator('.review-toast').innerText().catch(() => '')
  res[tag + '_waitingAfter'] = await p.locator('.pulse-list .pulse-card').count()
  res[tag + '_reviewSmallTargets'] = await p.$$eval('.review-buttons button, .pulse-tabs button, header .btn', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 40 }).length)
  res[tag + '_overflowReview'] = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  res[tag + '_robots'] = await p.$eval('meta[name=robots]', (m) => m.content).catch(() => 'missing')
  res[tag + '_errors'] = errs
  await ctx.close()
}
console.log(JSON.stringify(res, null, 1)); await b.close()
