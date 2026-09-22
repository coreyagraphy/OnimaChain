import { chromium } from 'playwright'

const base = process.env.MIGRATION_SMOKE_URL ?? 'http://127.0.0.1:8083'
const routes = [
  '/', '/about', '/explore', '/shop', '/claims', '/claim/CLAIM-BPC157-TENDON-REPAIR',
  '/compare', '/timeline', '/signal', '/learn', '/learn/how-internet-claims-mutate',
  '/learn/what-in-vitro-means', '/pulse', '/pulse/review', '/watchlist',
  '/watchlist/zenagamtide', '/targets', '/combinations', '/coa', '/research-tools',
  '/research-tools/preclinical-calculator', '/compound/bpc-157', '/compound/ghk-cu',
  '/status/bpc-157', '/study/21030672', '/bond-theory', '/methodology', '/coverage',
  '/corrections', '/saved', '/waitlist', '/contact', '/privacy', '/terms',
]
const assets = ['/site.webmanifest', '/favicon.png', '/apple-touch-icon.png', '/brand/onimachain-wordmark.webp', '/brand/onimachain-full.webp', '/posters/hero.jpg', '/posters/hero-portrait.jpg', '/pulse.json']
const errors = []
const links = new Set()
const browser = await chromium.launch({ channel: 'chrome' })

try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' })
    await page.addInitScript(() => localStorage.setItem('age-gate-21', '1'))
    let current = ''
    page.on('pageerror', (error) => errors.push(`${width} ${current}: ${error.message}`))
    for (const route of routes) {
      current = route
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' })
      if (response?.status() !== 200) errors.push(`${width} ${route}: HTTP ${response?.status()}`)
      const result = await page.evaluate(() => ({
        heading: document.querySelector('main h1')?.textContent?.trim(),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        overflowing: [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 2 && r.width > 0 }).slice(0, 4).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 70)}`),
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc),
        hrefs: [...document.querySelectorAll('a[href]')].map((link) => link.getAttribute('href')),
      }))
      if (!result.heading) errors.push(`${width} ${route}: no main heading`)
      if (result.overflow) errors.push(`${width} ${route}: horizontal overflow (${result.overflowing.join(', ')})`)
      for (const image of result.brokenImages) errors.push(`${width} ${route}: broken image ${image}`)
      for (const href of result.hrefs) {
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
        try {
          const url = new URL(href, base + route)
          if (url.origin === new URL(base).origin && !url.pathname.startsWith('/api/')) links.add(url.pathname + url.search)
        } catch { errors.push(`${width} ${route}: malformed href ${href}`) }
      }
    }
    await page.close()
    console.log(`${width}px: checked ${routes.length} routes`)
  }
  for (const path of [...links, ...assets]) {
    const response = await fetch(base + path, { redirect: 'follow' }).catch(() => null)
    if (!response?.ok) errors.push(`link/asset ${path}: HTTP ${response?.status ?? 'unavailable'}`)
    else if (response.headers.get('content-type')?.includes('text/html')) {
      const html = await response.text()
      if (html.includes('This pathway ends here.')) errors.push(`link ${path}: not-found page`)
    }
  }
  console.log(`Checked ${links.size} distinct internal links and ${assets.length} required assets.`)
  if (errors.length) {
    for (const error of errors) console.error(error)
    process.exitCode = 1
  } else console.log('Migration route, mobile, image, and internal-link smoke checks passed.')
} finally { await browser.close() }
