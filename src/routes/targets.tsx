import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/targets')({
  beforeLoad: () => { throw redirect({ to: '/observatory', search: { station: 'molecule' }, statusCode: 302 }) },
})
