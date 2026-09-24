import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/research-tools')({
  beforeLoad: () => { throw redirect({ to: '/observatory', search: { station: 'scale' }, statusCode: 302 }) },
})
