import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '~/components/EmptyState'

export const Route = createFileRoute('/saved')({
  head: () => ({ meta: [{ title: 'Saved — Cyravon' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Saved</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Saved</h1>
      <div className="mt-8 max-w-2xl">
        <EmptyState title="No saved items. Personal research collections are in production." detail="Collections will hold compounds, claims, studies, sources and comparisons. No personalized medical recommendations." />
      </div>
    </div>
  ),
})
