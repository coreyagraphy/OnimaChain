import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Hero } from '~/components/Hero'
import { FeaturedOrbit } from '~/components/FeaturedOrbit'
import { LiquidGlassLink } from '~/components/LiquidGlassLink'
import { COMPOUND_BY_SLUG, COMPOUNDS } from '~/data/compounds'
import { DOMAINS } from '~/data/domains'
import { BRAND, brand } from '~/brand'
import { ExperienceLaunchpad } from '~/components/ExperienceLaunchpad'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `${BRAND} — ${brand.primaryTagline}` },
      { name: 'description', content: brand.description },
    ],
    links: [{ rel: 'preload', as: 'image', href: '/posters/hero.jpg' }],
  }),
  component: Home,
})

function Home() {
  return <><Hero /><ExperienceLaunchpad compact /><FeaturedCollection /><ResearchDomains /><PulseHome /><Difference /><MethodPreview /><LearningGateway /><FinalLearn /><MobileLearnBar /></>
}

function LearningGateway() {
  return <section className="waitlist-teaser wrap" aria-labelledby="waitlist-teaser-heading">
    <div><p className="label label-cyan">Learn by doing</p><h2 id="waitlist-teaser-heading" className="display-md">Look closer.<br /><span>Think clearer.</span></h2><p>Capture a building block, steer through the chamber, and connect a fictional sequence. Practice at your pace. Game results stay in this browser.</p></div>
    <Link to="/learn/chainforge" className="btn btn-primary">Play Chainforge <span aria-hidden>↗</span></Link>
  </section>
}

function FeaturedCollection() {
  const featured = ['bpc-157', 'tb-500', 'ghk-cu', 'mots-c', 'pt-141', 'semaglutide', 'semax', 'epitalon'].map((slug) => COMPOUND_BY_SLUG[slug])
  return (
    <section className="section collection-stage" aria-label="Featured compounds">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div><p className="label label-cyan">Featured compounds</p><h2 className="atmo-title mt-4"><span className="atmo-line">Every molecule has</span><span className="atmo-neon"><span className="atmo-glow" aria-hidden>its own atmosphere.</span><span className="atmo-glow atmo-glow-b" aria-hidden>its own atmosphere.</span><span className="atmo-foil">its own atmosphere.</span></span></h2></div>
        <LiquidGlassLink to="/explore">Explore all {COMPOUNDS.length} records</LiquidGlassLink>
      </div>
      <FeaturedOrbit compounds={featured} />
    </section>
  )
}

/** Phones: once past the intro, the learning gateway stays in reach. */
function MobileLearnBar() {
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
      <LiquidGlassLink to="/learn">Play & Learn →</LiquidGlassLink>
    </div>
  )
}

function PulseHome() {
  return (
    <section className="section pulse-home" aria-labelledby="pulse-h">
      <div className="pulse-home-glow" aria-hidden />
      <div className="wrap relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="label label-cyan pulse-live-label">Research Time Machine</p>
          <h2 id="pulse-h" className="display text-[clamp(2.2rem,5.4vw,4.6rem)] mt-3 leading-[0.98]">Ideas become tools.<br />Sources mark the moments.</h2>
          <p className="lede mt-4 max-w-xl">Travel through documented moments in peptide science. Select a year, read what happened, and open the original source.</p>
        </div>
        <Link to="/learn" search={{ activity: 'history' }} className="btn btn-primary">Explore the timeline →</Link>
      </div>
    </section>
  )
}

function Difference() {
  return (
    <section className="section relative overflow-hidden border-y hairline difference-stage">
      <div className="molecular-divider" aria-hidden><i/><i/><i/><i/><i/></div>
      <div className="wrap relative z-10 grid lg:grid-cols-[.75fr_1.25fr] gap-10 items-end">
        <p className="label label-violet">Why this is different</p>
        <div><h2 className="display text-[clamp(3rem,7vw,7.2rem)]">More than a<br/>name list.</h2><p className="lede mt-7 max-w-2xl">A molecule's identity, a citation record, and a reviewed scientific conclusion are different things. Explore what is indexed, where its source leads, and what remains unreviewed.</p><div className="flex flex-wrap gap-3 mt-8"><Link to="/claims" className="btn">Explore the research</Link><Link to="/observatory" className="btn btn-primary">Enter the Observatory →</Link></div></div>
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
    <section className="section wrap" aria-label="Browse scientific subjects">
      <p className="label label-cyan">Browse by subject</p>
      <h2 className="display text-[clamp(2.4rem,5vw,5rem)] mt-3">Seven ways into the science.</h2>
      <p className="lede mt-4 max-w-xl hidden md:block">These are editorial subjects, not personal-use categories.</p>
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
                <span className="topic-count">{count} {count === 1 ? 'record' : 'records'}</span>
              </span>
              <span className="relative z-[2] mt-auto">
                <strong className="display-md block text-2xl md:text-[1.9rem] leading-tight">{d.name}</strong>
                <span className="topic-tagline block mt-2 text-[14px] text-bone/75 max-w-[30ch]">{d.tagline}</span>
              <span className="topic-cta">Explore {count} →</span>
              </span>
            </Link>
          )
        })}
      </div>
      <p className="mt-4 mono text-[11px] text-bone/40">Images are conceptual artwork, not measured structures or evidence of a biological effect.</p>
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

function FinalLearn() {
  return (
    <section className="section final-shop"><div className="wrap text-center"><p className="label label-violet">{BRAND} Learning Lab</p><h2 className="display text-[clamp(3.2rem,8vw,8rem)] mt-4">See the molecule.<br/>Question the claim.</h2><p className="lede mt-6 mx-auto max-w-xl">A cell experiment, an animal study and a human trial answer different questions. Learn how to tell them apart.</p><Link to="/learn" className="btn btn-primary mt-9">Enter the Learning Lab</Link></div></section>
  )
}
