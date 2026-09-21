// Hero verification: frames across the scroll (desktop + phone), jump/reverse gate check, p95 frame time.
import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
const out = {}
for (const [tag, w, h] of [['desk', 1440, 900], ['mob', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: tag === 'mob', hasTouch: tag === 'mob' })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)))
  await p.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} })
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(3500)
  const span = h * 2.2
  const at = async (f, ms = 1400) => { await p.evaluate((y) => window.scrollTo(0, y), Math.round(f * span)); await p.waitForTimeout(ms) }
  for (const f of [0, 0.2, 0.42, 0.58, 0.64, 0.8, 0.95]) { await at(f); await p.screenshot({ path: `shots/v2-hero-${tag}-${String(Math.round(f * 100)).padStart(3, '0')}.png` }) }
  // gate: jump 20% → 90%, reverse to 45%, stop. Headline must be invisible at 45% and theme lines must not overlap the headline.
  await at(0.2, 300); await at(0.9, 60); await at(0.45, 900)
  const gate = await p.evaluate(() => { const c = document.querySelector('.hero-copy-late'); return c ? Number(getComputedStyle(c).opacity) : -1 })
  await at(0.64, 900)
  const overlap = await p.evaluate(() => Number(getComputedStyle(document.querySelector('.hero-copy-late')).opacity))
  // every theme line fully inside the viewport at 64%
  const fit = await p.evaluate(() => [...document.querySelectorAll('.hero-theme-line')].map((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight }))
  // frame times during a steady pass through the molecule
  const ft = await p.evaluate(async (span) => {
    const times = []; let last = performance.now(); const t0 = last
    await new Promise((res) => { const step = (now) => { times.push(now - last); last = now; const k = (now - t0) / 3000; window.scrollTo(0, span * (0.3 + 0.4 * k)); if (k < 1) requestAnimationFrame(step); else res() }; requestAnimationFrame(step) })
    times.sort((a, b) => a - b); return { p50: +times[Math.floor(times.length * 0.5)].toFixed(1), p95: +times[Math.floor(times.length * 0.95)].toFixed(1), frames: times.length }
  }, span)
  out[tag] = { headlineOpacityAfterJumpBackTo45: gate, headlineOpacityDuringTheme: overlap, themeLinesFullyInFrame: fit, frameMs: ft, errors: errs.length ? errs : 'none' }
  await ctx.close()
}
console.log(JSON.stringify(out, null, 1))
await b.close()
