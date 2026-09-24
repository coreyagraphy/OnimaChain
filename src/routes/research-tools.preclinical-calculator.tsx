import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/research-tools/preclinical-calculator')({
  beforeLoad: () => { throw redirect({ to: '/learn', search: { activity: 'scale' }, statusCode: 302 }) },
})
