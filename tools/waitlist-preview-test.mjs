import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:8083'
const browser = await chromium.launch({ channel: 'chrome' })
const errors = []

for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  const signupRequests = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && /waitlist|forms/i.test(request.url())) signupRequests.push(request.url())
  })
  await page.goto(`${base}/waitlist`, { waitUntil: 'networkidle' })
  assert.equal(await page.getByRole('heading', { name: 'Join the waitlist.' }).count(), 1)
  assert.equal(await page.getByRole('textbox', { name: 'Email address' }).isDisabled(), true)
  assert.equal(await page.getByRole('button', { name: 'Signups paused' }).isDisabled(), true)
  assert.match(await page.locator('#waitlist-status').innerText(), /does not collect or store email addresses/)
  assert.equal(await page.locator('form').count(), 0)
  assert.deepEqual(signupRequests, [])
  await page.screenshot({ path: `shots/portal-refresh/waitlist-${width}.png`, fullPage: true })
  await context.close()
}

assert.deepEqual(errors, [])
await browser.close()
console.log('Waitlist preview renders at 390px and 1440px, with no active form or network submission.')
