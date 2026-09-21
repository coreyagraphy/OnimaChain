import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { CLAIM_BY_ID, RELATIONSHIP_LABEL, TRANSLATION_STAGES } from '~/data/claims'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { STUDY_BY_PMID } from '~/data/studies'
import { CORPUS, EMPTY_PLATFORM, HUMAN_SIGNAL_LINE, PLATFORMS } from '~/data/signal'
import { LineageGraph } from '~/components/LineageGraph'
import { MutationLadder } from '~/components/MutationLadder'
import { StudyCard } from '~/components/StudyCard'
import { SpeciesBadge } from '~/components/SpeciesBadge'
import { SourceBadge } from '~/components/SourceBadge'
import { EmptyState } from '~/components/EmptyState'
import { CorpusHeader } from '~/components/CorpusHeader'
import { TranslationTrack } from '~/components/TranslationTrack'
import { ChangeDiff } from '~/components/ChangeDiff'
import { SourceCard } from '~/components/SourceCard'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/claim/$id')({
  loader: ({ params }) => {
    if (!CLAIM_BY_ID[params.id]) throw notFound()
    return { id: params.id }
  },
  head: ({ loaderData }) => {
    const c = loaderData ? CLAIM_BY_ID[loaderData.id] : undefined
    return { meta: [{ title: c ? `“${c.title}” — ${BRAND} claim record` : 'Claim' }, { name: 'description', content: 'Where it started, what was tested, how it spread, how the wording changed, which studies back it or push back, what people say, and what we changed.' }] }
  },
  component: ClaimPage,
})

const SECTIONS = ['Where it started', 'What was actually tested', 'How the story spread', 'How the wording changed', 'Studies that back it', 'Studies that push back', 'What people say', 'Copies vs. originals', 'How far it has been tested', 'The short version', 'What we changed']

function ClaimPage() {
  const { id } = Route.useLoaderData()
  const claim = CLAIM_BY_ID[id]
  const compound = COMPOUND_BY_SLUG[claim.compound]
  const origin = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : undefined
  const verifiedOrigin = origin?.status === 'verified'
  return (
    <article className="pt-24">
      <header className="wrap">
        <p className="mono text-[12px] text-bone/55">{claim.id}</p>
        <h1 className="display text-[clamp(2.4rem,6vw,5.6rem)] mt-3 max-w-5xl">&ldquo;{claim.title}&rdquo;</h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="chip chip-cyan">A claim we track</span>
          <Link to="/compound/$slug" params={{ slug: compound.slug }} className="chip hover:border-cyan">{displayName(compound)} ↗</Link>
          <span className="text-[12px] muted">We don’t stamp claims true or false. We show you where they came from and let you decide.</span>
        </div>
        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-y hairline py-3" aria-label="Sections">
          {SECTIONS.map((s, i) => <a key={s} href={`#s${i}`} className="label hover:!text-bone">{s}</a>)}
        </nav>
      </header>

      <Sec i={0} title="Where it started" lede="The earliest study we have checked that this claim traces back to.">
        {verifiedOrigin && origin ? <StudyCard study={origin} relationship="Backs it up" basis={origin.abstractQuote ?? null} /> : <EmptyState tone="amber" title="We could not confirm the source" detail="The original study could not be confirmed on PubMed, so we do not show it as a source." />}
      </Sec>

      <Sec i={1} title="What was actually tested" lede="Who or what it was tested on, how, what was measured, and the exact words the study used.">
        <dl className="grid sm:grid-cols-2 gap-4">
          <div className="panel-flat p-4"><dt className="label">Tested on</dt><dd className="mt-2"><SpeciesBadge species={claim.originalScope.species} source="abstract" />{claim.originalScope.species && <span className="block mt-1 text-[11px] muted">the study summary says the cells came from rat tissue; the title does not say</span>}</dd></div>
          <div className="panel-flat p-4"><dt className="label">Test setup</dt><dd className="mt-2 text-sm">{claim.originalScope.model ?? '—'}</dd></div>
          <div className="panel-flat p-4"><dt className="label">What was measured</dt><dd className="mt-2 text-sm">{claim.originalScope.endpoint ?? '—'}</dd></div>
          <div className="panel-flat p-4"><dt className="label">The study’s own words</dt><dd className="mt-2 text-sm italic text-bone/85">{claim.originalScope.wording ? <>&ldquo;{claim.originalScope.wording}&rdquo;</> : 'We could not confirm the source'}</dd>{claim.originalScope.wordingSource && <dd className="mono text-[11px] text-bone/45 mt-1">{claim.originalScope.wordingSource}</dd>}</div>
        </dl>
      </Sec>

      <Sec i={2} title="How the story spread" lede="From the study, to the retelling, to the people online. Every line says how the two ends are connected. Dashed lines are not confirmed or not connected.">
        <LineageGraph claim={claim} />
      </Sec>

      <Sec i={3} title="How the wording changed" lede="Watch a careful study result turn into a bold post. That is not always lying. But each step is tagged so you can see exactly what changed.">
        <MutationLadder claim={claim} />
      </Sec>

      <Sec i={4} title="Studies that back it" lede="Each study we checked, and exactly how it relates to this claim.">
        <div className="grid md:grid-cols-2 gap-3">
          {claim.support.map((s) => STUDY_BY_PMID[s.pmid] && <StudyCard key={s.pmid} study={STUDY_BY_PMID[s.pmid]} relationship={RELATIONSHIP_LABEL[s.relationship]} basis={s.basis} />)}
        </div>
      </Sec>

      <Sec i={5} title="Studies that push back" lede="Results that found nothing, results that disagree, and criticism of how a study was run.">
        {claim.contradictions.length ? claim.contradictions.map((s) => STUDY_BY_PMID[s.pmid] && <StudyCard key={s.pmid} study={STUDY_BY_PMID[s.pmid]} relationship="Pushes back" basis={s.basis} />) : <EmptyState title="No study we have checked pushes back on this yet" detail="One study only partly backs it (slightly better scores, but not by enough to count). It is listed above under studies that back it, in its own words. Not finding a study is not the same as proving there is none." />}
      </Sec>

      <Sec i={6} title="What people say" lede={HUMAN_SIGNAL_LINE}>
        <CorpusHeader />
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{PLATFORMS.slice(0, 4).map((p) => <SourceCard key={p.id} platform={p.name} />)}</div>
      </Sec>

      <Sec i={7} title="Copies vs. originals" lede="Ten thousand posts are not ten thousand people. We count how many stories are original and how many are reposts.">
        <div className="grid sm:grid-cols-3 gap-3">
          {[['Posts found', '0'], ['Original stories', '0'], ['Copies and reposts', '0']].map(([k, v]) => (
            <div key={k} className="panel-flat p-5"><p className="label">{k}</p><p className="display text-4xl mt-2 text-bone/60">{v}</p><p className="mono text-[11px] text-bone/45 mt-2">{CORPUS.header}</p></div>
          ))}
        </div>
        <p className="mt-3 text-sm muted">Social platforms are not connected yet, so there are no posts to sort into originals and copies.</p>
      </Sec>

      <Sec i={8} title="How far it has been tested" lede="From cells in a dish, to animals, to people. The light stops where the checked studies stop.">
        <TranslationTrack rows={Object.entries(claim.translation).map(([outcome, stages]) => ({ outcome, stages }))} />
        <p className="mt-3 mono text-[11px] text-bone/45">The full ladder: {TRANSLATION_STAGES.map((s) => s.label).join(' → ')}</p>
      </Sec>

      <Sec i={9} title="The short version" lede="Our plain-English reading. Every sentence comes from a study listed above, or says clearly what we do not have.">
        <ol className="grid gap-3">
          {claim.interpretation.map((line, i) => <li key={i} className="panel-flat p-4 text-sm text-bone/85 flex gap-3"><span className="mono text-bone/40">{i + 1}</span><span>{line}</span></li>)}
        </ol>
        <p className="mt-3 text-[12px] muted">Written by {BRAND} from the studies on this page only. Those studies: {claim.support.filter((s) => STUDY_BY_PMID[s.pmid]?.status === 'verified').map((s) => <SourceBadge key={s.pmid} pmid={s.pmid} verified link={false} />)}</p>
      </Sec>

      <Sec i={10} title="What we changed" lede="Every real edit we have made to this claim, with before and after. Nothing gets quietly rewritten.">
        <div className="grid gap-3">{claim.changeHistory.map((e, i) => <ChangeDiff key={i} event={e} />)}</div>
      </Sec>
    </article>
  )
}

function Sec({ i, title, lede, children }: { i: number; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <section id={`s${i}`} className="wrap py-14 md:py-16 border-b hairline" aria-label={title}>
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <div><p className="label label-cyan">{String(i + 1).padStart(2, '0')}</p><h2 className="display-md text-2xl md:text-3xl mt-2">{title}</h2>{lede && <p className="mt-3 text-sm muted">{lede}</p>}</div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}
