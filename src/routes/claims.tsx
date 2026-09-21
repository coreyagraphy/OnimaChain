import { createFileRoute } from '@tanstack/react-router'
import { CLAIMS } from '~/data/claims'
import { ClaimCard } from '~/components/ClaimCard'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/claims')({
  head: () => ({ meta: [{ title: `Claims — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Claims</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Every claim, traced back to where it started.</h1>
      <p className="lede mt-5 max-w-2xl">For each one you can see the first study it came from, what that study actually tested, how the wording changed as it spread, which studies push back, and our short plain-English reading.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4">{CLAIMS.map((c) => <ClaimCard key={c.id} claim={c} />)}</div>
      <p className="mt-6 mono text-[11px] text-bone/45">{CLAIMS.length} claims tracked · Soon: paste any claim you saw online and we will check it against the studies we have.</p>
    </div>
  ),
})
