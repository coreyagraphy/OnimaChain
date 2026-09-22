import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { LESSONS } from '../src/data/lessons.ts'

const base = process.env.LEARN_TEST_URL ?? 'http://127.0.0.1:8083'
let browser

before(async () => { browser = await chromium.launch({ channel: 'chrome' }) })
after(async () => { await browser?.close() })

async function open(path, width = 1440, height = 900) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  assert.equal(response?.status(), 200)
  return { page, errors }
}

test('Learn landing explains itself, exposes ten distinct previews, and filters categories', async () => {
  const { page, errors } = await open('/learn')
  try {
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /research really says/i)
    assert.equal(await page.locator('.learn-card').count(), 10)
    assert.equal(await page.locator('.learn-card .lab-visual').count(), 10)
    assert.equal(await page.locator('.learn-card .learn-status--live').count(), 1)
    await page.getByRole('button', { name: /Biology/ }).click()
    assert.equal(await page.locator('.learn-card').count(), 1)
    await page.getByRole('button', { name: /All topics/ }).click()
    assert.equal(await page.locator('.learn-card').count(), 10)
    await page.getByRole('slider', { name: 'Move through the example' }).fill('4')
    assert.match(await page.locator('.learn-instrument-body').innerText(), /works for everyone/i)
    if (process.env.LEARN_DESKTOP_SHOT) await page.screenshot({ path: process.env.LEARN_DESKTOP_SHOT, fullPage: true })
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Forming lesson has useful teaser, response, source, and back path', async () => {
  const { page, errors } = await open('/learn/what-in-vitro-means')
  try {
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Cells in a dish/)
    await page.getByRole('button', { name: /A change in cells/ }).click()
    assert.match(await page.getByRole('status').innerText(), /keeps the evidence/i)
    assert.ok(await page.getByRole('link', { name: /NCI definition/ }).isVisible())
    if (process.env.LEARN_PREVIEW_SHOT) await page.screenshot({ path: process.env.LEARN_PREVIEW_SHOT })
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Live sourced interaction remains and mobile has no horizontal overflow', async () => {
  const { page, errors } = await open('/learn/how-internet-claims-mutate', 390, 844)
  try {
    assert.ok(await page.getByText('Watch the wording change.').isVisible())
    assert.ok(await page.getByRole('link', { name: /Original BPC-157 tendon study/ }).isVisible())
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Landing is readable without horizontal overflow on narrow mobile', async () => {
  for (const width of [320, 360, 390]) {
    const { page, errors } = await open('/learn', width, 780)
    try {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}px overflow`)
      assert.ok(await page.getByRole('link', { name: /Start with the viral claim lesson/ }).isVisible())
      if (width === 360 && process.env.LEARN_MOBILE_SHOT) await page.screenshot({ path: process.env.LEARN_MOBILE_SHOT })
      assert.deepEqual(errors, [])
    } finally { await page.close() }
  }
})

test('Every lesson route has its own title, overview, source, and usable content', async () => {
  const { page, errors } = await open('/learn')
  try {
    for (const lesson of LESSONS) {
      const response = await page.goto(`${base}/learn/${lesson.slug}`, { waitUntil: 'networkidle' })
      assert.equal(response?.status(), 200, lesson.slug)
      assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), lesson.title)
      assert.ok(await page.getByText(lesson.lessonGoal, { exact: true }).isVisible(), lesson.slug)
      assert.ok(await page.locator('.learn-sources li').count() >= 1, lesson.slug)
      if (lesson.status !== 'live') assert.equal(await page.locator('.learn-options button').count(), 2, lesson.slug)
    }
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})
