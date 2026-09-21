// Renders the hero poster (LCP image + reduced-motion fallback) from the real scene at STATE 1.
// The poster is the same sequence-derived BPC-157 structure the live scene draws; nothing unrelated is shown.
import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://127.0.0.1:8082'
const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist'] })
for (const [name, w, h] of [['hero', 1440, 900], ['hero-portrait', 780, 1400]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  await p.goto(base + '/?quality=high', { waitUntil: 'networkidle' })
  await p.addStyleTag({ content: 'section[aria-label="Hero"] > *:not(div:first-of-type):not(img) { visibility: hidden !important } .hero-veil { display: none !important } header, nav { display: none !important }' })
  await p.waitForTimeout(5200)
  await p.screenshot({ path: `public/posters/${name}.jpg`, type: 'jpeg', quality: 84, clip: { x: 0, y: 0, width: w, height: h } })
  await p.close()
}
await b.close()
console.log('posters written')
