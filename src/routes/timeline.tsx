import { createFileRoute, redirect } from '@tanstack/react-router'

/** The old change-log language overstated its provenance; use the sourced learning timeline. */
export const Route = createFileRoute('/timeline')({
  beforeLoad: () => { throw redirect({ to: '/learn', search: { activity: 'history' }, statusCode: 302 }) },
})
