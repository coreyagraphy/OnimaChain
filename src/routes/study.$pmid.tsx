import { createFileRoute, Link } from '@tanstack/react-router'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { STUDY_BY_PMID, pubmedUrl } from '~/data/studies'
import { EvidenceChip } from '~/components/EvidenceChip'
import { SpeciesBadge } from '~/components/SpeciesBadge'
import { SourceBadge } from '~/components/SourceBadge'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/study/$pmid')({
  component: StudyPage,
  head: ({ params }) => {
    const study = STUDY_BY_PMID[params.pmid]
    const title = study?.meta?.title
    return {
      meta: [
        {
          title: title
            ? `${title} — ${BRAND}`
            : `PMID ${params.pmid} — ${BRAND}`,
        },
        {
          name: 'description',
          content: title
            ? `Indexed study record for PMID ${params.pmid}.`
            : `PMID ${params.pmid} is not an indexed, verified study in this catalog.`,
        },
      ],
    }
  },
})

function StudyPage() {
  const { pmid } = Route.useParams()
  const study = STUDY_BY_PMID[pmid]

  if (!study) {
    return (
      <main className="wrap pt-28 pb-20">
        <p className="label label-amber">Not indexed</p>
        <h1 className="display text-[clamp(2.2rem,5vw,4.2rem)] mt-3">This PMID is not in the atlas.</h1>
        <p className="lede mt-5 max-w-2xl">
          {BRAND} only renders a study page when the identifier was added as a candidate and checked against NCBI at build time.
          We do not invent a citation to fill the gap.
        </p>
        <p className="mono text-sm text-bone/55 mt-6">Requested PMID {pmid}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn" href={pubmedUrl(pmid)} target="_blank" rel="noreferrer noopener">Open PubMed ↗</a>
          <Link to="/explore" className="btn btn-primary">Back to the catalog</Link>
        </div>
      </main>
    )
  }

  if (study.status !== 'verified' || !study.meta) {
    return (
      <main className="wrap pt-28 pb-20">
        <p className="label label-amber">Source relationship unresolved</p>
        <h1 className="display text-[clamp(2.2rem,5vw,4.2rem)] mt-3">PMID {pmid} could not be verified.</h1>
        <p className="lede mt-5 max-w-2xl">
          The identifier is on the candidate list, but NCBI eutils did not confirm the title at build time.
          It is not shown as a citation anywhere else in the site.
        </p>
        <a className="btn mt-8" href={pubmedUrl(pmid)} target="_blank" rel="noreferrer noopener">Check PubMed ↗</a>
      </main>
    )
  }

  const m = study.meta
  const linked = study.compounds.map((slug) => COMPOUND_BY_SLUG[slug]).filter(Boolean)

  return (
    <main className="wrap pt-28 pb-24">
      <p className="label label-cyan">Study record</p>
      <h1 className="display text-[clamp(1.8rem,4.2vw,3.4rem)] mt-4 max-w-5xl leading-[1.15]">{m.title}</h1>
      <div className="mt-6 flex flex-wrap gap-2 items-center">
        <SourceBadge pmid={study.pmid} verified />
        <EvidenceChip type={study.studyType} />
        <SpeciesBadge species={study.speciesFromTitle} />
      </div>
      <p className="mono text-sm text-bone/60 mt-5">
        {m.journal} · {m.year ?? 'year n/a'} · {m.authors.length} authors · last author {m.lastAuthor || 'n/a'}
        {m.doi ? ` · doi ${m.doi}` : ''}
      </p>
      <p className="mono text-[11px] text-bone/40 mt-2">
        Verified {m.verifiedAt.slice(0, 10)} via NCBI eutils esummary. Title keyword check: “{study.expectKeyword}”.
      </p>

      {study.abstractQuote && (
        <blockquote className="mt-10 max-w-3xl text-lg leading-relaxed text-bone/80 border-l-2 border-cyan/40 pl-5 italic">
          “{study.abstractQuote}”
          <footer className="not-italic mono text-[11px] text-bone/45 mt-3">Abstract, PMID {study.pmid}</footer>
        </blockquote>
      )}

      <section className="mt-12">
        <p className="label">Mapped compounds</p>
        {linked.length ? (
          <ul className="mt-4 grid sm:grid-cols-2 gap-3 max-w-3xl">
            {linked.map((c) => (
              <li key={c.slug}>
                <Link to="/compound/$slug" params={{ slug: c.slug }} className="panel p-4 block hover:border-cyan/40">
                  <span className="display-md text-xl">{displayName(c)}</span>
                  <span className="block mono text-[11px] text-bone/45 mt-1">{c.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm muted">No compound in this catalog is linked to this record.</p>
        )}
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <a className="btn btn-primary" href={pubmedUrl(study.pmid)} target="_blank" rel="noreferrer noopener">Read on PubMed ↗</a>
        {m.doi && (
          <a className="btn" href={`https://doi.org/${m.doi}`} target="_blank" rel="noreferrer noopener">DOI ↗</a>
        )}
      </div>
    </main>
  )
}
