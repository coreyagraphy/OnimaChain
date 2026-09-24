/** Scheduled public-feed collection is paused for the Part A educational review. */
export default async () => new Response('Automated collection is paused pending editorial review.', { status: 410, headers: { 'cache-control': 'no-store' } })
