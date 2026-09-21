// Every route at desktop + phone: console/page errors, horizontal overflow, backdrop present, screenshot.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
mkdirSync('shots/sweep', { recursive: true })
const routes = ['/', '/explore', '/explore?topic=longevity', '/compound/bpc-157', '/compound/ghk-cu', '/compound/wolverine-blend', '/claim/CLAIM-BPC157-TENDON-REPAIR', '/claims', '/signal', '/learn', '/learn/how-internet-claims-mutate', '/bond-theory', '/pulse', '/pulse?c=tirzepatide', '/pulse/review', '/compare', '/timeline', '/methodology', '/coverage', '/corrections', '/status/bpc-157', '/study/21030672', '/saved', '/about', '/contact', '/privacy', '/terms', '/nope-404']
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const rows = []
for (const [tag, w, h] of [['desk', 1440, 900], ['mob', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const p = await ctx.newPage()
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  for (const r of routes) {
    const errs = []
    const onErr = (e) => errs.push(String(e).slice(0, 100)); const onCon = (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 100)) }
    p.on('pageerror', onErr); p.on('console', onCon)
    await p.goto(base + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(1600)
    const info = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, h1: document.querySelector('h1')?.textContent?.trim().slice(0, 40) ?? '(no h1)', backdrop: !!document.querySelector('.depth-backdrop') }))
    await p.screenshot({ path: `shots/sweep/${tag}${r.replace(/[\/?=]/g, '_') || '_home'}.png` })
    rows.push({ tag, r, ...info, errors: errs.length })
    p.off('pageerror', onErr); p.off('console', onCon)
  }
  await ctx.close()
}
await b.close()
for (const x of rows) console.log(`${x.tag.padEnd(4)} ${x.r.padEnd(38)} overflow=${x.overflow ? 'YES' : 'no '} errors=${x.errors} backdrop=${x.backdrop ? 'y' : 'n'}  h1="${x.h1}"`)
