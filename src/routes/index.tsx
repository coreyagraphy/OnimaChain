import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, type CSSProperties } from 'react'
import { Hero } from '~/components/Hero'
import { CompoundCard } from '~/components/CompoundCard'
import { COMPOUND_BY_SLUG, COMPOUNDS } from '~/data/compounds'
import { DOMAINS } from '~/data/domains'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return <><Hero /><FeaturedCollection /><Difference /><ResearchDomains /><MethodPreview /><FinalShop /></>
}

function FeaturedCollection() {
  const featured = ['bpc-157', 'tb-500', 'ghk-cu', 'mots-c', 'pt-141', 'semaglutide'].map((slug) => COMPOUND_BY_SLUG[slug])
  return (
    <section className="section collection-stage" aria-label="Featured compounds">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div><p className="label label-cyan">Featured compounds</p><h2 className="display text-[clamp(2.5rem,6vw,5.7rem)] mt-3">Every molecule has<br/><span className="outline-word">its own atmosphere.</span></h2></div>
        <Link to="/explore" className="btn">Shop all {COMPOUNDS.length}</Link>
      </div>
      <div className="mt-12 overflow-x-auto rail pb-8"><div className="wrap flex gap-5 items-end w-max">{featured.map((c, i) => <CompoundCard key={c.slug} compound={c} index={i} />)}</div></div>
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
    <section className="section wrap" aria-label="Shop by topic">
      <p className="label label-cyan">Shop by what you’re after</p>
      <h2 className="display text-[clamp(2.4rem,5vw,5rem)] mt-3">What are you here for?</h2>
      <p className="lede mt-4 max-w-xl">Seven doors into the collection. Pick one.</p>
      <div ref={grid} className="topic-grid mt-10">
        {DOMAINS.map((d, i) => {
          const count = COMPOUNDS.filter((c) => c.domain === d.id).length
          return (
            <Link key={d.id} to="/explore" search={{ topic: d.id }} className={`topic-card topic-card-${i + 1}`} style={{ '--domain': d.palette.base, '--domain-2': d.palette.accent, '--i': i } as CSSProperties}>
              <span className="topic-img" style={{ backgroundImage: `url(${d.image})` }} aria-hidden />
              <span className="topic-veil" aria-hidden />
              <span className="topic-sheen" aria-hidden />
              <span className="relative z-[2] flex items-center justify-between gap-3">
                <span className="mono text-[11px] text-bone/55">0{i + 1}</span>
                <span className="topic-count">{count} {count === 1 ? 'peptide' : 'peptides'}</span>
              </span>
              <span className="relative z-[2] mt-auto">
                <strong className="display-md block text-2xl md:text-[1.9rem] leading-tight">{d.name}</strong>
                <span className="block mt-2 text-[14px] text-bone/75 max-w-[30ch]">{d.tagline}</span>
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
    <section className="section final-shop"><div className="wrap text-center"><p className="label label-violet">The collection</p><h2 className="display text-[clamp(3.2rem,8vw,8rem)] mt-4">See it up close.<br/>Then decide.</h2><p className="lede mt-6 mx-auto max-w-xl">Shop the collection first. Follow every source when you want to go deeper.</p><Link to="/explore" className="btn btn-primary mt-9">Shop the collection</Link><p className="mt-6 text-[11px] faint">{BRAND} is a working brand. Final pricing and checkout remain pending commercial review.</p></div></section>
  )
}
