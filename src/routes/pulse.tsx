import { createFileRoute, redirect } from '@tanstack/react-router'

/** The unverified live-feed presentation is consolidated into a sourced timeline lesson. */
export const Route = createFileRoute('/pulse')({
  beforeLoad: () => { throw redirect({ to: '/learn', search: { activity: 'history' }, statusCode: 302 }) },
})
