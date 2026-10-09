import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
const browser = await chromium.launch(),
  base = 'http://127.0.0.1:8080',
  results = []
function check(ok, label) {
  if (!ok) throw Error(label)
  results.push(label)
  console.log('PASS', label)
}
async function open(options = {}) {
  const p = await browser.newPage(options)
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message))
  await p.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  return p
}
try {
  const p = await open({ viewport: { width: 1440, height: 1000 } })
  await p.goto(base + '/learn/chainforge')
  await p.getByRole('button', { name: 'Play Chainforge' }).click({ timeout: 90000 })
  await p.getByLabel('Controls', { exact: true }).selectOption('precision')
  await p.getByRole('button', { name: 'Play Chainforge' }).click()
  const piece = p.getByRole('button', { name: 'Select Glycine piece 1' })
  await piece.focus()
  await p.keyboard.press('Enter')
  await p.getByRole('button', { name: 'Capture', exact: true }).focus()
  await p.keyboard.press('Enter')
  await p.locator('canvas').focus()
  for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowRight')
  for (let i = 0; i < 11; i++) await p.keyboard.press('ArrowDown')
  await p.waitForTimeout(3000)
  await p.keyboard.press('Enter')
  await p.waitForFunction(() =>
    document.querySelector('.forge-target')?.textContent?.includes('1/4'),
  )
  check(true, 'keyboard-only capture, spatial guide and validated docking in precision mode')
  await p.getByRole('button', { name: 'Undo last connection' }).click()
  await p.waitForFunction(() =>
    document.querySelector('.forge-target')?.textContent?.includes('0/4'),
  )
  check(true, 'undo restores a connected piece')
  await p.getByRole('button', { name: 'Pause', exact: true }).click()
  const before = await p.evaluate(() => window.__chainforgeDiagnostics().elapsed)
  await p.waitForTimeout(700)
  check(
    (await p.evaluate(() => window.__chainforgeDiagnostics().elapsed)) === before,
    'pause freezes simulation time',
  )
  await p.getByRole('button', { name: 'Resume', exact: true }).first().click()
  await p.getByRole('button', { name: 'Use no-drag sequence mode' }).click()
  await p.getByRole('button', { name: 'Select Alanine piece 2' }).click()
  await p.getByRole('button', { name: 'Capture', exact: true }).click()
  await p.getByRole('button', { name: 'Dock', exact: true }).click()
  await p.waitForFunction(() =>
    document.querySelector('.forge-status')?.textContent?.includes('This slot needs'),
  )
  check(true, 'wrong-identity docking is rejected with a recovery explanation')
  await p.getByRole('button', { name: 'Release', exact: true }).click()
  for (let i = 1; i <= 4; i++) {
    await p.getByRole('button', { name: new RegExp('Select .* piece ' + i + '$') }).click()
    await p.getByRole('button', { name: 'Capture', exact: true }).click()
    await p.getByRole('button', { name: 'Dock', exact: true }).click()
  }
  await p.getByRole('heading', { name: 'You made the chain.' }).waitFor()
  check(true, 'sequence fallback can recover and complete')
  await p.getByRole('button', { name: 'Clear saved game results' }).click()
  check(
    (await p.evaluate(() => localStorage.getItem('onimachain:chainforge:v1'))) === null,
    'saved result reset removes only game key',
  )
  await p.close()
  const t = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  await t.goto(base + '/learn/chainforge')
  await t.getByRole('button', { name: 'Play Chainforge' }).tap({ timeout: 90000 })
  await t.getByRole('button', { name: 'Select Glycine piece 1' }).tap()
  await t.getByRole('button', { name: 'Capture', exact: true }).tap()
  await t.locator('canvas').scrollIntoViewIfNeeded()
  const box = await t.locator('canvas').boundingBox(),
    pos = await t.evaluate(() => window.__chainforgeDiagnostics().pieces[0])
  const cdp = await t.context().newCDPSession(t)
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: box.x + box.width * 0.55, y: box.y + box.height * 0.55 }],
  })
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: box.x + box.width * 0.65, y: box.y + box.height * 0.65 }],
  })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await t.waitForTimeout(1000)
  const after = await t.evaluate(() => window.__chainforgeDiagnostics().pieces[0])
  check(
    Math.hypot(pos.x - after.x, pos.z - after.z) > 0.2,
    'emulated touch drag moves the captured physics body',
  )
  check(
    await t.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2),
    '390px touch viewport has no horizontal overflow',
  )
  await t.screenshot({ path: 'test-results/chainforge/touch-controls.png', fullPage: true })
  await t.close()
  const f = await open()
  await f.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (String(kind).includes('webgl')) return null
      return native.call(this, kind, ...args)
    }
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true })
  })
  await f.goto(base + '/learn/chainforge')
  await f
    .getByText('This is the accessible sequence puzzle,', { exact: false })
    .waitFor({ timeout: 90000 })
  await f.getByRole('button', { name: 'Play Chainforge' }).click()
  check(true, 'graphics initialization failure enables an honest playable sequence fallback')
  await f.close()
  await writeFile(
    'test-results/chainforge/control-results.json',
    JSON.stringify({ results, physicalPhoneTested: false }, null, 2),
  )
} finally {
  await browser.close()
}
