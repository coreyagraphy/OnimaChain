import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const slugs = [...readFileSync('src/data/compounds.ts', 'utf8').matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
const b = await chromium.launch({ channel: 'chrome' })
const p = await (await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })).newPage()
await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
const bad = {}
for (const s of slugs) {
  await p.goto(base + '/compound/' + s, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(700)
  const c = await p.evaluate(() => { const out = []; for (const el of document.querySelectorAll('header h1, header p, header dd, header dt, header a, header button, header span')) { if (el.children.length) continue; const r = el.getBoundingClientRect(); if (!r.width || r.top > innerHeight * 2.5) continue; if (el.closest('#structure')) continue; if (r.right > innerWidth + 1 || r.left < -1) out.push(el.textContent.trim().slice(0, 30)) } return out })
  if (c.length) bad[s] = c
}
console.log(slugs.length, 'product pages at 375px;', Object.keys(bad).length ? 'CLIPPED: ' + JSON.stringify(bad) : 'no clipped text'); await b.close()
