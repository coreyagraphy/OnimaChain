import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/bond-theory')({
  beforeLoad: () => { throw redirect({ to: '/learn/chainforge', statusCode: 302 }) },
})
