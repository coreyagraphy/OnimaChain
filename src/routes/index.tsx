import { createFileRoute, Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
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
  return (
    <section className="section wrap">
      <p className="label label-cyan">Browse by research area</p>
      <h2 className="display text-[clamp(2.4rem,5vw,5rem)] mt-3">Seven ways into the collection.</h2>
      <div className="domain-spectrum mt-10">
        {DOMAINS.map((d, i) => (
          <Link key={d.id} to="/explore" className="domain-tile" style={{ '--domain': d.palette.base, '--domain-2': d.palette.accent } as CSSProperties}>
            <span className="mono text-[10px] opacity-50">0{i + 1}</span><strong className="display-md text-xl md:text-2xl">{d.name}</strong><span className="text-[12px] text-bone/55">{COMPOUNDS.filter((c) => c.domain === d.id).length} compounds</span>
          </Link>
        ))}
      </div>
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
    <section className="section final-shop"><div className="wrap text-center"><p className="label label-violet">The collection</p><h2 className="display text-[clamp(3.2rem,8vw,8rem)] mt-4">Enter the molecular<br/>laboratory.</h2><p className="lede mt-6 mx-auto max-w-xl">Shop the collection first. Follow every source when you want to go deeper.</p><Link to="/explore" className="btn btn-primary mt-9">Shop the collection</Link><p className="mt-6 text-[11px] faint">{BRAND} is a working brand. Final pricing and checkout remain pending commercial review.</p></div></section>
  )
}
