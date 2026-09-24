import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
await mkdir('test-results/chainforge', { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  recordVideo: { dir: 'test-results/chainforge', size: { width: 1440, height: 1100 } },
})
await context.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
const page = await context.newPage(),
  errors = []
page.on('pageerror', (e) => errors.push(e.message))
const base = 'http://127.0.0.1:8080'
try {
  await page.goto(base + '/learn/chainforge')
  await page.getByRole('button', { name: 'Play Chainforge' }).click({ timeout: 90000 })
  for (const [mission, count] of [
    ['first-connection', 4],
    ['crosscurrent', 6],
    ['sequence-shift', 8],
  ]) {
    if (mission !== 'first-connection') {
      await page.getByLabel('Mission', { exact: true }).selectOption(mission)
      await page.getByRole('button', { name: 'Play Chainforge' }).click()
    }
    for (let i = 0; i < count; i++) {
      await page
        .getByRole('button', { name: new RegExp('Select .* piece ' + (i + 1) + '$') })
        .click()
      await page.getByRole('button', { name: 'Capture', exact: true }).click()
      await page.getByRole('button', { name: 'Guide to slot', exact: true }).click()
      await page.locator('.forge-instrument').scrollIntoViewIfNeeded()
      const x = (i - (count - 1) / 2) * Math.min(1.35, 6.5 / (count - 1))
      await page.waitForFunction(
        ({ i, x }) => {
          const d = window.__chainforgeDiagnostics?.()
          return d && Math.hypot(d.pieces[i].x - x, d.pieces[i].z + 2.65) < 0.5
        },
        { i, x },
        { timeout: 25000 },
      )
      await page.waitForTimeout(600)
      await page.getByRole('button', { name: 'Dock', exact: true }).click()
      console.log('DOCK', mission, i + 1, await page.locator('.forge-status').innerText())
    }
    await page.getByRole('heading', { name: 'You made the chain.' }).waitFor()
    await page.screenshot({ path: `test-results/chainforge/${mission}-complete.png` })
  }
  const diagnostics = await page.evaluate(() => window.__chainforgeDiagnostics())
  const sorted = diagnostics.frames.filter((x) => x > 0).sort((a, b) => a - b)
  const runtime = await page.evaluate(() => {
    const gl = document.querySelector('canvas').getContext('webgl2'),
      ext = gl?.getExtension('WEBGL_debug_renderer_info')
    return {
      userAgent: navigator.userAgent,
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable',
    }
  })
  const report = {
    ...runtime,
    viewport: '1440x1100',
    build: 'local Vite development preview',
    backend: diagnostics.backend,
    frames: sorted.length,
    medianMs: sorted[Math.floor(sorted.length * 0.5)],
    p95Ms: sorted[Math.floor(sorted.length * 0.95)],
    errors,
  }
  await writeFile('test-results/chainforge/performance.json', JSON.stringify(report, null, 2))
  console.log(report)
  await page.getByRole('button', { name: 'Replay this mission' }).click()
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await page.getByRole('heading', { name: 'Take your time.' }).waitFor()
  await page.getByRole('button', { name: 'Resume', exact: true }).first().click()
  await page.evaluate(() => (window.__navigationSentinel = 1))
  await page.getByRole('link', { name: '← Play & Learn', exact: true }).click()
  await page.waitForFunction(() => !window.__chainforgeDiagnostics)
  if (!(await page.evaluate(() => window.__navigationSentinel === 1)))
    throw Error('teardown test performed a full reload')
  console.log('PASS three missions, replay, pause, teardown')
} catch (error) {
  await page.screenshot({ path: 'test-results/chainforge/failure.png' })
  console.log(
    JSON.stringify(
      await page.evaluate(() => {
        const d = window.__chainforgeDiagnostics?.()
        return { ...d, frames: d?.frames.length }
      }),
    ),
  )
  throw error
} finally {
  await context.close()
  await browser.close()
}
