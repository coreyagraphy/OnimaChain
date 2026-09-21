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
  { id: 'in-vitro', label: 'Cells in a dish (in vitro)', how: 'Checked studies done on cells in a lab dish.' },
  { id: 'mouse', label: 'Mice', how: 'Checked studies whose title says it was done in mice.' },
  { id: 'rat', label: 'Rats', how: 'Checked studies whose title says it was done in rats.' },
  { id: 'other-animal', label: 'Other animals', how: 'Checked studies whose title names another animal.' },
  { id: 'observational-human', label: 'People, observed', how: 'Checked studies that watched people without a controlled trial.' },
  { id: 'case-report', label: 'Single-person reports', how: 'Checked reports about one patient (case reports).' },
  { id: 'phase-1', label: 'Phase I trial', how: 'Checked early safety trials in a small group of people.' },
  { id: 'phase-2', label: 'Phase II trial', how: 'Checked mid-size trials testing whether it works.' },
  { id: 'phase-3', label: 'Phase III trial', how: 'Checked large trials, the kind regulators look at.' },
  { id: 'approved-indication', label: 'Approved use', how: 'Not checked yet — we have not connected regulator records.' },
  { id: 'replication', label: 'Repeated by others', how: 'Not checked yet — we do not track repeat studies yet.' },
  { id: 'independent-groups', label: 'Separate research teams', how: 'How many different senior authors the checked studies have. A rough stand-in for separate teams.' },
  { id: 'mechanistic', label: 'How it works', how: 'Checked studies that looked at the mechanism, based on their summary.' },
  { id: 'safety', label: 'Safety', how: 'Not checked yet — no safety study has been added.' },
  { id: 'research-age', label: 'Years of research', how: 'From the oldest to the newest checked study.' },
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
    { id: 'vascular', label: 'Blood-vessel signaling', kind: 'research' },
    { id: 'recovery-discussion', label: 'Recovery talk online', kind: 'discussion' },
  ],
  'tb-500': [
    { id: 'cell-migration', label: 'Cell migration', tag: 'cell-migration', kind: 'research' },
    { id: 'actin', label: 'How cells move (actin)', tag: 'actin', kind: 'research' },
    { id: 'wound-healing', label: 'Wound-healing research', tag: 'wound-healing', kind: 'research' },
    { id: 'tissue-repair-discussion', label: 'Tissue-repair talk online', kind: 'discussion' },
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
    { label: 'Studies checked', value: v.length, of: STUDIES.length, at: verifiedAt, note: 'Every PubMed ID confirmed against PubMed before the site was built' },
    { label: 'Trials changed', value: 0, of: null, at: null, note: 'ClinicalTrials.gov not connected yet' },
    { label: 'Regulatory records changed', value: 0, of: null, at: null, note: 'Regulator records not connected yet' },
    { label: 'Claims we updated', value: CLAIMS.reduce((n, c) => n + c.changeHistory.filter((e) => e.alteredInterpretation).length, 0), of: null, at: TODAY, note: 'From our change log' },
    { label: 'New real-world report groups', value: 0, of: null, at: null, note: 'Social platforms not connected yet' },
    { label: 'Peptides in the collection', value: COMPOUNDS.length, of: null, at: TODAY, note: `${COMPOUNDS.filter((c) => c.sequence).length} with a listed sequence` },
  ]
}
