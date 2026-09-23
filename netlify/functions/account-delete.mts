import { admin, getUser, verifyRequestOrigin } from '@netlify/identity'

export default async function accountDelete(request: Request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } })

  try {
    verifyRequestOrigin(request)
    const user = await getUser()
    if (!user) return Response.json({ error: 'Sign in before deleting an account.' }, { status: 401 })
    await admin.deleteUser(user.id)
    return Response.json({ deleted: true })
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : 500
    return Response.json({ error: status === 403 ? 'The account request came from an untrusted origin.' : 'The account could not be deleted. Try again or contact OnimaChain.' }, { status })
  }
}
