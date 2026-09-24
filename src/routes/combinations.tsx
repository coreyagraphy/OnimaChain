import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/combinations')({
  beforeLoad: () => { throw redirect({ to: '/observatory', search: { station: 'evidence', case: 3 }, statusCode: 302 }) },
})
