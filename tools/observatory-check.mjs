import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
await mkdir('test-results/observatory', { recursive: true })
const b = await chromium.launch(),
  errors = []
try {
  for (const [name, width, motion] of [
    ['desktop', 1440, 'no-preference'],
    ['touch-emulated', 390, 'no-preference'],
    ['reduced', 390, 'reduce'],
  ]) {
    const p = await b.newPage({
      viewport: { width, height: 1000 },
      hasTouch: name === 'touch-emulated',
      reducedMotion: motion,
    })
    p.on('pageerror', (e) => errors.push(e.message))
    await p.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
    await p.goto('http://127.0.0.1:8080/observatory')
    await p.waitForTimeout(1500)
    await p.getByRole('heading', { name: 'What is a peptide made of?' }).waitFor()
    await p.getByRole('button', { name: /Example 1: .* at position 3$/ }).click()
    await p.waitForFunction(() =>
      document.querySelector('.residue-readout')?.textContent?.includes('position 3'),
    )
    await p.getByRole('button', { name: 'Compare two molecules' }).click()
    await p.getByLabel('Example 2', { exact: true }).selectOption('glutathione')
    await p.waitForFunction(() =>
      document.querySelector('.workbench-comparison-note')?.textContent?.includes('15 vs 3'),
    )
    if (motion !== 'reduce') {
      await p.getByRole('button', { name: 'Isolate selected blocks' }).click()
      await p.getByRole('button', { name: 'Rotate left' }).click()
      await p.locator('.workbench-stage canvas').waitFor()
    }
    if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2))
      throw Error('overflow ' + name)
    await p.screenshot({ path: `test-results/observatory/${name}.png`, fullPage: true })
    await p.goto('http://127.0.0.1:8080/observatory?station=evidence')
    await p.waitForURL('**/learn?activity=evidence')
    console.log('PASS', name, 'observation, comparison, old lesson redirect')
    await p.close()
  }
  if (errors.length) throw Error(errors.join('\n'))
} finally {
  await b.close()
}
