import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '~/components/EmptyState'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/saved')({
  head: () => ({ meta: [{ title: `Saved — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Your shortlist.</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Saved</h1>
      <div className="mt-8 max-w-2xl">
        <EmptyState title="Nothing saved yet." detail="Soon you will be able to save products, claims, studies and comparisons here. We will never turn your list into medical advice." />
      </div>
    </div>
  ),
})
