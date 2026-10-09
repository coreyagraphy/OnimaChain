/** Historical collector is disabled; no new public snapshot should be produced. */
export default async () => new Response('Automated collection is paused pending editorial review.', { status: 410, headers: { 'cache-control': 'no-store' } })
