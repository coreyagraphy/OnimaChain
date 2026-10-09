import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/coa')({
  beforeLoad: () => { throw redirect({ to: '/learn', search: { activity: 'report' }, statusCode: 302 }) },
})
