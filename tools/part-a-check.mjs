/** Direct-URL smoke checks for the local Part A review build. No browser navigation required. */
const base = process.env.PART_A_BASE_URL || 'http://127.0.0.1:8080'
const retired = {
  '/shop': '/learn',
  '/waitlist': '/learn',
  '/bond-theory': '/learn/chainforge',
  '/combinations': '/learn?activity=evidence&case=3',
  '/research-tools': '/learn?activity=scale',
  '/research-tools/preclinical-calculator': '/learn?activity=scale',
  '/coa': '/learn?activity=report',
  '/targets': '/observatory?station=molecule',
  '/pulse': '/learn?activity=history',
  '/pulse/review': '/learn?activity=history',
  '/timeline': '/learn?activity=history',
  '/watchlist': '/learn?activity=history',
  '/account': '/privacy',
  '/saved': '/learn',
  '/compound/wolverine-blend': '/learn?activity=evidence',
}
const kept = ['/learn/chainforge', '/learn?activity=evidence', '/', '/explore', '/learn', '/observatory', '/signal', '/compare', '/claims', '/methodology', '/coverage', '/about', '/contact', '/corrections', '/privacy', '/terms', '/learn/how-internet-claims-mutate', '/claim/CLAIM-BPC157-TENDON-REPAIR', '/claim/CLAIM-TB4-CELL-MIGRATION', '/study/21030672', '/status/ss-31', '/compound/thymosin-beta-4']
const profiles = ['aod-9604','bpc-157','cerebrolysin','cjc-1295','epitalon','follistatin-344','ghk-cu','ghrp-2','ghrp-6','glutathione','hexarelin','humanin','igf-1-lr3','ipamorelin','kisspeptin-10','kpv','ll-37','melanotan-ii','mots-c','nad-plus','p21','pinealon','pt-141','retatrutide','selank','semaglutide','semax','sermorelin','ss-31','tb-500','tesamorelin','thymalin','thymogen','thymosin-alpha-1','tirzepatide','thymosin-beta-4']
const lessons = ['how-internet-claims-mutate','how-animal-research-works','what-in-vitro-means','why-replication-matters','correlation-vs-causation','how-peptides-interact-with-receptors','why-source-independence-matters','reading-a-research-paper','understanding-clinical-trial-phases','research-vs-anecdote']
const studies = ['21030672','42542926','41754849','40789979','40756949','34170491','32245208','36706591','41235866']
let failed = 0
async function check(path, expectedStatus, expectedLocation) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' })
  const location = response.headers.get('location')
  const ok = response.status === expectedStatus && (expectedLocation === undefined || location === expectedLocation)
  console.log(`${ok ? 'PASS' : 'FAIL'} ${path} ${response.status}${location ? ` → ${location}` : ''}`)
  if (!ok) failed++
  return response
}
for (const [path, destination] of Object.entries(retired)) await check(path, 302, destination)
for (const path of kept) await check(path, 200)
for (const slug of profiles) await check(`/compound/${slug}`, 200)
for (const slug of profiles) await check(`/status/${slug}`, 200)
for (const slug of lessons) await check(`/learn/${slug}`, 200)
for (const pmid of studies) await check(`/study/${pmid}`, 200)
for (const path of ['/api/checkout', '/api/payments/stripe/webhook', '/api/pulse', '/api/pulse-review']) await check(path, 410)
for (const path of ['/api/checkout', '/api/payments/stripe/webhook', '/api/pulse', '/api/pulse-review']) {
  const response = await fetch(new URL(path, base), { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
  console.log(`${response.status===410?'PASS':'FAIL'} POST ${path} ${response.status}`)
  if(response.status!==410)failed++
}
for(const [path,status] of [['checkout',404],['payment-stripe-webhook',404],['pulse',404],['pulse-review',404],['pulse-collect',410],['pulse-run-background',202]]) await check('/.netlify/functions/'+path,status)
await check('/api/editorial', 200)
const closedPost = await fetch(new URL('/api/editorial', base), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page: '/compound/bpc-157', statement: 'A factual correction for review.' }) })
const postOk = closedPost.status === 503
console.log(`${postOk ? 'PASS' : 'FAIL'} POST /api/editorial ${closedPost.status} (closed until configured and delivery-tested)`)
if (!postOk) failed++
const robots = await check('/robots.txt', 200)
const robotsText = await robots.text()
const robotsHeld = robotsText.includes('Disallow: /')
console.log(`${robotsHeld ? 'PASS' : 'FAIL'} robots.txt blocks indexing until release review`)
if (!robotsHeld) failed++
const sitemap = await check('/sitemap.xml', 200)
const sitemapText = await sitemap.text()
const sitemapClean = !['/shop<', '/waitlist<', '/bond-theory<', '/research-tools<', '/pulse<', '/account<', '/saved<', '/coa<', '/combinations<', '/targets<', '/watchlist<', '/timeline<'].some(path => sitemapText.includes(path)) && sitemapText.includes('/compound/thymosin-beta-4<')
console.log(`${sitemapClean ? 'PASS' : 'FAIL'} sitemap excludes retired URLs and includes split thymosin identity`)
if (!sitemapClean) failed++
await check('/pulse.json', 404)
console.log(`\n${failed ? `${failed} failed` : 'All direct-URL checks passed'} · ${Object.keys(retired).length} retired routes · ${kept.length} core routes · ${profiles.length} profiles and regulatory variants · ${lessons.length} lessons · ${studies.length} citation routes · 5 API checks + static endpoints`)
if (failed) process.exitCode = 1
