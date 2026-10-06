import { createFileRoute, Link } from '@tanstack/react-router'
import { CLAIMS } from '~/data/claims'
import { ClaimCard } from '~/components/ClaimCard'
import { BRAND } from '~/brand'
import { ActivitySculpture } from '~/components/ExperienceLaunchpad'

export const Route = createFileRoute('/claims')({
  head: () => ({ meta: [{ title: `Claims — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <div className="research-opening"><div><p className="label label-cyan">THE RESEARCH / LOOK CLOSER</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Question the claim. Open the source.</h1>
      <p className="lede mt-5 max-w-2xl">These are claims people make, not findings we endorse. We are still reviewing how well each source supports them. Use them to practice telling what a study saw from what people say it means.</p>
      <Link to="/observatory" search={{ station: "evidence" }} className="btn btn-primary mt-7">Try it: spot the leap ↗</Link></div><div className="research-sculpture"><ActivitySculpture shape="portal"/><span>A study is a starting point.<br/>Not a promise.</span></div></div><div className="mt-10 grid md:grid-cols-2 gap-4">{CLAIMS.map((c) => <ClaimCard key={c.id} claim={c} />)}</div>
      <p className="mt-6 mono text-[11px] text-bone/45">{CLAIMS.length} claims listed · review still in progress</p>
    </div>
  ),
})
