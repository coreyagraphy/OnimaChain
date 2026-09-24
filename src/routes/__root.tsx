import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import appCss from '../styles/app.css?url'
import electricCss from '../styles/electric.css?url'
import { Nav } from '~/components/Nav'
import { Footer } from '~/components/Footer'
import { GlobalCanvas } from '~/scenes/Canvas'
import { initVisualMode } from '~/motion/useReducedMotion'
import { startLenis, stopLenis } from '~/motion/lenis'
import { NotFoundFragment } from '~/components/NotFoundFragment'
import { AgeGate } from '~/components/AgeGate'
import { DepthBackdrop } from '~/components/DepthBackdrop'
import { startTilt } from '~/motion/tilt'
import { BRAND, brand } from '~/brand'
import { ReaderQuickView } from '~/components/ReaderQuickView'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${BRAND} — ${brand.primaryTagline}` },
      { name: 'description', content: brand.description },
      { name: 'theme-color', content: '#0A0B0E' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: BRAND },
      { property: 'og:title', content: `${BRAND} — ${brand.primaryTagline}` },
      { property: 'og:description', content: brand.description },
      { property: 'og:image', content: brand.socialImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${BRAND} — ${brand.primaryTagline}` },
      { name: 'twitter:description', content: brand.description },
      { name: 'twitter:image', content: brand.socialImage },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: electricCss },
      { rel: 'icon', type: 'image/png', href: brand.icon },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'preload', as: 'image', href: '/posters/hero.jpg' },
    ],
    scripts: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BRAND,
        description: brand.description,
      }),
    }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center overflow-hidden">
      <NotFoundFragment />
      <div className="wrap relative z-10">
        <p className="label label-cyan mb-4">404 · pathway not found</p>
        <h1 className="display text-[clamp(2.6rem,7vw,6rem)]">This pathway ends here.</h1>
        <p className="lede mt-6 max-w-xl"><b className="text-bone">This page may have moved, or the link may be wrong. You can return to {BRAND} and keep exploring.</b></p>
        <div className="mt-8 flex gap-3">
          <Link to="/explore" className="btn btn-primary">Explore the library</Link>
          <Link to="/" className="btn">Back to {BRAND}</Link>
        </div>
      </div>
    </div>
  )
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const universe = universeFor(pathname)
  useEffect(() => {
    initVisualMode()
    startTilt()
    startLenis()
    // Remove only retired cart and health-goal keys, preserving learning progress.
    for (const key of ['onimachain-commerce-cart-v1', 'ominachain-commerce-cart-v1', 'cyravon-commerce-cart-v1', 'bond-theory-picks', 'bond-theory-goals', 'pulse-last-visit', 'pulse-follow', 'pulse-review-key']) {
      try { window.localStorage.removeItem(key) } catch { /* storage may be unavailable */ }
    }
    return () => stopLenis()
  }, [])
  return (
    <RootDocument>
      <AgeGate />
      <DepthBackdrop />
      <Nav />
      <ReaderQuickView />
      <GlobalCanvas />
      <main className="min-h-screen" data-universe={universe}>
        <Outlet />
      </main>
      <Footer />
    </RootDocument>
  )
}

function universeFor(pathname: string) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/compound/')) return 'molecule'
  if (pathname === '/claims' || pathname.startsWith('/claim/')) return 'lineage'
  if (pathname === '/signal') return 'signal'
  if (pathname === '/compare') return 'compare'
  if (pathname === '/timeline' || pathname === '/corrections' || pathname.startsWith('/status/')) return 'chronology'
  if (pathname === '/explore') return 'atlas'
  if (pathname.startsWith('/learn') || pathname === '/methodology' || pathname === '/coverage') return 'archive'
  return 'quiet'
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
