import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
const Game = lazy(() => import('~/game/chainforge/ChainforgeGame'))
export const Route = createFileRoute('/learn_/chainforge')({
  head: () => ({
    meta: [
      { title: 'Chainforge — Play & Learn | OnimaChain' },
      {
        name: 'description',
        content:
          'Capture, guide and connect building blocks in a fictional sequence puzzle. Practice at your pace.',
      },
    ],
  }),
  component: () => (
    <Suspense fallback={<div className="wrap">Loading Chainforge…</div>}>
      <Game />
    </Suspense>
  ),
})
