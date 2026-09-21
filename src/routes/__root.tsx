import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import appCss from '../styles/app.css?url'
import { Nav } from '~/components/Nav'
import { Footer } from '~/components/Footer'
import { GlobalCanvas } from '~/scenes/Canvas'
import { initVisualMode } from '~/motion/useReducedMotion'
import { startLenis, stopLenis } from '~/motion/lenis'
import { NotFoundFragment } from '~/components/NotFoundFragment'
import { BRAND } from '~/brand'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${BRAND} — The Molecular Evidence & Signal Atlas` },
      { name: 'description', content: 'Trace the signal. Follow the evidence. See what research found, what people report, and how the story changed between them.' },
      { name: 'theme-color', content: '#0A0B0E' },
      { property: 'og:title', content: `${BRAND} — Trace the signal. Follow the evidence.` },
      { property: 'og:description', content: 'Explore how molecular research, human reports, and internet claims connect — and where they don’t.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preload', as: 'image', href: '/posters/hero.jpg' },
    ],
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
        <p className="lede mt-6 max-w-xl"><b className="text-bone">The page may have moved, changed state, or never entered the atlas.</b></p>
        <div className="mt-8 flex gap-3">
          <Link to="/explore" className="btn btn-primary">Search the atlas</Link>
          <Link to="/" className="btn">Home</Link>
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
    startLenis()
    return () => stopLenis()
  }, [])
  return (
    <RootDocument>
      <Nav />
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
