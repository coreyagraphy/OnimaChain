import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500)
const H = await p.evaluate(() => document.documentElement.scrollHeight)
const out = []
for (let y = 0, i = 0; y < 6200 && i < 14; y += 844, i++) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(900)
  await p.screenshot({ path: `shots/mobhome-${String(i).padStart(2, '0')}.png` })
  const words = await p.evaluate(() => { const vis = [...document.querySelectorAll('h1,h2,h3,p,li,a,button,span')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && e.children.length === 0 }); return vis.map((e) => e.textContent.trim()).join(' ').split(/\s+/).filter(Boolean).length })
  const shopBtn = await p.evaluate(() => [...document.querySelectorAll('a')].some((a) => /shop/i.test(a.textContent) && (() => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && +getComputedStyle(a).opacity > 0.5 })()))
  out.push(`screen ${i} (y=${y}): ~${words} words visible, shop link visible: ${shopBtn}`)
}
console.log('page height', H); console.log(out.join('\n')); await b.close()
