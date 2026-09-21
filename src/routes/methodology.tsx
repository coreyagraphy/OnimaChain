import { createFileRoute } from '@tanstack/react-router'
import { CORPUS_CHECKED_AT, STUDIES } from '~/data/studies'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/methodology')({
  head: () => ({ meta: [{ title: `How we check what we show — ${BRAND}` }] }),
  component: Methodology,
})

const PRINCIPLES = [
  { n: '01', title: 'Find the source', body: 'We start with the original research whenever we can—not another website repeating it.' },
  { n: '02', title: 'Check the record', body: 'Study titles, publication details, and identifiers are verified before we show them as confirmed research.' },
  { n: '03', title: 'Keep stories separate', body: "What researchers measured and what people say online are both worth exploring—but they aren't the same kind of evidence." },
  { n: '04', title: 'Show the gaps', body: "If we haven't checked something yet, we say that. If research stops at animals, we show where it stops." },
]

const DETAILS = [
  ['How sources enter the library', `Scientific records enter through PubMed identifiers in a versioned data file. Every identifier is checked against NCBI before the site builds. Titles, dates, journals, and author lists come from that record—not promotional copy. Last corpus check: ${CORPUS_CHECKED_AT}.`],
  ['How we connect claims to research', 'Every tracked claim has an origin record or a clear “connection not yet verified” state. We preserve the original scope, including the species, model, endpoint, and source wording. Later interpretations stay visibly separate.'],
  ['How we handle real-world reports', "No community-source connector is enabled yet, so we don't display invented totals. When collection begins, reports will retain platform, date, research goal, co-interventions, and duplication relationships."],
  ['How we look for independent research', 'We currently show distinct last-author names as a limited proxy. Institutions, funding, and citation networks remain unchecked until the necessary source connectors are available.'],
  ['Where people review the record', 'Study-to-claim relationships are editorial decisions with a source basis. The data files are currently the review surface, and changes are versioned in git. A dedicated editorial console is planned.'],
  ['How corrections work', 'The public corrections ledger records the date, affected record, before-and-after text, reason, and source. Previous interpretations are superseded, not quietly erased.'],
  ['Known limits', `The current corpus contains ${STUDIES.length} verified records across two compounds. No trial, regulatory, or community connector is enabled. Three-dimensional structures are procedural, sequence-derived visualizations—not measured structures unless explicitly identified as deposited.`],
]

function Methodology() {
  return (
    <div className="pt-28">
      <header className="wrap method-hero py-16 md:py-24"><p className="label label-cyan">Our method</p><h1 className="display text-[clamp(3.4rem,9vw,9rem)] mt-4 max-w-6xl">We don't ask you to<br/><span className="outline-word">take our word for it.</span></h1><p className="lede mt-8 max-w-2xl">A clear look at how {BRAND} finds sources, checks records, keeps different kinds of evidence separate, and tells you when something is missing.</p></header>
      <section className="wrap pb-20"><div className="method-grid">{PRINCIPLES.map((p,i)=><article key={p.n} className={`method-card method-card-${i+1}`}><span>{p.n}</span><div><p className="label label-cyan">Method {p.n}</p><h2 className="display-md text-3xl md:text-4xl mt-2">{p.title}</h2><p className="text-sm md:text-base text-bone/70 leading-relaxed mt-5 max-w-md">{p.body}</p></div></article>)}</div></section>
      <section className="method-depth border-y hairline py-20"><div className="wrap grid lg:grid-cols-[.65fr_1.35fr] gap-12"><div><p className="label label-violet">Go deeper</p><h2 className="display text-[clamp(2.5rem,5vw,5rem)] mt-3">See exactly how this works.</h2><p className="muted mt-5 max-w-sm">The plain-language view comes first. The underlying process stays available for researchers and careful readers.</p></div><div className="grid gap-3">{DETAILS.map(([q,a])=><details key={q} className="method-detail"><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>
      <section className="wrap py-20"><p className="label label-cyan">Technical implementation</p><h2 className="display-md text-3xl mt-3">The record underneath the interface.</h2><pre className="panel-flat p-5 mt-8 mono text-[12px] leading-relaxed overflow-x-auto text-bone/80">{`Study      { pmid, compounds[], species, studyType, tags[], sourceQuote?, status, NCBI metadata }
Claim      { id, title, compound, originStudy|null, originalScope, mutation[], support[], translation, contradictions[], changeHistory[] }
Relations  study SUPPORTS | PARTIALLY_SUPPORTS | CONTRADICTS | DOES_NOT_TEST claim
Structure  provenance ∈ { deposited PDB | sequence-derived visualization | conceptual visualization }`}</pre></section>
    </div>
  )
}
