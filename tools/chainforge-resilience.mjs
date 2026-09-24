import { chromium } from 'playwright'
const b = await chromium.launch(),
  p = await b.newPage({ viewport: { width: 1440, height: 1000 } }),
  external = [],
  errors = []
p.on('request', (r) => {
  if (!r.url().startsWith('http://127.0.0.1:8080') && !r.url().startsWith('data:'))
    external.push(r.url())
})
p.on('pageerror', (e) => errors.push(e.message))
await p.addInitScript(() => {
  localStorage.setItem('age-gate-21', '1')
  Object.defineProperty(navigator, 'gpu', {
    value: {
      getPreferredCanvasFormat: () => 'bgra8unorm',
      requestAdapter: async () => ({
        features: new Set(),
        limits: {},
        info: {},
        requestDevice: async () => {
          throw Error('Verification: unavailable GPU device')
        },
      }),
    },
    configurable: true,
  })
})
try {
  await p.goto('http://127.0.0.1:8080/learn/chainforge')
  await p.getByRole('button', { name: 'Play Chainforge' }).click({ timeout: 90000 })
  if ((await p.evaluate(() => window.__chainforgeDiagnostics().backend)) !== 'WebGL2')
    throw Error('WebGPU failure did not use WebGL2')
  console.log('PASS rejected WebGPU device falls back to WebGL2')
  await p.getByRole('button', { name: 'Select Alanine piece 2' }).click()
  await p.getByRole('button', { name: 'Capture', exact: true }).click()
  await p.getByRole('button', { name: 'Guide to slot' }).click()
  await p.waitForFunction(() => {
    const p = window.__chainforgeDiagnostics().pieces[1]
    return Math.hypot(p.x + 2.025, p.z + 2.65) < 0.3
  })
  await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Dock', exact: true }).click()
  await p.waitForFunction(() =>
    document.querySelector('.forge-status').textContent.includes('This slot needs'),
  )
  await p.getByRole('button', { name: 'Release', exact: true }).click()
  console.log('PASS wrong piece reaches a real spatial slot, is rejected, and can be released')
  await p.getByLabel('Mission', { exact: true }).selectOption('crosscurrent')
  await p.getByRole('button', { name: 'Play Chainforge' }).click()
  await p.getByRole('button', { name: 'Select Alanine piece 1' }).click()
  await p.getByRole('button', { name: 'Capture', exact: true }).click()
  await p.locator('canvas').focus()
  for (let i = 0; i < 10; i++) await p.keyboard.press('ArrowRight')
  for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowDown')
  await p.waitForFunction(
    () =>
      /\b[1-9]\d* contacts/.test(document.querySelectorAll('.forge-readout>span')[1].textContent),
    {},
    { timeout: 12000 },
  )
  console.log('PASS moving shutter produces native physics contacts')
  if ((await p.locator('canvas').count()) !== 1)
    throw Error('competing background canvas on game route')
  if (external.length) throw Error('external runtime requests: ' + external.join(','))
  if (errors.length) throw Error(errors.join(','))
  console.log('PASS single owned canvas, no external runtime requests or page errors')
} catch (e) {
  console.log(
    await p
      .evaluate(() => ({
        d: window.__chainforgeDiagnostics?.(),
        text: document.querySelector('.forge-readout')?.textContent,
      }))
      .then((x) => ({ ...x, d: { ...x.d, frames: x.d?.frames?.length } })),
  )
  throw e
} finally {
  await b.close()
}
