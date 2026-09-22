import { createFileRoute, Link } from '@tanstack/react-router'
import { COMBINATIONS, RESEARCH_BY_ID, type Combination } from '~/data/research-entities'

export const Route = createFileRoute('/combinations')({ head: () => ({ meta: [{ title: 'Stacks & Combinations — OnimaChain' }] }), component: CombinationsPage })

function CombinationsPage() {
  return <div className="pt-28 pb-24 research-world"><header className="wrap research-hero"><p className="label label-cyan">Components, not fictional molecules</p><h1 className="display research-heading">Separate chains. <span>Connected ideas.</span></h1><p className="lede max-w-3xl mt-6">A stack is a name for a set of components. A clinical combination is a pairing studied in a formal programme. Neither becomes a new single molecular structure.</p></header>
    <CombinationSection title="Community stacks" intro="Community-defined pairings. Their inclusion is not evidence that the combination itself has been clinically tested." rows={COMBINATIONS.filter((c) => c.type === 'COMMUNITY_STACK')} />
    <CombinationSection title="Clinical combinations" intro="The individual components stay separate even when a trial studies them together." rows={COMBINATIONS.filter((c) => c.type === 'CLINICAL_COMBINATION')} />
  </div>
}

function CombinationSection({ title, intro, rows }: { title: string; intro: string; rows: Combination[] }) {
  return <section className="wrap mt-16 border-t hairline pt-9"><p className="label label-cyan">{title}</p><h2 className="display-md text-[clamp(2rem,4vw,3.5rem)] mt-2">{title}</h2><p className="muted mt-3 max-w-2xl">{intro}</p><div className="grid lg:grid-cols-2 gap-5 mt-8">{rows.map((c) => <article id={c.id} key={c.id} className="combination-card"><div className="flex flex-wrap justify-between gap-2"><span className="research-status-pill">Informational profile</span><span className="research-status-pill">{c.type === 'COMMUNITY_STACK' ? 'Community stack' : 'Clinical combination'}</span></div><h3 className="display-md text-3xl mt-6">{c.name}</h3><p className="text-sm muted mt-3">{c.summary}</p><div className="component-constellation mt-7" aria-label={`${c.name} has ${c.componentIds.length} separate components`}>{c.componentIds.map((id) => { const member = RESEARCH_BY_ID[id]; return <Link key={id} to={member?.researchStatus === 'WATCHLIST' ? '/watchlist/$slug' : '/compound/$slug'} params={{ slug: id }} className="component-node"><span className="component-sphere" /><strong>{member?.name ?? id}</strong><small>{member?.structureProvenance === 'sequence-derived' ? 'Sequence-derived' : 'Conceptual / pending'}</small></Link> })}</div><p className="mono text-[10px] text-bone/45 mt-5">Component constellation · no unified molecular structure</p>{c.source && <a href={c.source} target="_blank" rel="noreferrer noopener" className="btn btn-sm mt-5">Open study source ↗</a>}</article>)}</div></section>
}
