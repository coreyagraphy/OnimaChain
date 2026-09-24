import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/bond-theory')({
  beforeLoad: () => { throw redirect({ to: '/observatory', search: { station: 'evidence' }, statusCode: 302 }) },
})
