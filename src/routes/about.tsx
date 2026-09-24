import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND, brand } from '~/brand'
import { BrandLogo } from '~/components/BrandWordmark'
import { OperatorIdentity } from '~/components/OperatorIdentity'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [
    { title: `About ${BRAND} — ${brand.primaryTagline}` },
    { name: 'description', content: `Why ${BRAND} exists, what the name means, and how we make peptide information easier to follow.` },
  ] }),
  component: About,
})

function About() {
  return (
    <div className="pt-28 min-h-[60vh] overflow-hidden">
      <header className="wrap about-brand-hero">
        <div>
          <p className="label label-cyan">About {BRAND}</p>
          <h1 className="display text-[clamp(2.7rem,7vw,7rem)] mt-4 max-w-5xl">Peptides,<br /><span className="outline-word">made easier to see.</span></h1>
          <p className="lede mt-6 max-w-2xl">{brand.description}</p>
        </div>
        <div className="about-brand-object">
          <BrandLogo priority />
          <p>{brand.primaryTagline}</p>
        </div>
      </header>

      <section className="wrap about-origin" aria-labelledby="origin-title">
        <div className="about-sequence" aria-hidden>
          <span>AMINO</span><i /><b>read backward</b><i /><span>ONIMA</span>
        </div>
        <div className="about-origin-copy">
          <p className="label label-violet">The name</p>
          <h2 id="origin-title" className="display text-[clamp(2rem,5vw,4.7rem)] mt-3">Amino, turned around.<br />Evidence, linked forward.</h2>
          <p className="lede mt-5 max-w-2xl">{brand.meaning}</p>
        </div>
      </section>

      <section className="wrap mt-10 grid md:grid-cols-2 gap-4 max-w-5xl">
        <div className="panel glass relative p-6"><p className="relative label label-cyan">Who this is for</p><p className="relative mt-3 text-sm text-bone/85">Adults, 21 and older, who are curious about commonly discussed peptides and want straight answers instead of a sales pitch or a wall of science words.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-cyan">What the labels mean</p><p className="relative mt-3 text-sm text-bone/85">A PubMed check confirms citation details, not a claim. Tracked statements show a source connection or say when that connection is still under review.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-amber">What we do not do</p><p className="relative mt-3 text-sm text-bone/85">We do not give medical advice, tell you how much to take, or make up customer stories and results.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-violet">How to use it</p><p className="relative mt-3 text-sm text-bone/85">Start in the <Link to="/explore" className="underline">research library</Link>, inspect the labeled molecule view, then open cited records. Read our <Link to="/methodology" className="underline">method</Link> for the boundary between a citation and a reviewed scientific conclusion.</p></div>
        <div className="panel glass relative p-6 md:col-span-2"><p className="relative label label-amber">Operator and review disclosure</p><OperatorIdentity/><p className="relative mt-4 text-sm text-bone/85">Any material commercial relationships and final scientific and legal review remain to be confirmed. This site does not claim independent scientific or legal approval.</p></div>
      </section>
    </div>
  )
}
