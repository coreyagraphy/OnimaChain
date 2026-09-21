import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '~/components/EmptyState'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Privacy</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Privacy</h1>
      <div className="mt-8 max-w-2xl">
        <EmptyState title="In production." detail={`Research and educational information. ${BRAND} does not provide individualized medical advice or facilitate the purchase of research compounds.`} />
      </div>
    </div>
  ),
})
