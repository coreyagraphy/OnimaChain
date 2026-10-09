import { STUDY_BY_PMID, type Relationship, type Study } from './studies'
import { BRAND } from '~/brand'

export type ClaimStatus = 'tracked'
export type TranslationStage = 'cell' | 'mouse' | 'rat' | 'larger-animal' | 'human' | 'controlled-human' | 'approved-use'
export const TRANSLATION_STAGES: Array<{ id: TranslationStage; label: string }> = [
  { id: 'cell', label: 'Cells in a dish' },
  { id: 'mouse', label: 'Mouse' },
  { id: 'rat', label: 'Rat' },
  { id: 'larger-animal', label: 'Bigger animal' },
  { id: 'human', label: 'People' },
  { id: 'controlled-human', label: 'Proper human trial' },
  { id: 'approved-use', label: 'Approved by regulators' },
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
  stage: 'What the study said' | 'The summary' | 'The social post' | 'The viral version'
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

export const ILLUSTRATIVE_BADGE = 'Example wording — not from a real source'

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
        stage: 'What the study said',
        wording:
          STUDY_BY_PMID[bpcOrigin]?.abstractQuote ??
          'Source relationship unresolved',
        sourcePmid: STUDY_BY_PMID[bpcOrigin]?.status === 'verified' ? bpcOrigin : null,
        classes: [],
      },
      {
        stage: 'The summary',
        wording: 'May support tendon regeneration.',
        sourcePmid: null,
        classes: ['broader extrapolation', 'context removed'],
      },
      {
        stage: 'The social post',
        wording: 'Helps injured tendons heal.',
        sourcePmid: null,
        classes: ['species omission', 'uncertainty removed', 'mechanism converted into outcome'],
      },
      {
        stage: 'The viral version',
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
      'The earliest study we have checked used tendon cells taken from rat Achilles tendon and grown in a dish. It measured how the cells grew, survived stress and moved. It did not test repair of an injured tendon in a living animal.',
      'One rat study we checked found tissue scores for BPC-157 that were a little lower than the control group, but not by enough to count as a real difference. That partly backs the claim. It does not disprove it.',
      'Three review papers talk about this topic but did not run their own test of the claim.',
      'We have not found a proper human trial of this result. That means we have not found one, not that one does not exist.',
      'We are not collecting real-world reports yet, so there is nothing from people online to show here.',
    ],
  },
  {
    id: 'CLAIM-TB4-CELL-MIGRATION',
    title: 'Thymosin β4 and fragments were studied in ovarian cancer cells',
    status: 'tracked',
    compound: 'thymosin-beta-4',
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
        stage: 'What the study said',
        wording: STUDY_BY_PMID[tb4Origin]?.abstractQuote ?? 'Source relationship unresolved',
        sourcePmid: STUDY_BY_PMID[tb4Origin]?.status === 'verified' ? tb4Origin : null,
        classes: [],
      },
      {
        stage: 'The summary',
        wording: 'May promote cell migration and tissue repair.',
        sourcePmid: null,
        classes: ['context removed', 'broader extrapolation'],
      },
      {
        stage: 'The social post',
        wording: 'Helps tissue repair by moving cells to the injury.',
        sourcePmid: null,
        classes: ['mechanism converted into outcome', 'uncertainty removed'],
      },
      {
        stage: 'The viral version',
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
      'The earliest study we have checked measured how human ovarian cancer cells moved in a dish after being treated with thymosin β4 and pieces of it. It is a lab-dish result, not a result in a person.',
      'The first retelling drops the fact that this was cells in a dish. Every version after that adds results the original study never measured.',
      'None of the studies we have checked test this on a real wound in an animal or in people. That means we have not found one, not that one does not exist.',
      'We are not collecting real-world reports yet, so there is nothing from people online to show here.',
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
  supports: 'Backs it up',
  partially_supports: 'Partly backs it up',
  contradicts: 'Pushes back',
  does_not_test: 'Talks about it, didn’t test it',
}
