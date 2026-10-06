import { createFileRoute } from '@tanstack/react-router'
import { CORPUS_CHECKED_AT, STUDIES } from '~/data/studies'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/methodology')({
  head: () => ({ meta: [{ title: `How we check what we show — ${BRAND}` }] }),
  component: Methodology,
})

const PRINCIPLES = [
  { n: '01', title: 'Find the source', body: 'We start with the original study, not a website repeating it.' },
  { n: '02', title: 'Check citation details', body: 'We confirm each study exists and is listed correctly on PubMed. That does not confirm what the study found.' },
  { n: '03', title: 'Keep stories separate', body: "What researchers measured and what people say online aren't the same kind of evidence." },
  { n: '04', title: 'Show the gaps', body: "If we haven't checked something, we say so. If the research stops at animals, we show that." },
]

const DETAILS = [
  ['How sources enter the library', `Each study is added by its PubMed ID. We check its title and publication details against PubMed. We do not read the full text or judge its claims at this step. Last check: ${CORPUS_CHECKED_AT}.`],
  ['How we connect claims to research', 'A linked study is only a possible match. Before we summarize it, we review the exact molecule, the study setting, what was measured, its limits and any evidence against it. Until then, no summary is shown.'],
  ['How we handle real-world reports', "We don't collect community reports yet, so we show no totals. When we do, each report will keep its platform, date and context, and duplicates will be marked."],
  ['How we look for independent research', 'Different author names do not prove independent teams. We have not yet reviewed institutions, funding or reused data.'],
  ['Where people review the record', 'A person has to review each molecule and each link between a claim and its source. An automated check does not replace that. Every change is version-tracked.'],
  ['How corrections work', 'A correction will show the date, the record, the before-and-after text, the reason and the source. The corrections inbox is not open yet.'],
  ['Known limits', `We list ${STUDIES.length} PubMed studies. Listing is not the same as reviewing their conclusions. Most molecules have no study summary yet. News and community feeds are not live. Every 3D model is labeled with where it came from.`],
]

function Methodology() {
  return (
    <div className="pt-28">
      <header className="wrap method-hero py-16 md:py-24"><p className="label label-cyan">Our method</p><h1 className="display text-[clamp(3.4rem,9vw,9rem)] mt-4 max-w-6xl">We don't ask you to<br/><span className="outline-word">take our word for it.</span></h1><p className="lede mt-8 max-w-2xl">How {BRAND} finds sources, checks them, and tells you what is missing.</p></header>
      <section className="wrap pb-20"><div className="method-grid">{PRINCIPLES.map((p,i)=><article key={p.n} className={`method-card method-card-${i+1}`}><span>{p.n}</span><div><p className="label label-cyan">Method {p.n}</p><h2 className="display-md text-3xl md:text-4xl mt-2">{p.title}</h2><p className="text-sm md:text-base text-bone/70 leading-relaxed mt-5 max-w-md">{p.body}</p></div></article>)}</div></section>
      <section className="method-depth border-y hairline py-20"><div className="wrap grid lg:grid-cols-[.65fr_1.35fr] gap-12"><div><p className="label label-violet">Go deeper</p><h2 className="display text-[clamp(2.5rem,5vw,5rem)] mt-3">See exactly how this works.</h2><p className="muted mt-5 max-w-sm">The detail, for careful readers.</p></div><div className="grid gap-3">{DETAILS.map(([q,a])=><details key={q} className="method-detail"><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>
      <section className="wrap py-20"><p className="label label-cyan">Review states</p><h2 className="display-md text-3xl mt-3">A source exists. A conclusion still needs review.</h2><div className="grid md:grid-cols-3 gap-3 mt-8"><div className="panel-flat p-5"><strong>Study checked</strong><p className="text-sm muted mt-3">Its title and publication details match PubMed.</p></div><div className="panel-flat p-5"><strong>Claim not reviewed</strong><p className="text-sm muted mt-3">We have not yet reviewed what the study shows, so there is no summary.</p></div><div className="panel-flat p-5"><strong>Official record attached</strong><p className="text-sm muted mt-3">A regulator record for one specific product and use. It says nothing about other formulations.</p></div></div></section>
    </div>
  )
}
