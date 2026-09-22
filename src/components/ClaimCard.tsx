import { Link } from '@tanstack/react-router'
import type { Claim } from '~/data/claims'
import { RESEARCH_ENTITY_BY_ID, commerceLabelFor } from '~/data/research-entities'
import { STUDY_BY_PMID } from '~/data/studies'
import { SourceBadge } from './SourceBadge'

/** Canonical claim card. Status is "Tracked research claim" — never TRUE/FALSE. */
export function ClaimCard({ claim }: { claim: Claim }) {
  const origin = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : undefined
  const supports = claim.support.filter((s) => STUDY_BY_PMID[s.pmid]?.status === 'verified')
  return (
    <Link to="/claim/$id" params={{ id: claim.id }} className="panel neon-card p-5 block card-tilt hover:border-cyan/40">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono text-[11px] text-bone/55">{claim.id}</span>
        <span className="chip">A claim we track</span>
      </div>
      <h3 className="display-md text-xl md:text-2xl mt-3">&ldquo;{claim.title}&rdquo;</h3>
      <p className="text-sm muted mt-2">{RESEARCH_ENTITY_BY_ID[claim.compound]?.name ?? claim.compound} · about: {claim.outcomeTheme} · {RESEARCH_ENTITY_BY_ID[claim.compound] ? commerceLabelFor(RESEARCH_ENTITY_BY_ID[claim.compound]) : 'Research record'}</p>
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-[11px] label">Started with</span>
        <SourceBadge pmid={claim.originStudy} verified={origin?.status === 'verified'} link={false} />
        <span className="mono text-[11px] text-bone/55">{supports.length} checked stud{supports.length === 1 ? 'y' : 'ies'} linked</span>
      </div>
    </Link>
  )
}
