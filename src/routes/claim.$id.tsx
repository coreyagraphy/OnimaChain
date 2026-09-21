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
    return { meta: [{ title: c ? `“${c.title}” — ${BRAND} claim record` : 'Claim' }, { name: 'description', content: 'Origin, original scope, lineage, mutation, support, contradictions, human signal, echo analysis, translation state and change history.' }] }
  },
  component: ClaimPage,
})

const SECTIONS = ['Origin', 'Original scope', 'Claim lineage', 'Claim mutation', 'Research support', 'Research contradictions', 'Human signal', 'Echo analysis', 'Translation state', 'Current interpretation', 'Change history']

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
          <span className="chip chip-cyan">Tracked research claim</span>
          <Link to="/compound/$slug" params={{ slug: compound.slug }} className="chip hover:border-cyan">{displayName(compound)} ↗</Link>
          <span className="text-[12px] muted">Not labelled true or false. Status describes tracking, not verdict.</span>
        </div>
        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-y hairline py-3" aria-label="Sections">
          {SECTIONS.map((s, i) => <a key={s} href={`#s${i}`} className="label hover:!text-bone">{s}</a>)}
        </nav>
      </header>

      <Sec i={0} title="Origin" lede="Earliest attributable support currently indexed.">
        {verifiedOrigin && origin ? <StudyCard study={origin} relationship="SUPPORTS" basis={origin.abstractQuote ?? null} /> : <EmptyState tone="amber" title="Source relationship unresolved" detail="The origin record could not be verified at build time and is not rendered as a citation." />}
      </Sec>

      <Sec i={1} title="Original scope" lede="Species, model, endpoint, wording — copied, not paraphrased.">
        <dl className="grid sm:grid-cols-2 gap-4">
          <div className="panel-flat p-4"><dt className="label">Species</dt><dd className="mt-2"><SpeciesBadge species={claim.originalScope.species} source="abstract" />{claim.originalScope.species && <span className="block mt-1 text-[11px] muted">stated in the abstract (cells derived from rat tissue); not stated in the title</span>}</dd></div>
          <div className="panel-flat p-4"><dt className="label">Model</dt><dd className="mt-2 text-sm">{claim.originalScope.model ?? '—'}</dd></div>
          <div className="panel-flat p-4"><dt className="label">Endpoint</dt><dd className="mt-2 text-sm">{claim.originalScope.endpoint ?? '—'}</dd></div>
          <div className="panel-flat p-4"><dt className="label">Wording</dt><dd className="mt-2 text-sm italic text-bone/85">{claim.originalScope.wording ? <>&ldquo;{claim.originalScope.wording}&rdquo;</> : 'Source relationship unresolved'}</dd>{claim.originalScope.wordingSource && <dd className="mono text-[11px] text-bone/45 mt-1">{claim.originalScope.wordingSource}</dd>}</div>
        </dl>
      </Sec>

      <Sec i={2} title="Claim lineage" lede="Research → interpretation → community. Every edge names its relationship; dashed edges are unresolved or have no source access.">
        <LineageGraph claim={claim} />
      </Sec>

      <Sec i={3} title="Claim mutation" lede="How language changes while a claim propagates. This is not automatically misinformation; each step is classified and linked to its source text.">
        <MutationLadder claim={claim} />
      </Sec>

      <Sec i={4} title="Research support" lede="Study records and their explicit relationship to this claim.">
        <div className="grid md:grid-cols-2 gap-3">
          {claim.support.map((s) => STUDY_BY_PMID[s.pmid] && <StudyCard key={s.pmid} study={STUDY_BY_PMID[s.pmid]} relationship={RELATIONSHIP_LABEL[s.relationship]} basis={s.basis} />)}
        </div>
      </Sec>

      <Sec i={5} title="Research contradictions" lede="Null and conflicting findings, methodological criticism.">
        {claim.contradictions.length ? claim.contradictions.map((s) => STUDY_BY_PMID[s.pmid] && <StudyCard key={s.pmid} study={STUDY_BY_PMID[s.pmid]} relationship="CONTRADICTS" basis={s.basis} />) : <EmptyState title="No contradictory study currently indexed" detail="A partially-supporting record (numerically lower scores without statistical significance) is listed under Research support with its exact wording. Absence from the corpus is not evidence of absence." />}
      </Sec>

      <Sec i={6} title="Human signal" lede={HUMAN_SIGNAL_LINE}>
        <CorpusHeader />
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{PLATFORMS.slice(0, 4).map((p) => <SourceCard key={p.id} platform={p.name} />)}</div>
      </Sec>

      <Sec i={7} title="Echo analysis" lede="Independent origins vs derivative mentions. Ten thousand posts are not ten thousand observations.">
        <div className="grid sm:grid-cols-3 gap-3">
          {[['Raw mentions', '0'], ['Estimated independent origin clusters', '0'], ['Derivative / echo mentions', '0']].map(([k, v]) => (
            <div key={k} className="panel-flat p-5"><p className="label">{k}</p><p className="display text-4xl mt-2 text-bone/60">{v}</p><p className="mono text-[11px] text-bone/45 mt-2">{CORPUS.header}</p></div>
          ))}
        </div>
        <p className="mt-3 text-sm muted">{EMPTY_PLATFORM}. No relationship (independent origin / response / repost / derivative / near duplicate / unknown) has been assigned because no mention exists in the corpus.</p>
      </Sec>

      <Sec i={8} title="Translation state" lede="Where the claim has actually been tested.">
        <TranslationTrack rows={Object.entries(claim.translation).map(([outcome, stages]) => ({ outcome, stages }))} />
        <p className="mt-3 mono text-[11px] text-bone/45">Stages: {TRANSLATION_STAGES.map((s) => s.label).join(' → ')}</p>
      </Sec>

      <Sec i={9} title="Current interpretation" lede="Constrained synthesis. Every sentence maps to a record above or an explicit empty state.">
        <ol className="grid gap-3">
          {claim.interpretation.map((line, i) => <li key={i} className="panel-flat p-4 text-sm text-bone/85 flex gap-3"><span className="mono text-bone/40">{i + 1}</span><span>{line}</span></li>)}
        </ol>
        <p className="mt-3 text-[12px] muted">{BRAND} structured summary — generated from the structured records on this page, not free-form. Supporting records: {claim.support.filter((s) => STUDY_BY_PMID[s.pmid]?.status === 'verified').map((s) => <SourceBadge key={s.pmid} pmid={s.pmid} verified link={false} />)}</p>
      </Sec>

      <Sec i={10} title="Change history" lede="Every material modification. Nothing is silently rewritten.">
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
