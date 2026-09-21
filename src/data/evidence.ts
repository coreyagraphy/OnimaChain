import { COMPOUNDS } from './compounds'
import { CLAIMS, TODAY, type TranslationStage } from './claims'
import { STUDIES, distinctGroups, studiesForCompound, verifiedStudies, type Study } from './studies'

/* ---------- Evidence Genome ---------- */

export type GenomeDimension =
  | 'in-vitro'
  | 'mouse'
  | 'rat'
  | 'other-animal'
  | 'observational-human'
  | 'case-report'
  | 'phase-1'
  | 'phase-2'
  | 'phase-3'
  | 'approved-indication'
  | 'replication'
  | 'independent-groups'
  | 'mechanistic'
  | 'safety'
  | 'research-age'

export interface GenomeCell {
  id: GenomeDimension
  label: string
  /** Count of verified records that qualify, or null when the dimension is not assessed. */
  count: number | null
  /** Human-readable value (e.g. "2011–2026") when count is not the right shape. */
  value: string | null
  /** PMIDs backing this cell. */
  pmids: string[]
  how: string
}

export const GENOME_DIMENSIONS: Array<{ id: GenomeDimension; label: string; how: string }> = [
  { id: 'in-vitro', label: 'In vitro', how: 'Verified records whose study type is in-vitro.' },
  { id: 'mouse', label: 'Mouse', how: 'Verified records whose title states a mouse model.' },
  { id: 'rat', label: 'Rat', how: 'Verified records whose title states a rat model.' },
  { id: 'other-animal', label: 'Other animal', how: 'Verified records whose title states another animal model.' },
  { id: 'observational-human', label: 'Observational human', how: 'Verified records typed observational-human.' },
  { id: 'case-report', label: 'Case report', how: 'Verified records whose publication type is Case Reports.' },
  { id: 'phase-1', label: 'Phase I', how: 'Verified records whose publication type is Clinical Trial, Phase I.' },
  { id: 'phase-2', label: 'Phase II', how: 'Verified records whose publication type is Clinical Trial, Phase II.' },
  { id: 'phase-3', label: 'Phase III', how: 'Verified records whose publication type is Clinical Trial, Phase III.' },
  { id: 'approved-indication', label: 'Approved indication', how: 'Not assessed — no regulatory record indexed.' },
  { id: 'replication', label: 'Replication', how: 'Not assessed — replication relationships are not yet indexed.' },
  { id: 'independent-groups', label: 'Independent groups', how: 'Distinct last-author surnames among verified records (proxy).' },
  { id: 'mechanistic', label: 'Mechanistic', how: 'Verified records tagged mechanistic from their abstract.' },
  { id: 'safety', label: 'Safety characterization', how: 'Not assessed — no safety-typed record indexed.' },
  { id: 'research-age', label: 'Research age', how: 'Earliest to latest publication year among verified records.' },
]

export function evidenceGenome(slug: string): GenomeCell[] {
  const studies = studiesForCompound(slug)
  const pick = (f: (s: Study) => boolean) => studies.filter(f)
  const cell = (id: GenomeDimension, list: Study[], value: string | null = null, notAssessed = false): GenomeCell => {
    const d = GENOME_DIMENSIONS.find((x) => x.id === id)!
    return { id, label: d.label, count: notAssessed ? null : list.length, value, pmids: list.map((s) => s.pmid), how: d.how }
  }
  const years = studies.map((s) => s.year).filter((y): y is number => y !== null)
  const groups = distinctGroups(studies)
  const pt = (t: string) => pick((s) => (s.meta?.pubTypes ?? []).some((p) => p.toLowerCase().includes(t)))
  return [
    cell('in-vitro', pick((s) => s.studyType === 'in-vitro')),
    cell('mouse', pick((s) => s.speciesFromTitle === 'mouse')),
    cell('rat', pick((s) => s.speciesFromTitle === 'rat')),
    cell('other-animal', pick((s) => s.speciesFromTitle === 'other-animal')),
    cell('observational-human', pick((s) => s.studyType === 'observational-human')),
    cell('case-report', pt('case report')),
    cell('phase-1', pt('phase i')),
    cell('phase-2', pt('phase ii')),
    cell('phase-3', pt('phase iii')),
    cell('approved-indication', [], null, true),
    cell('replication', [], null, true),
    { ...cell('independent-groups', studies), count: groups.length, value: groups.length ? groups.join(' · ') : null },
    cell('mechanistic', pick((s) => s.tags.includes('mechanistic'))),
    cell('safety', [], null, true),
    { ...cell('research-age', studies), count: years.length ? Math.max(...years) - Math.min(...years) : null, value: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : null },
  ]
}

/* ---------- Research themes (fixture per brief §46; derived from indexed records where possible) ---------- */

export interface Theme {
  id: string
  label: string
  /** PMIDs among verified records that carry this theme. */
  pmids: string[]
  kind: 'research' | 'discussion'
}

const THEME_FIXTURES: Record<string, Array<{ id: string; label: string; tag?: Study['tags'][number]; kind: Theme['kind'] }>> = {
  'bpc-157': [
    { id: 'tendon', label: 'Tendon research', tag: 'tendon', kind: 'research' },
    { id: 'ligament', label: 'Ligament research', kind: 'research' },
    { id: 'gi', label: 'Gastrointestinal research', kind: 'research' },
    { id: 'vascular', label: 'Vascular signaling', kind: 'research' },
    { id: 'recovery-discussion', label: 'Public recovery discussion', kind: 'discussion' },
  ],
  'tb-500': [
    { id: 'cell-migration', label: 'Cell migration', tag: 'cell-migration', kind: 'research' },
    { id: 'actin', label: 'Actin-related mechanisms', tag: 'actin', kind: 'research' },
    { id: 'wound-healing', label: 'Wound-healing research', tag: 'wound-healing', kind: 'research' },
    { id: 'tissue-repair-discussion', label: 'Tissue-repair discussion', kind: 'discussion' },
  ],
}

export function themesFor(slug: string): Theme[] {
  const fx = THEME_FIXTURES[slug]
  if (!fx) return []
  const studies = studiesForCompound(slug)
  return fx.map((t) => ({
    id: t.id,
    label: t.label,
    kind: t.kind,
    pmids: t.tag ? studies.filter((s) => s.tags.includes(t.tag!)).map((s) => s.pmid) : [],
  }))
}

/* ---------- Translation ---------- */

export function translationFor(slug: string): Array<{ outcome: string; stages: TranslationStage[] }> {
  return CLAIMS.filter((c) => c.compound === slug).flatMap((c) =>
    Object.entries(c.translation).map(([outcome, stages]) => ({ outcome, stages })),
  )
}

/* ---------- Evidence distribution (cards) ---------- */

export interface Distribution {
  total: number
  inVitro: number
  animal: number
  human: number
  review: number
}

export function distributionFor(slug: string): Distribution {
  const s = studiesForCompound(slug)
  return {
    total: s.length,
    inVitro: s.filter((x) => x.studyType === 'in-vitro').length,
    animal: s.filter((x) => x.studyType === 'animal').length,
    human: s.filter((x) => x.studyType === 'observational-human' || x.studyType === 'controlled-human').length,
    review: s.filter((x) => x.studyType === 'review' || x.studyType === 'systematic-review').length,
  }
}

export function latestChangeFor(slug: string): { date: string; change: string } | null {
  const events = CLAIMS.filter((c) => c.compound === slug).flatMap((c) => c.changeHistory.map((e) => ({ ...e, claim: c.id })))
  if (!events.length) return null
  const last = events.sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  return { date: last.date, change: `${last.change} — ${last.claim}` }
}

/* ---------- Research pulse (honest counters computed from the data files) ---------- */

export function researchPulse() {
  const v = verifiedStudies()
  const verifiedAt = v.map((s) => s.verifiedAt).filter(Boolean).sort().at(-1) ?? null
  return [
    { label: 'Studies indexed & verified', value: v.length, of: STUDIES.length, at: verifiedAt, note: 'PMIDs resolved against NCBI eutils at build time' },
    { label: 'Trials changed', value: 0, of: null, at: null, note: 'ClinicalTrials.gov connector not enabled' },
    { label: 'Regulatory records changed', value: 0, of: null, at: null, note: 'No regulatory connector enabled' },
    { label: 'Claims materially changed', value: CLAIMS.reduce((n, c) => n + c.changeHistory.filter((e) => e.alteredInterpretation).length, 0), of: null, at: TODAY, note: 'From claims.ts change history' },
    { label: 'New source clusters', value: 0, of: null, at: null, note: 'No platform source access enabled' },
    { label: 'Compounds in atlas', value: COMPOUNDS.length, of: null, at: TODAY, note: `${COMPOUNDS.filter((c) => c.sequence).length} with a listed sequence` },
  ]
}
