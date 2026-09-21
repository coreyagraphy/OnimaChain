import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '~/components/EmptyState'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/corrections')({
  head: () => ({ meta: [{ title: `Corrections — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-amber">Corrections</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">When we get something wrong, it goes here.</h1>
      <p className="lede mt-5 max-w-2xl">Every fix is logged with the date, what changed, the old version, the new version, why, and the source. We never quietly delete the old version.</p>
      <div className="mt-10 panel-flat overflow-x-auto"><table className="data"><thead><tr><th>Date</th><th>What changed</th><th>Before</th><th>After</th><th>Why</th><th>Source</th></tr></thead><tbody><tr><td colSpan={6} className="!p-0"><EmptyState compact title="Nothing to correct yet." detail="The ledger opened 2026-09-20 with the first claim records. Submit an error via Report an error (in production)." /></td></tr></tbody></table></div>
    </div>
  ),
})
