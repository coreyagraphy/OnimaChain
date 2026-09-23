import assert from 'node:assert/strict'
import { join } from 'node:path'
import test from 'node:test'
import { chromium } from 'playwright'

const base = process.env.ACCOUNT_TEST_URL ?? 'http://127.0.0.1:8080'

async function openAccount(width) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 1000 } })
  await page.goto(`${base}/account`, { waitUntil: 'networkidle' })
  const ageButton = page.getByRole('button', { name: /yes, i’m 21 or older/i })
  if (await ageButton.isVisible()) await ageButton.click()
  return { browser, page }
}

for (const width of [390, 1440]) {
  test(`account entry renders at ${width}px`, async () => {
    const { browser, page } = await openAccount(width)
    try {
      assert.equal(await page.getByRole('heading', { name: /one identity/i }).isVisible(), true)
      assert.equal(await page.getByRole('tab', { name: 'Sign in' }).isVisible(), true)
      assert.equal(await page.getByRole('tab', { name: 'Create account' }).isVisible(), true)
      await page.getByRole('tab', { name: 'Create account' }).click()
      assert.equal(await page.getByLabel('Full name').isVisible(), true)
      assert.equal(await page.getByLabel('Email address').isVisible(), true)
      assert.equal(await page.getByLabel('Password').isVisible(), true)
      assert.equal(await page.getByRole('button', { name: 'Create account' }).isVisible(), true)
      if (width === 1440) await page.screenshot({ path: join(process.env.TEMP ?? '.', 'onimachain-account.png'), fullPage: true })
    } finally {
      await browser.close()
    }
  })
}
