import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base = process.env.PART_A_BASE_URL || 'http://127.0.0.1:8080'
const out = new URL('../test-results/part-a/', import.meta.url)
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
let failed = 0
function expect(value, name) { console.log(`${value ? 'PASS' : 'FAIL'} ${name}`); if (!value) failed++ }
async function newPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  return page
}
async function visit(page, path) { await page.goto(`${base}${path}`); await page.waitForTimeout(500) }
try {
  const page = await newPage(1440, 900)
  await visit(page, '/learn')
  await page.screenshot({ path: fileURLToPath(new URL('learn-desktop.png', out)), fullPage: true })
  expect(await page.getByRole('link', { name: /Enter station/i }).count() === 6, 'Learning Lab links to six stations')

  await visit(page, '/observatory?station=evidence')
  for (const correctIndex of [1, 1, 1, 1]) {
    await page.locator('.obs-options button').nth(correctIndex).click()
    expect(await page.getByText('You got it. That matches the study.').isVisible(), 'Evidence Worlds gives correct-answer feedback')
    if (await page.getByRole('button', { name: 'Next case' }).count()) await page.getByRole('button', { name: 'Next case' }).click()
  }
  expect(await page.getByText('All 4 missions complete.', { exact: false }).isVisible(), 'Evidence Worlds completes all missions')
  await page.getByRole('button', { name: 'Try the four challenges again' }).click()
  expect(await page.getByText('CASE 1 / 4', { exact: false }).isVisible(), 'Evidence Worlds replay resets progress')

  await visit(page, '/observatory?station=scale')
  await page.getByRole('button', { name: 'Move Molecular feature · nanometres up' }).click()
  await page.getByRole('button', { name: 'Move Molecular feature · nanometres up' }).click()
  await page.getByRole('button', { name: 'Move Cell · micrometres up' }).click()
  await page.getByRole('button', { name: 'Move Tissue sample · millimetres up' }).click()
  await page.getByRole('button', { name: /Check the order/ }).click()
  expect(await page.getByText('Exactly. Nanometres', { exact: false }).isVisible(), 'Scale Lab checks a completed size order')

  await visit(page, '/observatory?station=report')
  await page.getByRole('button', { name: 'Purity', exact: true }).click()
  expect(await page.getByText('96% describes the main peak', { exact: false }).isVisible(), 'Report Detective reveals the purity limitation')
  await page.getByRole('button', { name: /These tests do not tell us/ }).click()
  expect(await page.getByText('Exactly. An analytical field', { exact: false }).isVisible(), 'Report Detective checks report scope')
  await page.screenshot({ path: fileURLToPath(new URL('report-desktop.png', out)), fullPage: true })

  await visit(page, '/observatory?station=constellation')
  for (let i = 0; i < 3; i++) {
    await page.locator('.obs-report-node').nth(i).click()
    await page.getByRole('button', { name: /Connect to Experiment A/ }).click()
  }
  expect(await page.getByText('Three reports, one underlying experiment.', { exact: false }).isVisible(), 'Constellation traces three reports to one experiment')

  await visit(page, '/explore')
  const trigger = page.getByRole('button', { name: /Inspect model/ }).first()
  await trigger.click()
  expect(await page.getByRole('dialog', { name: /research preview/ }).isVisible(), 'Research quick view opens')
  await page.keyboard.press('Escape')
  expect(await page.getByRole('dialog', { name: /research preview/ }).count() === 0, 'Quick view closes on Escape')
  expect(await trigger.evaluate(element => element === document.activeElement), 'Quick view restores keyboard focus')

  await page.keyboard.press('Control+k')
  await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('TB-500')
  expect(await page.getByRole('option').count() > 0, 'Search returns identity results')
  await page.getByRole('option').first().getByRole('button').click()
  expect(new URL(page.url()).pathname === '/compound/tb-500', 'Search result opens the corrected identity profile')

  await visit(page, '/contact')
  expect(await page.getByText('Editorial intake is pending release.', { exact: false }).isVisible(), 'Contact intake remains release-gated')
  expect(await page.locator('form').count() === 0, 'No editorial form is shown before configuration')

  const phone = await newPage(390, 844)
  for (const [path, file] of [['/learn', 'learn-mobile.png'], ['/observatory?station=report', 'report-mobile.png'], ['/compound/tb-500', 'tb500-mobile.png']]) {
    await visit(phone, path)
    await phone.screenshot({ path: fileURLToPath(new URL(file, out)), fullPage: true })
    const overflows = await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    expect(!overflows, `${path} fits a 390px viewport`)
  }
  await phone.close()
  await page.close()
} finally { await browser.close() }
console.log(`${failed ? `${failed} browser checks failed` : 'All browser interaction checks passed'}`)
if (failed) process.exitCode = 1
