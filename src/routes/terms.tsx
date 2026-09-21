import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '~/components/EmptyState'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms — Cyravon' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Terms</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Terms</h1>
      <div className="mt-8 max-w-2xl">
        <EmptyState title="In production." detail="Research and educational information. Cyravon does not provide individualized medical advice or facilitate the purchase of research compounds." />
      </div>
    </div>
  ),
})
