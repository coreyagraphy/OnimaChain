import { createFileRoute } from '@tanstack/react-router'
import { CORPUS_CHECKED_AT, STUDIES } from '~/data/studies'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/methodology')({
  head: () => ({ meta: [{ title: `How we check what we show — ${BRAND}` }] }),
  component: Methodology,
})

const PRINCIPLES = [
  { n: '01', title: 'Find the source', body: 'We start with the original research whenever we can—not another website repeating it.' },
  { n: '02', title: 'Check citation details', body: 'A PubMed metadata match checks a citation record. It does not validate an outcome summary or the source-to-compound match.' },
  { n: '03', title: 'Keep stories separate', body: "What researchers measured and what people say online are both worth exploring—but they aren't the same kind of evidence." },
  { n: '04', title: 'Show the gaps', body: "If we haven't checked something yet, we say that. If research stops at animals, we show where it stops." },
]

const DETAILS = [
  ['How sources enter the library', `Citation candidates enter through PubMed identifiers in a versioned data file. The build checks their bibliographic metadata against NCBI; this is not full-text or claim-level review. Last metadata check: ${CORPUS_CHECKED_AT}.`],
  ['How we connect claims to research', 'A linked citation is a candidate connection until the exact molecule or formulation, study setting, endpoint, limitations and contrary evidence are reviewed. Outcome summaries are withheld while that work is pending.'],
  ['How we handle real-world reports', "No community-source connector is enabled yet, so we don't display invented totals. When collection begins, reports will retain platform, date, research goal, co-interventions, and duplication relationships."],
  ['How we look for independent research', 'Distinct last-author names are not proof of independent teams or experiments. Institutions, funding, reused data and citation networks have not been reviewed across the corpus.'],
  ['Where people review the record', 'Source-to-claim mappings and molecule identity need editorial review. A successful build check cannot substitute for that review. Changes are versioned in git, with release decisions tied to a specific commit.'],
  ['How corrections work', 'A dated public correction should show the affected record, before-and-after text, reason and source. The correction intake is release-gated until a real editorial inbox is configured and tested.'],
  ['Known limits', `The current corpus indexes ${STUDIES.length} PubMed citation record(s), not ${STUDIES.length} reviewed clinical conclusions. Most profiles have no completed study summary. Automated news and community feeds are not presented as a verified public service. Three-dimensional structures are labeled by provenance.`],
]

function Methodology() {
  return (
    <div className="pt-28">
      <header className="wrap method-hero py-16 md:py-24"><p className="label label-cyan">Our method</p><h1 className="display text-[clamp(3.4rem,9vw,9rem)] mt-4 max-w-6xl">We don't ask you to<br/><span className="outline-word">take our word for it.</span></h1><p className="lede mt-8 max-w-2xl">A clear look at how {BRAND} finds sources, checks records, keeps different kinds of evidence separate, and tells you when something is missing.</p></header>
      <section className="wrap pb-20"><div className="method-grid">{PRINCIPLES.map((p,i)=><article key={p.n} className={`method-card method-card-${i+1}`}><span>{p.n}</span><div><p className="label label-cyan">Method {p.n}</p><h2 className="display-md text-3xl md:text-4xl mt-2">{p.title}</h2><p className="text-sm md:text-base text-bone/70 leading-relaxed mt-5 max-w-md">{p.body}</p></div></article>)}</div></section>
      <section className="method-depth border-y hairline py-20"><div className="wrap grid lg:grid-cols-[.65fr_1.35fr] gap-12"><div><p className="label label-violet">Go deeper</p><h2 className="display text-[clamp(2.5rem,5vw,5rem)] mt-3">See exactly how this works.</h2><p className="muted mt-5 max-w-sm">The plain-language view comes first. The underlying process stays available for researchers and careful readers.</p></div><div className="grid gap-3">{DETAILS.map(([q,a])=><details key={q} className="method-detail"><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>
      <section className="wrap py-20"><p className="label label-cyan">Review states</p><h2 className="display-md text-3xl mt-3">A source exists. A conclusion still needs review.</h2><div className="grid md:grid-cols-3 gap-3 mt-8"><div className="panel-flat p-5"><strong>Citation metadata checked</strong><p className="text-sm muted mt-3">Title, identifier and other bibliographic fields matched against PubMed.</p></div><div className="panel-flat p-5"><strong>Claim review pending</strong><p className="text-sm muted mt-3">Exact form, model, endpoint, limitations and contradictory evidence not yet cleared for a summary.</p></div><div className="panel-flat p-5"><strong>Official product record attached</strong><p className="text-sm muted mt-3">The linked regulator record names a specific product and indication; its presence does not validate a different formulation or every later label change.</p></div></div></section>
    </div>
  )
}
