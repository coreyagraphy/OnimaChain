import verifiedJson from './verified.json'

/*
 * Study records. Every record here is a CANDIDATE until tools/verify-pmids.ts resolves the PMID
 * against NCBI eutils at build time and confirms the title contains `expectKeyword`.
 * The resolved metadata (title, year, journal, authors) comes from eutils, never from this file.
 * If eutils was unreachable at build time, every record is `status: 'unverified'` and the UI renders
 * "Source relationship unresolved" instead of a citation.
 */

export type Species = 'rat' | 'mouse' | 'human' | 'other-animal' | null
export type StudyType = 'in-vitro' | 'animal' | 'review' | 'systematic-review' | 'observational-human' | 'controlled-human' | null
export type Relationship = 'supports' | 'partially_supports' | 'contradicts' | 'does_not_test'

export interface StudyCandidate {
  pmid: string
  /** Case-insensitive substring the resolved title must contain, or the build fails. */
  expectKeyword: string
  compounds: string[]
  /** Only set when the species is stated in the title. */
  speciesFromTitle: Species
  /** Only set when obvious from title / publication type. */
  studyType: StudyType
  /** Editorial tags assigned from the abstract text; source of each tag is the abstract of this PMID. */
  tags: Array<'mechanistic' | 'tendon' | 'cell-migration' | 'wound-healing' | 'actin'>
  /** Verbatim phrase copied from the PubMed abstract of this PMID (not paraphrased). */
  abstractQuote?: string
}

export interface VerifiedMeta {
  pmid: string
  title: string
  year: number | null
  journal: string
  authors: string[]
  lastAuthor: string
  pubTypes: string[]
  doi: string | null
  verifiedAt: string
}

export interface VerifiedFile {
  reachable: boolean
  checkedAt: string
  records: Record<string, VerifiedMeta>
}

export type StudyStatus = 'verified' | 'unverified'

export interface Study extends StudyCandidate {
  status: StudyStatus
  meta: VerifiedMeta | null
  /** Convenience: the title when verified, otherwise null. Never synthesised. */
  title: string | null
  year: number | null
  journal: string | null
  verifiedAt: string | null
}

export const STUDY_CANDIDATES: StudyCandidate[] = [
  {
    pmid: '21030672',
    expectKeyword: 'tendon',
    compounds: ['bpc-157'],
    speciesFromTitle: null,
    studyType: 'in-vitro',
    tags: ['mechanistic', 'tendon', 'cell-migration', 'actin'],
    abstractQuote:
      'BPC 157 promotes the ex vivo outgrowth of tendon fibroblasts from tendon explants, cell survival under stress, and the in vitro migration of tendon fibroblasts, which is likely mediated by the activation of the FAK-paxillin pathway.',
  },
  {
    pmid: '42542926',
    expectKeyword: 'tendon',
    compounds: ['bpc-157'],
    speciesFromTitle: 'rat',
    studyType: 'animal',
    tags: ['tendon', 'wound-healing'],
    abstractQuote:
      'The BPC-157 group showed numerically lower scores without reaching statistical significance for total scores.',
  },
  {
    pmid: '41754849',
    expectKeyword: 'BPC 157',
    compounds: ['bpc-157'],
    speciesFromTitle: null,
    studyType: 'review',
    tags: ['tendon'],
  },
  {
    pmid: '40789979',
    expectKeyword: 'BPC-157',
    compounds: ['bpc-157'],
    speciesFromTitle: null,
    studyType: 'review',
    tags: [],
  },
  {
    pmid: '40756949',
    expectKeyword: 'BPC-157',
    compounds: ['bpc-157'],
    speciesFromTitle: null,
    studyType: 'systematic-review',
    tags: [],
  },
  {
    pmid: '34170491',
    expectKeyword: 'thymosin',
    compounds: ['thymosin-beta-4'],
    speciesFromTitle: null,
    studyType: 'in-vitro',
    tags: ['mechanistic', 'cell-migration', 'actin'],
    abstractQuote:
      'The Tβ4 peptide and all of its derived fragment peptides including those without an actin binding motif stimulate migration and invasion of SKOV3 ovarian cancer cells.',
  },
  {
    pmid: '32245208',
    expectKeyword: 'thymosin',
    compounds: [], // exact molecule/form association pending review
    speciesFromTitle: 'mouse',
    studyType: 'animal',
    tags: [],
  },
  {
    pmid: '36706591',
    expectKeyword: 'thymosin',
    compounds: [], // exact molecule/form association pending review
    speciesFromTitle: null,
    studyType: 'in-vitro',
    tags: [],
  },
  {
    pmid: '41235866',
    expectKeyword: 'thymosin',
    compounds: [], // exact molecule/form association pending review
    speciesFromTitle: null,
    studyType: null,
    tags: ['wound-healing'],
  },
]

const VERIFIED = verifiedJson as VerifiedFile

export const CORPUS_REACHABLE = VERIFIED.reachable
export const CORPUS_CHECKED_AT = VERIFIED.checkedAt

export const STUDIES: Study[] = STUDY_CANDIDATES.map((c) => {
  const meta = VERIFIED.reachable ? (VERIFIED.records[c.pmid] ?? null) : null
  return {
    ...c,
    status: meta ? 'verified' : 'unverified',
    meta,
    title: meta?.title ?? null,
    year: meta?.year ?? null,
    journal: meta?.journal ?? null,
    verifiedAt: meta?.verifiedAt ?? null,
  }
})

export const STUDY_BY_PMID: Record<string, Study> = Object.fromEntries(STUDIES.map((s) => [s.pmid, s]))

export function verifiedStudies(): Study[] {
  return STUDIES.filter((s) => s.status === 'verified')
}

export function studiesForCompound(slug: string, onlyVerified = true): Study[] {
  return STUDIES.filter((s) => s.compounds.includes(slug) && (!onlyVerified || s.status === 'verified'))
}

export function pubmedUrl(pmid: string) {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
}
