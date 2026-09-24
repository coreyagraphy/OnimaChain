import { createFileRoute, redirect } from '@tanstack/react-router'

/** The old automated-feed review UI is paused with the public feed. */
export const Route = createFileRoute('/pulse_/review')({
  beforeLoad: () => { throw redirect({ to: '/observatory', search: { station: 'history' }, statusCode: 302 }) },
})
