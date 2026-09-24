import { createFileRoute } from '@tanstack/react-router'
import { CLAIMS } from '~/data/claims'
import { ClaimCard } from '~/components/ClaimCard'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/claims')({
  head: () => ({ meta: [{ title: `Claims — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Claims</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Question the claim. Open the source.</h1>
      <p className="lede mt-5 max-w-2xl">These are tracked statements, not endorsed findings. Citation metadata has been checked for some linked records; exact source-to-claim interpretation is being reviewed. Use the examples to practice separating observations from extrapolations.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4">{CLAIMS.map((c) => <ClaimCard key={c.id} claim={c} />)}</div>
      <p className="mt-6 mono text-[11px] text-bone/45">{CLAIMS.length} statements indexed for critical appraisal · Claim-level review pending</p>
    </div>
  ),
})
