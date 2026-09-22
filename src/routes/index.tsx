import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Hero } from '~/components/Hero'
import { FeaturedOrbit } from '~/components/FeaturedOrbit'
import { LiquidGlassLink } from '~/components/LiquidGlassLink'
import { PulseStream, SinceLastVisit } from '~/components/Pulse'
import { timeAgo, usePulse } from '~/pulse/usePulse'
import { PulseDeck, PulseLine, PulseTicker, usePulseEvents } from '~/components/PulseDeck'
import { COMPOUND_BY_SLUG, COMPOUNDS } from '~/data/compounds'
import { DOMAINS } from '~/data/domains'
import { BRAND, brand } from '~/brand'
import { WATCHLIST } from '~/data/research-entities'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: `${BRAND} — ${brand.primaryTagline}` },
    { name: 'description', content: brand.description },
  ] }),
  component: Home,
})

function Home() {
  return <><Hero /><FeaturedCollection /><EmergingResearch /><ResearchDomains /><PulseHome /><Difference /><MethodPreview /><WaitlistTeaser /><FinalShop /><MobileShopBar /></>
}

function EmergingResearch() { return <section className="section wrap" aria-labelledby="emerging-research-title"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="label label-cyan">Emerging research / not for sale</p><h2 id="emerging-research-title" className="display-md text-[clamp(2rem,4vw,3.8rem)] mt-3">On the horizon.</h2><p className="muted mt-3 max-w-xl">Molecules worth tracking, separated from the core library and from verified inventory.</p></div><Link to="/watchlist" className="btn">See everything we're watching →</Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">{WATCHLIST.slice(0, 4).map((c) => <Link key={c.id} to="/watchlist/$slug" params={{ slug: c.id }} className="panel p-5 block hover:border-cyan/50"><span className="label label-cyan">Watchlist · Informational</span><strong className="display-md text-xl block mt-3">{c.name}</strong><span className="mono text-[10px] text-bone/50 block mt-2">{c.targets.join(' + ')}</span><span className="text-[12px] text-bone/60 block mt-4">{c.stage} · {c.statusAsOf}</span></Link>)}</div></section> }

function WaitlistTeaser() {
  return <section className="waitlist-teaser wrap" aria-labelledby="waitlist-teaser-heading">
    <div><p className="label label-cyan">First access</p><h2 id="waitlist-teaser-heading" className="display-md">A place in line.<br /><span>20% off your first order.</span></h2><p>Opening date to be announced. See the waitlist preview; signups begin after our site move.</p></div>
    <Link to="/waitlist" className="btn btn-primary">View the waitlist <span aria-hidden>↗</span></Link>
  </section>
}

function FeaturedCollection() {
  const featured = ['bpc-157', 'tb-500', 'ghk-cu', 'mots-c', 'pt-141', 'semaglutide', 'semax', 'epitalon'].map((slug) => COMPOUND_BY_SLUG[slug])
  return (
    <section className="section collection-stage" aria-label="Featured compounds">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div><p className="label label-cyan">Featured compounds</p><h2 className="atmo-title mt-4"><span className="atmo-line">Every molecule has</span><span className="atmo-neon"><span className="atmo-glow" aria-hidden>its own atmosphere.</span><span className="atmo-glow atmo-glow-b" aria-hidden>its own atmosphere.</span><span className="atmo-foil">its own atmosphere.</span></span></h2></div>
        <LiquidGlassLink to="/explore">Explore all {COMPOUNDS.length}</LiquidGlassLink>
      </div>
      <FeaturedOrbit compounds={featured} />
    </section>
  )
}

/** Phones: once past the intro, a floating "Shop all" button stays in reach. */
function MobileShopBar() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => {
      const footer = document.querySelector('footer')
      const nearEnd = footer ? footer.getBoundingClientRect().top < window.innerHeight : false
      setShow(window.scrollY > window.innerHeight * 1.2 && !nearEnd)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <div className="mobile-shop-bar" data-show={show ? '1' : undefined} aria-hidden={!show}>
      <LiquidGlassLink to="/explore">Explore all {COMPOUNDS.length} →</LiquidGlassLink>
    </div>
  )
}

function PulseHome() {
  const { snap } = usePulse()
  const events = usePulseEvents(10)
  const [lane, setLane] = useState('#5FE3FF')
  return (
    <section className="section pulse-home" aria-labelledby="pulse-h" style={{ '--deck-lane': lane } as CSSProperties}>
      <div className="pulse-home-glow" aria-hidden />
      <PulseLine />
      <div className="wrap relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="label label-cyan pulse-live-label"><span className="pulse-live" aria-hidden />Live · PulseChain{snap && <span className="pulse-updated">updated {timeAgo(snap.generatedAt)}</span>}</p>
          <h2 id="pulse-h" className="display text-[clamp(2.2rem,5.4vw,4.6rem)] mt-3 leading-[0.98]">The peptide world<br />doesn’t stand still.</h2>
          <p className="lede mt-4 max-w-xl hidden md:block">New papers. Trial changes. Regulatory news. Videos gaining traction. Nothing older than 30 days, checked every 2 hours.</p>
        </div>
        {snap && <SinceLastVisit events={snap.events} />}
      </div>
      <div className="relative mt-6"><PulseTicker events={events} /></div>
      <div className="relative mt-6 pulse-home-deck"><PulseDeck events={events} onLane={setLane} /></div>
      <div className="relative mt-8 pulse-home-rail"><PulseStream limit={10} /></div>
      <div className="wrap relative mt-6"><Link to="/pulse" className="btn">Open PulseChain →</Link></div>
    </section>
  )
}

function Difference() {
  return (
    <section className="section relative overflow-hidden border-y hairline difference-stage">
      <div className="molecular-divider" aria-hidden><i/><i/><i/><i/><i/></div>
      <div className="wrap relative z-10 grid lg:grid-cols-[.75fr_1.25fr] gap-10 items-end">
        <p className="label label-violet">Why this is different</p>
        <div><h2 className="display text-[clamp(3rem,7vw,7.2rem)]">More than a<br/>product page.</h2><p className="lede mt-7 max-w-2xl">Every compound has a story behind it. We organize the published research, show how far it has gone, and keep online reports separate from controlled studies—so you can explore the full picture without digging through dozens of tabs.</p><Link to="/claims" className="btn mt-8">Explore the research</Link></div>
      </div>
    </section>
  )
}

function ResearchDomains() {
  const grid = useRef<HTMLDivElement>(null)
  // Staggered reveal as the grid scrolls in. Transform/opacity only; reduced motion shows everything at once.
  useEffect(() => {
    const el = grid.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { el.dataset.inview = '1'; io.disconnect() }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section className="section wrap" aria-label="Explore by topic">
      <p className="label label-cyan">Explore by topic</p>
      <h2 className="display text-[clamp(2.4rem,5vw,5rem)] mt-3">What are you here for?</h2>
      <p className="lede mt-4 max-w-xl hidden md:block">Seven doors into the collection. Pick one.</p>
      <div ref={grid} className="topic-grid mt-10">
        {DOMAINS.map((d, i) => {
          const count = COMPOUNDS.filter((c) => c.domain === d.id).length
          return (
            <Link key={d.id} to="/explore" search={{ topic: d.id }} className={`topic-card topic-card-${i + 1}`} style={{ '--domain': d.palette.base, '--domain-2': d.palette.accent, '--i': i } as CSSProperties}>
              <span className="topic-img" style={{ backgroundImage: `url(${d.image})` }} aria-hidden />
              <span className="topic-veil" aria-hidden />
              <span className="topic-sheen" aria-hidden />
              <span className="relative z-[2] flex items-center justify-between gap-3">
                <span className="topic-num mono text-[11px] text-bone/55">0{i + 1}</span>
                <span className="topic-count">{count} {count === 1 ? 'peptide' : 'peptides'}</span>
              </span>
              <span className="relative z-[2] mt-auto">
                <strong className="display-md block text-2xl md:text-[1.9rem] leading-tight">{d.name}</strong>
                <span className="topic-tagline block mt-2 text-[14px] text-bone/75 max-w-[30ch]">{d.tagline}</span>
                <span className="topic-cta">See all {count} →</span>
              </span>
            </Link>
          )
        })}
      </div>
      <p className="mt-4 mono text-[11px] text-bone/40">Pictures set the mood. They are not results, and they are not photos of what a product does.</p>
    </section>
  )
}

const METHOD = [
  ['01', 'Find the source', 'We start with the original research whenever we can—not another website repeating it.'],
  ['02', 'Check the record', 'Study titles, publication details, and identifiers are verified before we show them as confirmed research.'],
  ['03', 'Keep stories separate', "What researchers measured and what people say online aren't the same kind of evidence."],
  ['04', 'Show the gaps', "If we haven't checked something yet, we say that. If research stops at animals, we show where it stops."],
]
function MethodPreview() {
  return (
    <section className="section methodology-preview border-y hairline">
      <div className="wrap"><p className="label label-cyan">Our method</p><h2 className="display text-[clamp(3rem,7.5vw,7.5rem)] mt-3 max-w-6xl">We don't ask you to<br/><span className="outline-word">take our word for it.</span></h2>
        <div className="method-grid mt-14">{METHOD.map(([n,t,b],i)=><article key={n} className={`method-card method-card-${i+1}`}><span>{n}</span><div><p className="label label-cyan">Method {n}</p><h3 className="display-md text-2xl md:text-3xl mt-2">{t}</h3><p className="text-sm text-bone/70 leading-relaxed mt-4">{b}</p></div></article>)}</div>
        <Link to="/methodology" className="btn mt-10">See the full methodology</Link>
      </div>
    </section>
  )
}

function FinalShop() {
  return (
    <section className="section final-shop"><div className="wrap text-center"><p className="label label-violet">{BRAND} collection</p><h2 className="display text-[clamp(3.2rem,8vw,8rem)] mt-4">See the molecule.<br/>Follow the evidence.</h2><p className="lede mt-6 mx-auto max-w-xl">{brand.secondaryTagline}</p><Link to="/explore" className="btn btn-primary mt-9">Explore the library</Link><p className="mt-6 text-[11px] faint">All profiles are informational until verified lot-specific inventory is added.</p></div></section>
  )
}
