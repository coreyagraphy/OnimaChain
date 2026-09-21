// Evidence for the cinematic brief: screen recording of the hero scroll (forward → traverse → reveal → pause → reverse),
// three peptide environments, a close-up of textured atoms/bonds (still + during movement), mobile, reduced motion,
// WebGL-off fallback, and an fps sample. Usage: node tools/cinematic-evidence.mjs [baseUrl]
import { chromium } from 'playwright'
import { mkdirSync, renameSync, readdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const out = 'shots/evidence'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] })
const gate = async (page) => { await page.evaluate(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} }) }

// 1. recording of the hero
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1440, height: 900 } } })
  const page = await ctx.newPage()
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await gate(page)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(3500)
  const scrollTo = async (y, ms) => { await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'auto' }), y); await page.waitForTimeout(ms) }
  const total = 900 * 2.2
  for (let i = 1; i <= 22; i++) await scrollTo((total * i) / 22, 260)      // forward, steady
  await page.waitForTimeout(1800)                                               // hold on the reading frame
  for (let i = 21; i >= 8; i--) await scrollTo((total * i) / 22, 180)        // reverse into the molecule
  await page.waitForTimeout(1200)                                               // pause mid-structure
  for (let i = 9; i <= 22; i++) await scrollTo((total * i) / 22, 140)        // fast forward again
  await page.waitForTimeout(1500)
  // fps sample at the reading frame and mid-traversal
  const fps = async () => page.evaluate(() => new Promise((res) => { let f = 0; const t0 = performance.now(); const tick = () => { f++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res(Math.round(f / 2)) }; requestAnimationFrame(tick) }))
  const fpsRead = await fps()
  await scrollTo(total * 0.5, 800)
  const fpsMid = await fps()
  await scrollTo(total * 0.5, 300)
  await page.screenshot({ path: `${out}/hero-mid-traversal.png` })
  console.log(JSON.stringify({ viewport: '1440x900', browser: 'Google Chrome (Playwright, ANGLE)', fpsReadingFrame: fpsRead, fpsMidTraversal: fpsMid }))
  await ctx.close()
  for (const f of readdirSync(out)) if (f.endsWith('.webm')) renameSync(`${out}/${f}`, `${out}/hero-scroll-forward-pause-reverse.webm`)
}

// 2. environments + textured close-up (desktop)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await gate(page)
  for (const slug of ['bpc-157', 'ghk-cu', 'pt-141', 'semax']) {
    await page.goto(`${base}/compound/${slug}?quality=high`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(4200)
    await page.screenshot({ path: `${out}/env-${slug}.png` })
  }
  // close-up: zoom the dossier stage by pushing the camera in via a drag + screenshot twice (still, then moving)
  await page.goto(`${base}/compound/bpc-157?quality=high`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4200)
  const stage = page.locator('#structure canvas')
  const box = await stage.boundingBox()
  await page.screenshot({ path: `${out}/closeup-still.png`, clip: { x: box.x + box.width * 0.25, y: box.y + box.height * 0.2, width: box.width * 0.5, height: box.height * 0.55 } })
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2 + 40, { steps: 12 })
  await page.screenshot({ path: `${out}/closeup-moving.png`, clip: { x: box.x + box.width * 0.25, y: box.y + box.height * 0.2, width: box.width * 0.5, height: box.height * 0.55 } })
  await page.mouse.up()
  // keyboard rotation works
  await stage.focus()
  await page.keyboard.press('ArrowRight')
  await ctx.close()
}

// 3. mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await gate(page); await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${out}/mobile-hero-0.png` })
  await page.evaluate(() => window.scrollTo(0, 844 * 1.1)); await page.waitForTimeout(2000)
  await page.screenshot({ path: `${out}/mobile-hero-mid.png` })
  await page.evaluate(() => window.scrollTo(0, 844 * 2.2)); await page.waitForTimeout(2000)
  await page.screenshot({ path: `${out}/mobile-hero-end.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
  await page.goto(`${base}/compound/ghk-cu`, { waitUntil: 'networkidle' }); await page.waitForTimeout(3500)
  await page.screenshot({ path: `${out}/mobile-dossier.png` })
  const rotateBtn = await page.getByRole('button', { name: /Drag (rotates|scrolls)/ }).count()
  console.log(JSON.stringify({ mobileHorizontalOverflow: overflow, rotateModeButtonPresent: rotateBtn > 0 }))
  await ctx.close()
}

// 4. reduced motion + WebGL-off fallback
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await gate(page); await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/reduced-motion-home.png` })
  await ctx.close()
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page2 = await ctx2.newPage()
  await page2.addInitScript(() => { try { localStorage.setItem('age-gate-21', '1') } catch {} ; HTMLCanvasElement.prototype.getContext = () => null })
  await page2.goto(base + '/compound/bpc-157', { waitUntil: 'networkidle' }); await page2.waitForTimeout(2500)
  await page2.screenshot({ path: `${out}/webgl-off-dossier.png` })
  await ctx2.close()
}
await browser.close()
console.log('evidence written to', out)
