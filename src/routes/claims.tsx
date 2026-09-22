import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CLAIMS } from '~/data/claims'
import { ClaimCard } from '~/components/ClaimCard'
import { BRAND } from '~/brand'
import { RESEARCH_ENTITIES, entityTypeLabel } from '~/data/research-entities'

export const Route = createFileRoute('/claims')({
  head: () => ({ meta: [{ title: `Claims — ${BRAND}` }] }),
  component: Claims,
})

function Claims() {
  const [entityId, setEntityId] = useState('all')
  const shown = entityId === 'all' ? CLAIMS : CLAIMS.filter((claim) => claim.compound === entityId)
  return <div className="pt-28 wrap">
    <p className="label label-cyan">Claims</p>
    <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Every claim, traced back to where it started.</h1>
    <p className="lede mt-5 max-w-2xl">For each one you can see the first study it came from, what that study actually tested, how the wording changed as it spread, which studies push back, and our short plain-English reading.</p>
    <label className="grid gap-2 mt-8 max-w-sm"><span className="label">Research record</span>
      <select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
        <option value="all">All tracked claims</option>
        {RESEARCH_ENTITIES.map((entity) => <option key={entity.id} value={entity.id}>{entity.name} · {entityTypeLabel(entity)}</option>)}
      </select>
    </label>
    {shown.length ? <div className="mt-6 grid md:grid-cols-2 gap-4">{shown.map((claim) => <ClaimCard key={claim.id} claim={claim} />)}</div> : <div className="mt-6 panel-flat p-6 text-sm muted">No claims are indexed to this exact record. A related component or shared receptor does not transfer a claim to a stack, combination, or Watchlist entry.</div>}
    <p className="mt-6 mono text-[11px] text-bone/45">{shown.length} shown · {CLAIMS.length} claims tracked in the canonical evidence ledger</p>
  </div>
}
