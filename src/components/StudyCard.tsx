import { Link } from '@tanstack/react-router'
import { pubmedUrl, type Study } from '~/data/studies'
import { EvidenceChip } from './EvidenceChip'
import { SpeciesBadge } from './SpeciesBadge'
import { SourceBadge } from './SourceBadge'

interface Props { study: Study; compact?: boolean; relationship?: string; basis?: string | null }

/** A citation record. Metadata verification never implies claim review. */
export function StudyCard({ study, compact = false, relationship, basis }: Props) {
  if (study.status !== 'verified' || !study.meta) {
    return (
      <div className="panel p-4 border-dashed">
        <SourceBadge pmid={study.pmid} verified={false} />
        <p className="text-sm muted mt-2">Record {study.pmid} could not be confirmed on PubMed, so we do not show it as a source.</p>
      </div>
    )
  }
  const m = study.meta
  return (
    <article className={`panel ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-wrap gap-2 items-center">
        <SourceBadge pmid={study.pmid} verified />
        <EvidenceChip type={study.studyType} />
        <SpeciesBadge species={study.speciesFromTitle} />
        {relationship && <span className="chip chip-amber">Proposed relation: {relationship} · review pending</span>}
      </div>
      <h4 className={`mt-3 font-semibold text-bone/95 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
        <Link to="/study/$pmid" params={{ pmid: study.pmid }} className="hover:text-cyan">
          {m.title}
        </Link>
      </h4>
      <p className="mono text-[11px] text-bone/55 mt-2">
        {m.journal} · {m.year ?? 'year n/a'} · {m.authors.length} authors · senior author {m.lastAuthor || 'n/a'}
        {m.doi && <> · doi {m.doi}</>}
      </p>
      {!compact && basis && (
        <blockquote className="mt-3 text-sm text-bone/75 border-l-2 border-cyan/40 pl-3 italic">
          &ldquo;{basis}&rdquo; <span className="not-italic mono text-[10px] text-bone/45">— from the study summary, PubMed ID {study.pmid}</span>
        </blockquote>
      )}
      <p className="mono text-[10px] text-bone/40 mt-2">
        Citation metadata checked against PubMed on {new Date(m.verifiedAt).toISOString().slice(0, 10)} · not a scientific claim review
        {' · '}
        <a href={pubmedUrl(study.pmid)} target="_blank" rel="noreferrer noopener" className="hover:text-cyan">PubMed ↗</a>
      </p>
    </article>
  )
}
