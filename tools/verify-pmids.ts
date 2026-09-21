/*
 * Build-time PMID verification.
 *
 * For every candidate in src/data/studies.ts, resolve the PMID against NCBI eutils esummary and
 * require that the resolved title contains the expected keyword. Writes src/data/verified.json.
 *
 *  - PMID does not resolve, or title lacks the keyword  → exit 1 (the build fails). Never ship an unverifiable citation.
 *  - eutils unreachable (network)                         → verified.json { reachable: false } and exit 0;
 *                                                            the UI renders every study as "Source relationship unresolved".
 *
 * Run: node --experimental-strip-types tools/verify-pmids.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const studiesPath = resolve(here, '../src/data/studies.ts')
const outPath = resolve(here, '../src/data/verified.json')

// Extract candidates without importing (studies.ts imports the JSON we are about to write).
const src = readFileSync(studiesPath, 'utf8')
const candidates: Array<{ pmid: string; expectKeyword: string }> = []
const re = /pmid:\s*'(\d+)'[\s\S]*?expectKeyword:\s*'([^']+)'/g
let m: RegExpExecArray | null
while ((m = re.exec(src))) candidates.push({ pmid: m[1], expectKeyword: m[2] })
if (!candidates.length) {
  console.error('verify-pmids: no candidates found in studies.ts')
  process.exit(1)
}

const ids = candidates.map((c) => c.pmid).join(',')
const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`
const checkedAt = new Date().toISOString()

interface ESummary {
  uid: string
  title?: string
  pubdate?: string
  source?: string
  fulljournalname?: string
  authors?: Array<{ name: string }>
  lastauthor?: string
  pubtype?: string[]
  articleids?: Array<{ idtype: string; value: string }>
  error?: string
}

type EResp = { result?: Record<string, ESummary | string[]> }
let json: EResp | null = null
try {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 20000)
  const res = await fetch(url, { signal: ctrl.signal })
  clearTimeout(t)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  json = (await res.json()) as EResp
} catch (e) {
  console.warn(`verify-pmids: eutils unreachable (${(e as Error).message}). Writing reachable:false — all studies render as unverified.`)
  writeFileSync(outPath, JSON.stringify({ reachable: false, checkedAt, records: {} }, null, 2))
  process.exit(0)
}

const result = json?.result ?? {}
const records: Record<string, unknown> = {}
const failures: string[] = []
for (const c of candidates) {
  const r = result[c.pmid] as ESummary | undefined
  if (!r || r.error || !r.title) {
    failures.push(`${c.pmid}: did not resolve`)
    continue
  }
  if (!r.title.toLowerCase().includes(c.expectKeyword.toLowerCase())) {
    failures.push(`${c.pmid}: title "${r.title}" does not contain "${c.expectKeyword}"`)
    continue
  }
  const yearMatch = (r.pubdate ?? '').match(/\d{4}/)
  records[c.pmid] = {
    pmid: c.pmid,
    title: r.title,
    year: yearMatch ? Number(yearMatch[0]) : null,
    journal: r.source ?? r.fulljournalname ?? '',
    authors: (r.authors ?? []).map((a) => a.name),
    lastAuthor: r.lastauthor ?? '',
    pubTypes: r.pubtype ?? [],
    doi: r.articleids?.find((a) => a.idtype === 'doi')?.value ?? null,
    verifiedAt: checkedAt,
  }
  console.log(`ok  ${c.pmid}  ${r.title}`)
}

if (failures.length) {
  console.error('verify-pmids: FAILED\n  ' + failures.join('\n  '))
  process.exit(1)
}
writeFileSync(outPath, JSON.stringify({ reachable: true, checkedAt, records }, null, 2))
console.log(`verify-pmids: ${Object.keys(records).length}/${candidates.length} verified → ${outPath}`)
