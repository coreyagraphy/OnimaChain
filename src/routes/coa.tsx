import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/coa')({
  beforeLoad: () => { throw redirect({ to: '/observatory', search: { station: 'report' }, statusCode: 302 }) },
})
