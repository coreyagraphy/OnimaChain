import { COMPOUNDS, COMPOUND_BY_SLUG, displayName, type Compound } from './compounds'

export type EntityType = 'COMPOUND' | 'COMMUNITY_STACK' | 'CLINICAL_COMBINATION'
export type CommerceStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'NOT_SOLD'
export type ResearchStatus = 'CORE_LIBRARY' | 'WATCHLIST' | 'CLINICAL_DEVELOPMENT' | 'APPROVED_SOME_JURISDICTIONS' | 'HISTORICAL'
export type StructureProvenance = 'experimental' | 'database' | 'sequence-derived' | 'conceptual'
export type TargetId = 'GLP1R' | 'GIPR' | 'GCGR' | 'AMYR' | 'GHSR' | 'GHRHR' | 'IGF1R' | 'MC4R'

export interface ResearchCompound {
  id: string
  type: 'COMPOUND'
  name: string
  aliases: string[]
  summary: string
  targets: TargetId[]
  researchStatus: ResearchStatus
  commerceStatus: CommerceStatus
  structureProvenance: StructureProvenance
  developer?: string
  stage?: string
  statusAsOf?: string
  statusSource?: string
  jurisdiction?: string
  accent: string
}

export interface Combination {
  id: string
  type: 'COMMUNITY_STACK' | 'CLINICAL_COMBINATION'
  name: string
  aliases: string[]
  summary: string
  componentIds: string[]
  source?: string
  commerceStatus: 'NOT_SOLD'
}

export type ResearchEntity = ResearchCompound | Combination

export interface ProductListing {
  id: string
  compoundId: string
  sku: string
  nominalMass: number | null
  commerceStatus: CommerceStatus
  placeholderPrice: string | null
  inventoryLotIds: string[]
}

export interface InventoryLot {
  id: string
  compoundId: string
  productListingId: string
  lotNumber: string
  quantityAvailable: number
  verifiedAt: string
  verificationSource: string
}

export interface LotCOA {
  id: string
  compoundId: string
  productListingId: string
  lotNumber: string
  labName: string
  reportNumber?: string
  testDate: string
  receivedDate: string
  methods: string[]
  identityResult?: string
  purityResult?: string
  massResult?: string
  endotoxinResult?: string
  sterilityResult?: string
  otherResults: { name: string; result: string }[]
  originalPdf: string
  sha256: string
  status: 'CURRENT' | 'ARCHIVED'
  inventoryLotId: string
}

export interface RegulatoryRecord {
  compoundId: string
  jurisdiction: string
  authority: string
  status: string
  statusAsOf: string
  source: string
  lastChecked: string
}

export const TARGETS: { id: TargetId; label: string; explanation: string }[] = [
  { id: 'GLP1R', label: 'GLP-1R', explanation: 'Glucagon-like peptide-1 receptor; a metabolic signaling target.' },
  { id: 'GIPR', label: 'GIPR', explanation: 'Glucose-dependent insulinotropic polypeptide receptor.' },
  { id: 'GCGR', label: 'GCGR', explanation: 'Glucagon receptor; distinct from the GLP-1 receptor.' },
  { id: 'AMYR', label: 'Amylin receptor family', explanation: 'A receptor family engaged by amylin analogues.' },
  { id: 'GHSR', label: 'Ghrelin receptor', explanation: 'Growth-hormone secretagogue receptor.' },
  { id: 'GHRHR', label: 'GHRH receptor', explanation: 'Growth-hormone-releasing hormone receptor.' },
  { id: 'IGF1R', label: 'IGF-1 receptor', explanation: 'Insulin-like growth factor 1 receptor.' },
  { id: 'MC4R', label: 'Melanocortin receptors', explanation: 'Melanocortin signaling family; specific subtype varies by compound.' },
]

// Only explicitly mapped target relationships appear in the receptor map. An empty
// profile means "not mapped here", not that a compound has no biological targets.
const CORE_TARGETS: Record<string, TargetId[]> = {
  semaglutide: ['GLP1R'], tirzepatide: ['GIPR', 'GLP1R'], retatrutide: ['GIPR', 'GLP1R', 'GCGR'],
  ipamorelin: ['GHSR'], 'ghrp-2': ['GHSR'], 'ghrp-6': ['GHSR'], hexarelin: ['GHSR'],
  sermorelin: ['GHRHR'], tesamorelin: ['GHRHR'], 'cjc-1295': ['GHRHR'], 'igf-1-lr3': ['IGF1R'],
  'pt-141': ['MC4R'], 'melanotan-ii': ['MC4R'],
}

const CORE = COMPOUNDS.filter((c) => c.slug !== 'wolverine-blend').map((c): ResearchCompound => ({
  id: c.slug, type: 'COMPOUND', name: displayName(c), aliases: c.aliases,
  summary: c.note ?? c.archetype, targets: CORE_TARGETS[c.slug] ?? [],
  researchStatus: 'CORE_LIBRARY', commerceStatus: 'NOT_SOLD',
  structureProvenance: c.structureSource === 'pdb' ? 'database' : c.sequence ? 'sequence-derived' : 'conceptual',
  accent: '#5FE3FF',
}))

// These are informational research records. No unpublished sequence or coordinates
// are guessed; the visual treatment is conceptual until structure data is verified.
export const WATCHLIST: ResearchCompound[] = [
  { id: 'zenagamtide', type: 'COMPOUND', name: 'Zenagamtide', aliases: ['Amycretin'], summary: 'One investigational molecule designed to engage GLP-1 and amylin receptor systems.', targets: ['GLP1R', 'AMYR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Novo Nordisk', stage: 'Phase 3 programme', statusAsOf: '2026-08-06', statusSource: 'https://www.novonordisk.com/content/dam/nncorp/global/en/investors/pdfs/financial-results/2026/Q2-2026-Full%20presentation.pdf', jurisdiction: 'Multinational development', accent: '#8DE7F3' },
  { id: 'petrelintide', type: 'COMPOUND', name: 'Petrelintide', aliases: ['ZP8396'], summary: 'An investigational long-acting amylin analogue.', targets: ['AMYR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Zealand Pharma / Roche', stage: 'Phase 2 results reported', statusAsOf: '2026-03-05', statusSource: 'https://www.roche.com/media/releases/med-cor-2026-03-05', jurisdiction: 'Multinational development', accent: '#E4A8FF' },
  { id: 'enicepatide', type: 'COMPOUND', name: 'Enicepatide', aliases: ['CT-388', 'RO7795068'], summary: 'An investigational molecule acting at both the GLP-1 and GIP receptors.', targets: ['GLP1R', 'GIPR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Roche', stage: 'Phase 2 results reported', statusAsOf: '2026-09-22', statusSource: 'https://www.roche.com/media/releases/med-cor-2026-09-22', jurisdiction: 'Multinational development', accent: '#78B5FF' },
  { id: 'vk2735', type: 'COMPOUND', name: 'VK2735', aliases: [], summary: 'An investigational dual GLP-1/GIP receptor agonist.', targets: ['GLP1R', 'GIPR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Viking Therapeutics', stage: 'Phase 3 studies ongoing', statusAsOf: '2026-09-22', statusSource: 'https://ir.vikingtherapeutics.com/2026-09-22-Viking-Therapeutics-Announces-Positive-Topline-Results-from-Maintenance-Study-of-GLP-1-GIP-Agonist-VK2735-Demonstrating-the-Promise-of-Multiple-Maintenance-Dosing-Regimens', jurisdiction: 'Multinational development', accent: '#77D9C1' },
  { id: 'cagrilintide', type: 'COMPOUND', name: 'Cagrilintide', aliases: [], summary: 'A long-acting amylin analogue studied alone and with semaglutide.', targets: ['AMYR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Novo Nordisk', stage: 'Phase 3 programme', statusAsOf: '2026-02-04', statusSource: 'https://annualreport.novonordisk.com/2025/strategic-aspirations/innovation-and-therapeutic-focus.html', jurisdiction: 'Multinational development', accent: '#F6B88F' },
  { id: 'mazdutide', type: 'COMPOUND', name: 'Mazdutide', aliases: ['IBI362'], summary: 'A dual GLP-1 and glucagon receptor agonist; regulatory status varies by jurisdiction.', targets: ['GLP1R', 'GCGR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Innovent Biologics', stage: 'Clinical studies ongoing', statusAsOf: '2026-09-22', statusSource: 'https://clinicaltrials.gov/study/NCT07654062', jurisdiction: 'United States trial record; approval not assessed here', accent: '#E7C879' },
  { id: 'berobenatide', type: 'COMPOUND', name: 'Berobenatide', aliases: ['PF’3944', 'MET-097i'], summary: 'An investigational long-acting GLP-1 receptor agonist peptide.', targets: ['GLP1R'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Pfizer', stage: 'Phase 2b results; Phase 3 study open', statusAsOf: '2026-06-06', statusSource: 'https://www.pfizer.com/news/press-release/press-release-detail/robust-phase-2b-efficacy-and-favorable-tolerability-support', jurisdiction: 'Multinational development', accent: '#B2DA91' },
  { id: 'pemvidutide', type: 'COMPOUND', name: 'Pemvidutide', aliases: ['ALT-801'], summary: 'An investigational peptide acting at GLP-1 and glucagon receptors.', targets: ['GLP1R', 'GCGR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Altimmune', stage: 'Phase 2b results; Phase 3 planned', statusAsOf: '2026-06-01', statusSource: 'https://ir.altimmune.com/news-releases/news-release-details/pemvidutide-demonstrates-significant-metabolic-improvements', jurisdiction: 'Multinational development', accent: '#FFADAA' },
  { id: 'survodutide', type: 'COMPOUND', name: 'Survodutide', aliases: ['BI 456906'], summary: 'An investigational dual glucagon and GLP-1 receptor agonist.', targets: ['GLP1R', 'GCGR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Boehringer Ingelheim / Zealand Pharma', stage: 'Phase 3 study registered', statusAsOf: '2026-09-22', statusSource: 'https://clinicaltrials.gov/study/NCT06077864', jurisdiction: 'Multinational development', accent: '#A5BDFF' },
  { id: 'eloralintide', type: 'COMPOUND', name: 'Eloralintide', aliases: ['LY3841136'], summary: 'An investigational selective amylin receptor agonist.', targets: ['AMYR'], researchStatus: 'WATCHLIST', commerceStatus: 'NOT_SOLD', structureProvenance: 'conceptual', developer: 'Eli Lilly', stage: 'Phase 3 trials ongoing', statusAsOf: '2026-09-15', statusSource: 'https://investor.lilly.com/news-releases/news-release-details/lilly-present-new-data-foundayo-retatrutide-and-eloratzp-easd', jurisdiction: 'Multinational development', accent: '#F0A6D6' },
]

export const RESEARCH_COMPOUNDS = [...CORE, ...WATCHLIST]
export const RESEARCH_BY_ID: Record<string, ResearchCompound> = Object.fromEntries(RESEARCH_COMPOUNDS.map((c) => [c.id, c]))

export const COMBINATIONS: Combination[] = [
  { id: 'wolverine-blend', type: 'COMMUNITY_STACK', name: 'Wolverine', aliases: ['Wolverine Blend'], summary: 'A community name for BPC-157 and TB-500 together; not one molecule.', componentIds: ['bpc-157', 'tb-500'], commerceStatus: 'NOT_SOLD' },
  { id: 'glow', type: 'COMMUNITY_STACK', name: 'GLOW', aliases: [], summary: 'A community stack name, not a distinct molecule or a clinically validated formulation.', componentIds: ['ghk-cu', 'bpc-157', 'tb-500'], commerceStatus: 'NOT_SOLD' },
  { id: 'klow', type: 'COMMUNITY_STACK', name: 'KLOW / CLOW', aliases: ['CLOW'], summary: 'A community variation on GLOW adding KPV.', componentIds: ['ghk-cu', 'bpc-157', 'tb-500', 'kpv'], commerceStatus: 'NOT_SOLD' },
  { id: 'cagrisema', type: 'CLINICAL_COMBINATION', name: 'CagriSema', aliases: [], summary: 'A studied fixed-dose combination of two distinct molecules.', componentIds: ['cagrilintide', 'semaglutide'], source: 'https://www.novonordisk.com/news-and-media/news-and-ir-materials/news-details.html?id=916555', commerceStatus: 'NOT_SOLD' },
  { id: 'petrelintide-enicepatide', type: 'CLINICAL_COMBINATION', name: 'Petrelintide + Enicepatide', aliases: [], summary: 'A registered study pairing two investigational molecules.', componentIds: ['petrelintide', 'enicepatide'], source: 'https://clinicaltrials.gov/study/NCT07589686', commerceStatus: 'NOT_SOLD' },
  { id: 'eloratzp', type: 'CLINICAL_COMBINATION', name: 'EloraTZP', aliases: [], summary: 'A studied combination of eloralintide and tirzepatide, not a new single peptide.', componentIds: ['eloralintide', 'tirzepatide'], source: 'https://investor.lilly.com/news-releases/news-release-details/lilly-present-new-data-foundayo-retatrutide-and-eloratzp-easd', commerceStatus: 'NOT_SOLD' },
]
export const RESEARCH_ENTITIES: ResearchEntity[] = [...RESEARCH_COMPOUNDS, ...COMBINATIONS]
export const RESEARCH_ENTITY_BY_ID: Record<string, ResearchEntity> = Object.fromEntries(RESEARCH_ENTITIES.map((entity) => [entity.id, entity]))

export function entityTypeLabel(entity: ResearchEntity): string {
  return entity.type === 'COMPOUND' ? entity.researchStatus === 'WATCHLIST' ? 'Watchlist compound' : 'Compound' : entity.type === 'COMMUNITY_STACK' ? 'Community stack' : 'Clinical combination'
}

export function entityPath(entity: ResearchEntity): string {
  return entity.type !== 'COMPOUND' ? `/combinations#${entity.id}` : entity.researchStatus === 'WATCHLIST' ? `/watchlist/${entity.id}` : `/compound/${entity.id}`
}

export function coreCompoundFor(entity: ResearchEntity): Compound | null {
  if (entity.type !== 'COMPOUND' || entity.researchStatus !== 'CORE_LIBRARY') return null
  return COMPOUND_BY_SLUG[entity.id] ?? null
}

// Empty until actual inventory and its pricing are supplied and verified.
export const PRODUCT_LISTINGS: ProductListing[] = []
export const INVENTORY_LOTS: InventoryLot[] = []
export const LOT_COAS: LotCOA[] = []
// Do not infer approvals from trial registrations or company press releases.
export const REGULATORY_RECORDS: RegulatoryRecord[] = []

export function availableListingFor(compoundId: string): ProductListing | undefined {
  return PRODUCT_LISTINGS.find((item) => item.compoundId === compoundId && item.commerceStatus === 'AVAILABLE' && item.inventoryLotIds.some((id) => INVENTORY_LOTS.some((lot) => lot.id === id && lot.compoundId === compoundId && lot.productListingId === item.id && lot.quantityAvailable > 0 && lot.verifiedAt && lot.verificationSource)))
}

export function commerceStatusFor(entity: ResearchEntity): CommerceStatus {
  if (entity.type !== 'COMPOUND') return 'NOT_SOLD'
  if (availableListingFor(entity.id)) return 'AVAILABLE'
  return PRODUCT_LISTINGS.some((listing) => listing.compoundId === entity.id && listing.commerceStatus === 'OUT_OF_STOCK') ? 'OUT_OF_STOCK' : 'NOT_SOLD'
}

export function commerceLabelFor(entity: ResearchEntity): string {
  const status = commerceStatusFor(entity)
  return status === 'AVAILABLE' ? 'Available for research' : status === 'OUT_OF_STOCK' ? 'Currently unavailable' : 'Informational profile'
}

export function publicCurrentCoas(): LotCOA[] {
  return LOT_COAS.filter((coa) => {
    const listing = PRODUCT_LISTINGS.find((item) => item.id === coa.productListingId && item.compoundId === coa.compoundId)
    return coa.status === 'CURRENT' && !!availableListingFor(coa.compoundId) && listing?.commerceStatus === 'AVAILABLE' && listing.inventoryLotIds.includes(coa.inventoryLotId) && INVENTORY_LOTS.some((lot) => lot.id === coa.inventoryLotId && lot.productListingId === listing.id && lot.lotNumber === coa.lotNumber && lot.quantityAvailable > 0)
  })
}
