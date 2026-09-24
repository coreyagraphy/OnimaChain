import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
const base = process.env.PART_A_BASE_URL || 'http://127.0.0.1:8080'
await mkdir('test-results/redesign', { recursive: true })
const browser = await chromium.launch({ headless: true })
const errors = []
let failed = 0
function check(ok, label) { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) failed++ }
try {
  for (const [name, width, height, motion] of [['desktop',1440,1000,'no-preference'],['phone',390,844,'no-preference'],['reduced',390,844,'reduce']]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: motion })
    page.on('pageerror', e => errors.push(name + ': ' + e.message))
    await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
    for (const [label, route] of [['learn','/learn'],['claims','/claims'],['scale','/observatory?station=scale'],['report','/observatory?station=report'],['constellation','/observatory?station=constellation'],['history','/observatory?station=history'],['molecule','/observatory?station=molecule'],['explore','/explore']]) {
      await page.goto(base + route)
      await page.waitForTimeout(motion === 'reduce' ? 500 : 1700)
      await page.evaluate(() => document.fonts.ready)
      if (label === 'scale') {
        await page.getByRole('button', { name: 'Cell', exact: true }).click()
        check(await page.getByRole('button', { name: 'Cell', exact: true }).getAttribute('aria-pressed') === 'true', name + ' size scene responds to selection')
        if (motion !== 'reduce') {
          await page.locator('.discovery-canvas canvas').waitFor({ state: 'attached', timeout: 30000 })
          await page.waitForTimeout(800)
          check(await page.locator('.discovery-canvas canvas').count() === 1, name + ' live 3D size scene')
        }
      }
      if (label === 'molecule') {
        await page.getByRole('button', { name: /Example 1: .* at position 2$/ }).click()
        await page.waitForFunction(()=>document.querySelector('.residue-readout')?.textContent?.includes('position 2'))
        check(true, name + ' molecule sequence controls update linked selection')
      }
      if (['report','constellation','history'].includes(label)) {
        const controls = page.locator('.discovery-controls button')
        await controls.nth(1).click()
        check(await controls.nth(1).getAttribute('aria-pressed') === 'true', name + ' ' + label + ' selection updates')
        if (motion !== 'reduce') {
          const canvas = page.locator('.discovery-canvas canvas')
          await canvas.waitFor({ state: 'attached', timeout: 30000 })
          await canvas.scrollIntoViewIfNeeded()
          await page.waitForTimeout(800)
          check(await canvas.count() === 1, name + ' ' + label + ' live scene')
          await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
          check(await page.locator('.discovery-stage').getAttribute('data-paused') === 'true', name + ' ' + label + ' motion pauses')
        }
      }
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), name + ' ' + label + ' no horizontal overflow')
      await page.screenshot({ path: 'test-results/redesign/' + name + '-' + label + '.png', fullPage: label === 'learn' })
    }
    await page.goto(base + '/')
    await page.waitForTimeout(1800)
    check(await page.locator('.activity-door').count() === 6, name + ' homepage exposes all six activities')
    await page.screenshot({ path: 'test-results/redesign/' + name + '-home.png' })
    await page.close()
  }
  check(errors.length === 0, 'no browser runtime errors')
  if (errors.length) console.log(errors)
} finally { await browser.close() }
if (failed) process.exitCode = 1
