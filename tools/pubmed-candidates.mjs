// Research helper: list PubMed candidates (title, year, journal, type, start of abstract) for each molecule,
// straight from NCBI. Nothing here is published; a person picks studies from this list and tools/verify-pmids.ts
// re-checks every chosen PMID at build time.   node tools/pubmed-candidates.mjs [slug ...]
import { writeFileSync } from 'node:fs'

const TERMS = {
  'tb-500': '"TB-500"[Title/Abstract]',
  'ghk-cu': '"GHK-Cu"[Title] OR "glycyl-l-histidyl-l-lysine"[Title] OR ("GHK"[Title] AND copper[Title/Abstract])',
  'kpv': '"KPV"[Title] AND (peptide[Title/Abstract] OR tripeptide[Title/Abstract])',
  'll-37': '"LL-37"[Title]',
  'thymosin-alpha-1': '"thymosin alpha 1"[Title] OR "thymosin alpha-1"[Title] OR thymalfasin[Title]',
  'epitalon': 'epitalon[Title/Abstract] OR epithalon[Title/Abstract]',
  'mots-c': '"MOTS-c"[Title]',
  'ss-31': '"SS-31"[Title] OR elamipretide[Title]',
  'humanin': 'humanin[Title]',
  'selank': 'selank[Title]',
  'semax': 'semax[Title]',
  'pinealon': 'pinealon[Title/Abstract]',
  'ipamorelin': 'ipamorelin[Title]',
  'cjc-1295': '"CJC-1295"[Title/Abstract]',
  'sermorelin': 'sermorelin[Title]',
}
const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const get = async (url) => { for (let i = 0; i < 4; i++) { const r = await fetch(url); if (r.ok) return r.text(); await sleep(1200) } throw new Error('NCBI unreachable: ' + url) }
const pick = (xml, tag) => [...xml.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())

const want = process.argv.slice(2)
const out = {}
for (const [slug, term] of Object.entries(TERMS)) {
  if (want.length && !want.includes(slug)) continue
  const s = JSON.parse(await get(`${BASE}esearch.fcgi?db=pubmed&retmode=json&retmax=8&sort=relevance&term=${encodeURIComponent(term)}`))
  const ids = s.esearchresult.idlist
  await sleep(400)
  const xml = ids.length ? await get(`${BASE}efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(',')}`) : ''
  await sleep(400)
  out[slug] = xml.split('<PubmedArticle>').slice(1).map((a) => ({
    pmid: pick(a, 'PMID')[0],
    title: pick(a, 'ArticleTitle')[0],
    year: (a.match(/<PubDate>[\s\S]*?<Year>(\d{4})/) || [])[1] || null,
    journal: pick(a, 'ISOAbbreviation')[0] || pick(a, 'Title')[0],
    types: pick(a, 'PublicationType'),
    abstract: pick(a, 'AbstractText').join(' '),
  }))
  console.log(`\n=== ${slug} (${s.esearchresult.count} hits)`)
  for (const r of out[slug].slice(0, 6)) console.log(`- ${r.pmid} | ${r.year} | ${r.journal} | ${r.types.filter((t) => !/Research Support|Journal Article/.test(t)).join(', ') || 'article'}\n  T: ${r.title}\n  A: ${r.abstract.slice(0, 260) || '(no abstract)'}`)
}
writeFileSync(new URL(`./.pubmed-candidates-${want[0] || 'all'}.json`, import.meta.url), JSON.stringify(out, null, 1))
