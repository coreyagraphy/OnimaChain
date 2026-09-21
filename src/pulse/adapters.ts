import { COMPOUNDS, type Compound } from '../data/compounds.ts'
import type { SourceItem } from './types.ts'

/*
 * Source adapters. Each one fetches, normalizes into SourceItem, and never throws: a failed source returns
 * { ok: false } and the run carries on with the others.
 *
 *   Tier A (primary)    PubMed · ClinicalTrials.gov · FDA          — no keys needed, on by default
 *   Tier B (reporting)  news RSS feeds listed in PULSE_NEWS_FEEDS  — on when feeds are configured
 *   Tier C (commentary) YouTube Data API                           — on when YOUTUBE_API_KEY is set
 *   Tier D (community)  Reddit                                     — off: commercial use needs a Reddit data agreement
 *   Tier E (community)  TikTok                                     — off: the Research API excludes commercial users
 */

export interface AdapterResult { source: string; ok: boolean; items: SourceItem[]; note: string }
export interface AdapterEnv { youtubeKey?: string; newsFeeds?: string[]; runCount: number; now: Date; ncbiKey?: string }

const UA = 'PulseChain/1.0 (peptide research tracker)'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const iso = (d: Date) => d.toISOString()
const daysAgo = (now: Date, n: number) => new Date(now.getTime() - n * 864e5)

/** Search terms per compound: the real name plus distinctive aliases (short or generic aliases would flood results). */
export function termsFor(c: Compound): string[] {
  const out = new Set<string>([c.name])
  for (const a of c.aliases) if (a.length >= 5 && !/blend|stack|synthetic|fragment|complex/i.test(a)) out.add(a)
  return [...out].slice(0, 4)
}

/** Compounds with huge publication volume get title-only searches and a smaller cap. */
const HIGH_VOLUME = new Set(['semaglutide', 'tirzepatide', 'glutathione', 'nad-plus', 'thymosin-alpha-1', 'll-37'])
/**
 * Names that collide with other science get a hand-written query:
 * "p21" is also a famous cell-cycle gene and a crystal space group; glutathione and NAD+ are everywhere in lab chemistry,
 * so only supplement / aging / skin work counts.
 */
export const PUBMED_QUERY: Record<string, string> = {
  'p21': '("P021"[tiab] OR "P21 peptide"[tiab] OR "peptide 021"[tiab])',
  'glutathione': 'glutathione[ti] AND (supplement*[tiab] OR oral[ti] OR intravenous[tiab] OR skin[ti] OR liposomal[tiab] OR whitening[tiab])',
  'nad-plus': '("NAD+"[ti] OR "nicotinamide mononucleotide"[ti] OR "nicotinamide riboside"[ti]) AND (supplement*[tiab] OR aging[tiab] OR ageing[tiab] OR older[tiab])',
}
/** Blends have no literature of their own. */
const SKIP = new Set(['wolverine-blend'])

async function getJson(url: string): Promise<any> {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!r.ok) throw new Error(`${r.status} ${url.slice(0, 80)}`)
  return r.json()
}
async function getText(url: string): Promise<string> {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 ' + UA } })
  if (!r.ok) throw new Error(`${r.status} ${url.slice(0, 80)}`)
  return r.text()
}
const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#039;/g, "'").replace(/\s+/g, ' ').trim()

/* ── PubMed (NCBI E-utilities) ── */
export async function pubmed(env: AdapterEnv): Promise<AdapterResult> {
  const source = 'PubMed'
  try {
    const found = new Map<string, string>() // pmid → compound slug that found it
    const key = env.ncbiKey ? `&api_key=${env.ncbiKey}` : ''
    for (const c of COMPOUNDS) {
      if (SKIP.has(c.slug)) continue
      const field = HIGH_VOLUME.has(c.slug) ? 'ti' : 'tiab'
      const term = PUBMED_QUERY[c.slug] ?? termsFor(c).map((t) => `"${t}"[${field}]`).join(' OR ')
      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&sort=pub_date&datetype=edat&reldate=21&retmax=${HIGH_VOLUME.has(c.slug) ? 3 : 8}&term=${encodeURIComponent(term)}${key}`
      const j = await getJson(url).catch(() => null)
      for (const id of j?.esearchresult?.idlist ?? []) if (!found.has(id)) found.set(id, c.slug)
      await sleep(env.ncbiKey ? 120 : 360)
    }
    const ids = [...found.keys()]
    if (!ids.length) return { source, ok: true, items: [], note: 'No new papers in the last 3 weeks' }
    const items: SourceItem[] = []
    for (let i = 0; i < ids.length; i += 150) {
      const batch = ids.slice(i, i + 150)
      const sum = await getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${batch.join(',')}${key}`)
      await sleep(360)
      // first lines of each abstract, so summaries can say what kind of study it was
      const xml = await getText(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${batch.join(',')}${key}`).catch(() => '')
      await sleep(360)
      const abstracts = new Map<string, string>()
      for (const art of xml.split('<PubmedArticle>').slice(1)) {
        const id = art.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1]
        const abs = [...art.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((m) => decode(m[1])).join(' ')
        if (id) abstracts.set(id, abs)
      }
      for (const id of batch) {
        const d = sum?.result?.[id]
        if (!d?.title) continue
        const abs = abstracts.get(id) ?? ''
        items.push({
          key: `pmid:${id}`, kind: 'pubmed', sourceClass: 'primary', outlet: d.fulljournalname || d.source || 'PubMed',
          title: decode(d.title), url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          publishedAt: toIso(entryDate(d), env.now), snippet: abs.slice(0, 420),
          facts: { pmid: id, query: found.get(id)!, pubTypes: d.pubtype ?? [], studyKind: studyKind(`${d.title} ${abs}`, d.pubtype ?? []), pubYear: Number(String(d.pubdate).slice(0, 4)) || 0 },
        })
      }
    }
    return { source, ok: true, items, note: `${items.length} papers from the last 3 weeks` }
  } catch (e) { return { source, ok: false, items: [], note: String(e).slice(0, 140) } }
}

/** What kind of study, from its title, abstract and PubMed publication types. */
export function studyKind(text: string, pubTypes: string[]): string {
  const t = text.toLowerCase(), pt = pubTypes.join(' ').toLowerCase()
  if (/^(retraction|retracted|erratum|correction|corrigendum|\[expression of concern\]|expression of concern)/.test(t) || /retraction of publication|published erratum|expression of concern/.test(pt)) return 'correction'
  if (/meta-analysis|systematic review/.test(pt + t)) return 'review'
  if (/randomized controlled trial|clinical trial/.test(pt) || /randomi[sz]ed|placebo-controlled/.test(t)) return 'human-trial'
  if (/\breview\b/.test(pt)) return 'review'
  if (/case report/.test(pt + t)) return 'case'
  if (/\b(patients|participants|volunteers|adults|women|men|children)\b/.test(t) && !/\b(rats?|mice|mouse|murine|rodent)\b/.test(t)) return 'human'
  if (/\brats?\b/.test(t)) return 'rats'
  if (/\b(mice|mouse|murine)\b/.test(t)) return 'mice'
  if (/\b(dogs?|pigs?|rabbits?|zebrafish|monkeys?|primates?)\b/.test(t)) return 'animals'
  if (/\b(in vitro|cell line|cultured|cells)\b/.test(t)) return 'cells'
  return 'unclear'
}

/** Date-only strings become noon UTC on that day; anything unparseable or in the future becomes "now". */
function toIso(s: string, now: Date): string {
  const ymd = String(s).match(/^(\d{4})[/-](\d{2})[/-](\d{2})/)
  const d = ymd ? new Date(Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3], 12)) : new Date(String(s))
  return Number.isNaN(d.getTime()) || d.getTime() > now.getTime() ? iso(now) : iso(d)
}
/** When the paper actually appeared on PubMed (journal issue dates can sit months in the future). */
function entryDate(d: { history?: Array<{ pubstatus: string; date: string }>; epubdate?: string; sortpubdate?: string; pubdate?: string }): string {
  return d.history?.find((h) => h.pubstatus === 'entrez')?.date ?? d.history?.find((h) => h.pubstatus === 'pubmed')?.date ?? d.epubdate ?? d.sortpubdate ?? d.pubdate ?? ''
}

/* ── ClinicalTrials.gov (API v2) ── */
export async function trials(env: AdapterEnv): Promise<AdapterResult> {
  const source = 'ClinicalTrials.gov'
  try {
    const since = daysAgo(env.now, 45).toISOString().slice(0, 10)
    const items: SourceItem[] = []
    const seen = new Set<string>()
    for (const c of COMPOUNDS) {
      if (SKIP.has(c.slug)) continue
      const q = encodeURIComponent(c.slug === 'p21' ? '"P021"' : termsFor(c).slice(0, 2).map((t) => `"${t}"`).join(' OR '))
      const url = `https://clinicaltrials.gov/api/v2/studies?query.intr=${q}&filter.advanced=${encodeURIComponent(`AREA[LastUpdatePostDate]RANGE[${since},MAX]`)}&sort=LastUpdatePostDate:desc&pageSize=${HIGH_VOLUME.has(c.slug) ? 3 : 6}&fields=NCTId,BriefTitle,OverallStatus,Phase,LastUpdatePostDate,Condition,LeadSponsorName,HasResults`
      const j = await getJson(url).catch(() => null)
      for (const s of j?.studies ?? []) {
        const p = s.protocolSection ?? {}
        const nct = p.identificationModule?.nctId
        if (!nct || seen.has(nct)) continue
        seen.add(nct)
        const phases: string[] = p.designModule?.phases ?? []
        items.push({
          key: `nct:${nct}`, kind: 'trials', sourceClass: 'primary', outlet: p.sponsorCollaboratorsModule?.leadSponsor?.name ?? 'ClinicalTrials.gov',
          title: p.identificationModule?.briefTitle ?? nct, url: `https://clinicaltrials.gov/study/${nct}`,
          publishedAt: toIso(p.statusModule?.lastUpdatePostDateStruct?.date ?? '', env.now),
          snippet: (p.conditionsModule?.conditions ?? []).join(', '),
          facts: { nct, query: c.slug, status: p.statusModule?.overallStatus ?? 'UNKNOWN', phases, hasResults: Boolean(s.hasResults) },
        })
      }
      await sleep(150)
    }
    return { source, ok: true, items, note: `${items.length} trials updated in the last 45 days` }
  } catch (e) { return { source, ok: false, items: [], note: String(e).slice(0, 140) } }
}

/* ── RSS helper (FDA + news) ── */
function parseRss(xml: string): Array<{ title: string; link: string; date: string; desc: string }> {
  return xml.split(/<item[\s>]/).slice(1).map((it) => ({
    title: decode(it.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ''),
    link: decode(it.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? ''),
    date: decode(it.match(/<(?:pubDate|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|dc:date)>/)?.[1] ?? ''),
    desc: decode(it.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? ''),
  })).filter((x) => x.title && x.link)
}

/** Peptide-market words that make an item relevant even when it names no catalog compound. */
export const MARKET_TERMS = /\bpeptides?\b|compounded|compounding|bulk drug substances?|GLP-1|research chemicals?/i

/* ── FDA (press releases + drug news) ── */
const FDA_FEEDS = [
  'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml',
  'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml',
]
export async function fda(env: AdapterEnv, mentions: (t: string) => string[]): Promise<AdapterResult> {
  const source = 'FDA'
  try {
    const items: SourceItem[] = []
    for (const feed of FDA_FEEDS) {
      const xml = await getText(feed).catch(() => '')
      for (const it of parseRss(xml)) {
        const text = `${it.title} ${it.desc}`
        const cs = mentions(text)
        if (!cs.length && !MARKET_TERMS.test(text)) continue
        const url = it.link.replace(/^http:/, 'https:')
        items.push({ key: `url:${url}`, kind: 'fda', sourceClass: 'primary', outlet: 'U.S. FDA', title: it.title, url, publishedAt: toIso(it.date, env.now), snippet: it.desc.slice(0, 420), facts: {} })
      }
    }
    return { source, ok: true, items, note: `${items.length} peptide-related FDA posts in the current feeds` }
  } catch (e) { return { source, ok: false, items: [], note: String(e).slice(0, 140) } }
}

/* ── News RSS (configured feeds only) ── */
export async function news(env: AdapterEnv, mentions: (t: string) => string[]): Promise<AdapterResult> {
  const source = 'News feeds'
  const feeds = env.newsFeeds ?? []
  if (!feeds.length) return { source, ok: false, items: [], note: 'Off: add feed URLs to PULSE_NEWS_FEEDS' }
  try {
    const items: SourceItem[] = []
    for (const feed of feeds) {
      const xml = await getText(feed).catch(() => '')
      const outlet = decode(xml.match(/<channel>[\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? new URL(feed).hostname)
      for (const it of parseRss(xml)) {
        const text = `${it.title} ${it.desc}`
        if (!mentions(text).length && !MARKET_TERMS.test(text)) continue
        items.push({ key: `url:${it.link}`, kind: 'news', sourceClass: 'verified-reporting', outlet, title: it.title, url: it.link, publishedAt: toIso(it.date, env.now), snippet: it.desc.slice(0, 420), facts: {} })
      }
    }
    return { source, ok: true, items, note: `${items.length} relevant stories from ${feeds.length} feeds` }
  } catch (e) { return { source, ok: false, items: [], note: String(e).slice(0, 140) } }
}

/* ── YouTube Data API v3 ── */
/** search.list costs 100 quota units; six compounds per run × six runs a day stays well inside the 10,000/day default. */
const YT_PER_RUN = 6
export async function youtube(env: AdapterEnv): Promise<AdapterResult> {
  const source = 'YouTube'
  if (!env.youtubeKey) return { source, ok: false, items: [], note: 'Off: add YOUTUBE_API_KEY to switch on' }
  try {
    const pool = COMPOUNDS.filter((c) => !SKIP.has(c.slug))
    const start = (env.runCount * YT_PER_RUN) % pool.length
    const batch = Array.from({ length: YT_PER_RUN }, (_, i) => pool[(start + i) % pool.length])
    const after = daysAgo(env.now, 14).toISOString()
    const found: Array<{ id: string; slug: string; sn: any }> = []
    for (const c of batch) {
      const q = encodeURIComponent(`"${c.name}" peptide`)
      const j = await getJson(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=8&relevanceLanguage=en&publishedAfter=${after}&q=${q}&key=${env.youtubeKey}`)
      for (const v of j.items ?? []) if (v.id?.videoId) found.push({ id: v.id.videoId, slug: c.slug, sn: v.snippet })
    }
    const stats = new Map<string, any>()
    for (let i = 0; i < found.length; i += 50) {
      const j = await getJson(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${found.slice(i, i + 50).map((f) => f.id).join(',')}&key=${env.youtubeKey}`).catch(() => null)
      for (const v of j?.items ?? []) stats.set(v.id, v)
    }
    const items: SourceItem[] = found.map(({ id, slug, sn }) => {
      const full = stats.get(id)
      const desc: string = full?.snippet?.description ?? sn.description ?? ''
      return {
        key: `yt:${id}`, kind: 'youtube', sourceClass: 'commentary', outlet: decode(sn.channelTitle ?? 'YouTube'), title: decode(sn.title ?? ''),
        url: `https://www.youtube.com/watch?v=${id}`, publishedAt: sn.publishedAt ?? iso(env.now), snippet: desc.slice(0, 420),
        facts: { query: slug, channelId: sn.channelId ?? '', views: Number(full?.statistics?.viewCount ?? 0), links: (desc.match(/https?:\/\/\S+/g) ?? []).slice(0, 8) },
      }
    })
    return { source, ok: true, items, note: `${items.length} new videos for ${batch.map((c) => c.name).join(', ')}` }
  } catch (e) { return { source, ok: false, items: [], note: String(e).slice(0, 140) } }
}

/* ── Community sources: built as switches, off until access is licensed ── */
export async function reddit(): Promise<AdapterResult> {
  return { source: 'Reddit', ok: false, items: [], note: 'Off: commercial use needs a Reddit data agreement' }
}
export async function tiktok(): Promise<AdapterResult> {
  return { source: 'TikTok', ok: false, items: [], note: 'Off: TikTok’s Research API isn’t open to commercial sites' }
}
