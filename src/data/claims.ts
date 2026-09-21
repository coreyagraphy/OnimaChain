import { STUDY_BY_PMID, type Relationship, type Study } from './studies'
import { BRAND } from '~/brand'

export type ClaimStatus = 'tracked'
export type TranslationStage = 'cell' | 'mouse' | 'rat' | 'larger-animal' | 'human' | 'controlled-human' | 'approved-use'
export const TRANSLATION_STAGES: Array<{ id: TranslationStage; label: string }> = [
  { id: 'cell', label: 'Cell' },
  { id: 'mouse', label: 'Mouse' },
  { id: 'rat', label: 'Rat' },
  { id: 'larger-animal', label: 'Larger animal' },
  { id: 'human', label: 'Human' },
  { id: 'controlled-human', label: 'Controlled human' },
  { id: 'approved-use', label: 'Approved use' },
]

export type MutationClass =
  | 'faithful paraphrase'
  | 'broader extrapolation'
  | 'species omission'
  | 'uncertainty removed'
  | 'mechanism converted into outcome'
  | 'association converted into causation'
  | 'magnitude amplified'
  | 'context removed'
  | 'unsupported addition'
  | 'contradictory interpretation'

export interface MutationStep {
  stage: 'Source finding' | 'Secondary summary' | 'Social interpretation' | 'Viral version'
  wording: string
  /** PMID when this step is an indexed source; null → badge "Illustrative wording — not an indexed source". */
  sourcePmid: string | null
  /** Transformations relative to the previous step. Empty for the source step. */
  classes: MutationClass[]
}

export interface ChangeEvent {
  date: string
  change: string
  before: string | null
  after: string
  lane: 'research' | 'trials' | 'regulatory' | 'signal'
  alteredInterpretation: boolean
}

export interface StudyLink {
  pmid: string
  relationship: Relationship
  /** Verbatim abstract phrase supporting the relationship, or null. */
  basis: string | null
}

export interface Claim {
  id: string
  title: string
  status: ClaimStatus
  compound: string
  outcomeTheme: string
  originStudy: string | null
  originalScope: {
    species: 'rat' | null
    model: string | null
    endpoint: string | null
    wording: string | null
    wordingSource: string | null
  }
  mutation: MutationStep[]
  support: StudyLink[]
  /** Per-outcome translation stages that verified records support. */
  translation: Record<string, TranslationStage[]>
  contradictions: StudyLink[]
  changeHistory: ChangeEvent[]
  /** Constrained synthesis built from the records above; every sentence maps to a record or an empty state. */
  interpretation: string[]
}

export const TODAY = '2026-09-20'

export const ILLUSTRATIVE_BADGE = 'Illustrative wording — not an indexed source'

const bpcOrigin = '21030672'
const tb4Origin = '34170491'

export const CLAIMS: Claim[] = [
  {
    id: 'CLAIM-BPC157-TENDON-REPAIR',
    title: 'BPC-157 supports tendon repair',
    status: 'tracked',
    compound: 'bpc-157',
    outcomeTheme: 'tendon',
    originStudy: STUDY_BY_PMID[bpcOrigin]?.status === 'verified' ? bpcOrigin : null,
    originalScope: {
      species: STUDY_BY_PMID[bpcOrigin]?.status === 'verified' ? 'rat' : null,
      model: 'Tendon explant culture and cultured tendon fibroblasts derived from rat Achilles tendon (ex vivo / in vitro)',
      endpoint: 'Fibroblast outgrowth from explants; cell survival under H2O2 stress; transwell migration; FAK/paxillin phosphorylation',
      wording: STUDY_BY_PMID[bpcOrigin]?.abstractQuote ?? null,
      wordingSource: STUDY_BY_PMID[bpcOrigin]?.status === 'verified' ? `Abstract, PMID ${bpcOrigin}` : null,
    },
    mutation: [
      {
        stage: 'Source finding',
        wording:
          STUDY_BY_PMID[bpcOrigin]?.abstractQuote ??
          'Source relationship unresolved',
        sourcePmid: STUDY_BY_PMID[bpcOrigin]?.status === 'verified' ? bpcOrigin : null,
        classes: [],
      },
      {
        stage: 'Secondary summary',
        wording: 'May support tendon regeneration.',
        sourcePmid: null,
        classes: ['broader extrapolation', 'context removed'],
      },
      {
        stage: 'Social interpretation',
        wording: 'Helps injured tendons heal.',
        sourcePmid: null,
        classes: ['species omission', 'uncertainty removed', 'mechanism converted into outcome'],
      },
      {
        stage: 'Viral version',
        wording: 'Heals tendon injuries fast.',
        sourcePmid: null,
        classes: ['magnitude amplified', 'unsupported addition'],
      },
    ],
    support: [
      { pmid: '21030672', relationship: 'supports', basis: STUDY_BY_PMID['21030672']?.abstractQuote ?? null },
      { pmid: '42542926', relationship: 'partially_supports', basis: STUDY_BY_PMID['42542926']?.abstractQuote ?? null },
      { pmid: '41754849', relationship: 'does_not_test', basis: null },
      { pmid: '40789979', relationship: 'does_not_test', basis: null },
      { pmid: '40756949', relationship: 'does_not_test', basis: null },
    ],
    translation: {
      tendon:
        STUDY_BY_PMID[bpcOrigin]?.status === 'verified' && STUDY_BY_PMID['42542926']?.status === 'verified'
          ? ['cell', 'rat']
          : STUDY_BY_PMID[bpcOrigin]?.status === 'verified'
            ? ['cell']
            : [],
    },
    contradictions: [],
    changeHistory: [
      {
        date: TODAY,
        change: 'Claim record created',
        before: null,
        after: 'tracked',
        lane: 'research',
        alteredInterpretation: true,
      },
    ],
    interpretation: [
      'The earliest attributable support currently indexed is an ex vivo / in vitro study of tendon fibroblasts derived from rat Achilles tendon. It measured outgrowth, survival under oxidative stress and migration — not repair of an injured tendon in a living animal.',
      'One indexed rat study reports histopathological scores for BPC-157 that were numerically lower than control without reaching statistical significance for total scores. That is a partial relationship, not a contradiction.',
      'Three indexed reviews discuss the theme but do not themselves test the claim.',
      `No controlled human study of this outcome is indexed in ${BRAND}’s corpus. Absence from the corpus is not evidence of absence.`,
      'No community signal is available: no platform source access is enabled.',
    ],
  },
  {
    id: 'CLAIM-TB4-CELL-MIGRATION',
    title: 'TB-500 supports cell migration',
    status: 'tracked',
    compound: 'tb-500',
    outcomeTheme: 'cell-migration',
    originStudy: STUDY_BY_PMID[tb4Origin]?.status === 'verified' ? tb4Origin : null,
    originalScope: {
      species: null,
      model: 'SKOV3 human ovarian cancer cell line; transwell migration and invasion assays (in vitro)',
      endpoint: 'Cell migration, invasion, proliferation; RACK-1 expression',
      wording: STUDY_BY_PMID[tb4Origin]?.abstractQuote ?? null,
      wordingSource: STUDY_BY_PMID[tb4Origin]?.status === 'verified' ? `Abstract, PMID ${tb4Origin}` : null,
    },
    mutation: [
      {
        stage: 'Source finding',
        wording: STUDY_BY_PMID[tb4Origin]?.abstractQuote ?? 'Source relationship unresolved',
        sourcePmid: STUDY_BY_PMID[tb4Origin]?.status === 'verified' ? tb4Origin : null,
        classes: [],
      },
      {
        stage: 'Secondary summary',
        wording: 'May promote cell migration and tissue repair.',
        sourcePmid: null,
        classes: ['context removed', 'broader extrapolation'],
      },
      {
        stage: 'Social interpretation',
        wording: 'Helps tissue repair by moving cells to the injury.',
        sourcePmid: null,
        classes: ['mechanism converted into outcome', 'uncertainty removed'],
      },
      {
        stage: 'Viral version',
        wording: 'Speeds up healing anywhere in the body.',
        sourcePmid: null,
        classes: ['magnitude amplified', 'unsupported addition'],
      },
    ],
    support: [
      { pmid: '34170491', relationship: 'supports', basis: STUDY_BY_PMID['34170491']?.abstractQuote ?? null },
      { pmid: '42542926', relationship: 'does_not_test', basis: null },
      { pmid: '32245208', relationship: 'does_not_test', basis: null },
      { pmid: '36706591', relationship: 'does_not_test', basis: null },
      { pmid: '41235866', relationship: 'does_not_test', basis: null },
    ],
    translation: {
      'cell-migration': STUDY_BY_PMID[tb4Origin]?.status === 'verified' ? ['cell'] : [],
    },
    contradictions: [],
    changeHistory: [
      {
        date: TODAY,
        change: 'Claim record created',
        before: null,
        after: 'tracked',
        lane: 'research',
        alteredInterpretation: true,
      },
    ],
    interpretation: [
      'The earliest attributable support currently indexed measured migration and invasion of a human ovarian cancer cell line treated with thymosin β4 and fragment peptides. It is an in vitro cell-line result.',
      'The cell line context is removed at the first mutation step; every later wording adds outcomes the origin record did not measure.',
      'No indexed record tests this claim in an animal wound or in humans. Absence from the corpus is not evidence of absence.',
      'No community signal is available: no platform source access is enabled.',
    ],
  },
]

export const CLAIM_BY_ID: Record<string, Claim> = Object.fromEntries(CLAIMS.map((c) => [c.id, c]))

export function claimsForCompound(slug: string): Claim[] {
  return CLAIMS.filter((c) => c.compound === slug)
}

export function claimStudies(c: Claim): Array<StudyLink & { study: Study | undefined }> {
  return c.support.map((l) => ({ ...l, study: STUDY_BY_PMID[l.pmid] }))
}

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  supports: 'SUPPORTS',
  partially_supports: 'PARTIALLY_SUPPORTS',
  contradicts: 'CONTRADICTS',
  does_not_test: 'DOES_NOT_TEST',
}
