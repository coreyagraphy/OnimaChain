import { Link } from '@tanstack/react-router'
import { pubmedUrl, type Study } from '~/data/studies'
import { EvidenceChip } from './EvidenceChip'
import { SpeciesBadge } from './SpeciesBadge'
import { SourceBadge } from './SourceBadge'

interface Props { study: Study; compact?: boolean; relationship?: string; basis?: string | null }

/** A study record. Only verified records render title/journal; unverified render as unresolved. */
export function StudyCard({ study, compact = false, relationship, basis }: Props) {
  if (study.status !== 'verified' || !study.meta) {
    return (
      <div className="panel p-4 border-dashed">
        <SourceBadge pmid={study.pmid} verified={false} />
        <p className="text-sm muted mt-2">Record {study.pmid} could not be verified at build time; it is not rendered as a citation.</p>
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
        {relationship && <span className={`chip ${relationship === 'SUPPORTS' ? 'chip-cyan' : relationship === 'CONTRADICTS' ? 'chip-amber' : ''}`}>{relationship}</span>}
      </div>
      <h4 className={`mt-3 font-semibold text-bone/95 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
        <Link to="/study/$pmid" params={{ pmid: study.pmid }} className="hover:text-cyan">
          {m.title}
        </Link>
      </h4>
      <p className="mono text-[11px] text-bone/55 mt-2">
        {m.journal} · {m.year ?? 'year n/a'} · {m.authors.length} authors · last author {m.lastAuthor || 'n/a'}
        {m.doi && <> · doi {m.doi}</>}
      </p>
      {!compact && basis && (
        <blockquote className="mt-3 text-sm text-bone/75 border-l-2 border-cyan/40 pl-3 italic">
          &ldquo;{basis}&rdquo; <span className="not-italic mono text-[10px] text-bone/45">— abstract, PMID {study.pmid}</span>
        </blockquote>
      )}
      <p className="mono text-[10px] text-bone/40 mt-2">
        Verified {new Date(m.verifiedAt).toISOString().slice(0, 10)} via NCBI eutils esummary
        {' · '}
        <a href={pubmedUrl(study.pmid)} target="_blank" rel="noreferrer noopener" className="hover:text-cyan">PubMed ↗</a>
      </p>
    </article>
  )
}
