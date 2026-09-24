import type { DomainId } from './domains'

export type ModKind =
  | 'acyl'
  | 'acetyl'
  | 'amide'
  | 'Aib'
  | 'D'
  | 'Nle'
  | 'Dmt'
  | 'Nal'
  | 'MeLeu'
  | 'PEG'
  | 'gamma'

export interface Mod {
  pos: number // 1-based residue position
  kind: ModKind
}

export interface Cyclic {
  from: number
  to: number
  type: 'lactam' | 'disulfide'
}

export interface Metal {
  residues: number[]
  element: string
}

export type StructureSource = 'pdb' | 'computed' | 'pending'

export interface Compound {
  slug: string
  name: string
  displayName?: string
  domain: DomainId
  tags: string[]
  /** One-letter sequence, or null when pending verification. 'X' = non-standard residue described in mods. */
  sequence: string | null
  mods: Mod[]
  cyclic?: Cyclic
  metal?: Metal
  mw?: number
  cas?: string
  structureSource: StructureSource
  pdbIds: string[]
  /** Intentionally empty until verified. Never fabricate. */
  pmids: string[]
  archetype: string
  aliases: string[]
  /** Honest note for non-peptide / edge-case entries. */
  note?: string
}

export const COMPOUNDS: Compound[] = [
  // ---- Repair (branch)
  {
    slug: 'bpc-157',
    aliases: ["Body Protection Compound 157", "Pentadecapeptide BPC 157", "PL 14736", "Bepecin"],
    name: 'BPC-157',
    domain: 'repair',
    tags: ['cytoprotective', 'gastric-fragment', 'pentadecapeptide'],
    sequence: 'GEPPPGKPADDAGLV',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: ['21030672', '42542926', '41754849', '40789979', '40756949'],
    archetype: 'The three-proline hinge. Fifteen residues with a stiff centre and loose ends.',
  },
  {
    slug: 'tb-500',
    aliases: ['Thymosin β4 fragment', 'LKKTETQ fragment'],
    name: 'TB-500 fragment',
    domain: 'repair',
    tags: ['thymosin-fragment', 'identity-review'],
    sequence: 'LKKTETQ',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'A seven-residue fragment; do not equate it with full-length thymosin β4.',
    note: 'FDA describes LKKTETQ as thymosin β4 fragment, also known as TB-500. The exact identity of material sold under this name can vary; no outcome summary is attached.',
  },
  {
    slug: 'thymosin-beta-4',
    aliases: ['Thymosin beta-4', 'Tβ4', 'TMSB4X'],
    name: 'Thymosin β4 (full length)',
    domain: 'repair',
    tags: ['thymosin', 'full-length', '43-residue'],
    sequence: 'SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: ['34170491'],
    archetype: 'The full 43-residue peptide, distinct from the seven-residue TB-500 fragment.',
    note: 'This full-length record is not a synonym for TB-500. Papers that examine multiple fragments need source-specific attribution.',
  },
  // ---- Dermal (bloom)
  {
    slug: 'ghk-cu',
    aliases: ["Copper tripeptide-1", "Glycyl-L-histidyl-L-lysine copper", "GHK copper complex"],
    name: 'GHK-Cu',
    domain: 'dermal',
    tags: ['copper-complex', 'tripeptide', 'matrix'],
    sequence: 'GHK',
    mods: [],
    metal: { residues: [1, 2, 3], element: 'Cu' },
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The copper carrier. Three residues around one warm metal centre.',
  },
  {
    slug: 'pt-141',
    aliases: ["Bremelanotide", "Vyleesi"],
    name: 'PT-141 (Bremelanotide)',
    domain: 'cognitive',
    tags: ['melanocortin', 'cyclic-lactam', 'd-residue'],
    sequence: 'XDHFRWK',
    mods: [
      { pos: 1, kind: 'Nle' },
      { pos: 1, kind: 'acetyl' },
      { pos: 4, kind: 'D' },
    ],
    cyclic: { from: 2, to: 7, type: 'lactam' },
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The closed ring. A lactam bridge pulls the chain into a loop; one mirrored residue inside.',
    note: 'Bremelanotide has a free-acid C terminus; Melanotan II has an amide there. Source: FDA Vyleesi chemistry review (NDA 210557).',
  },
  {
    slug: 'melanotan-ii',
    aliases: ["MT-II", "MT-2"],
    name: 'Melanotan II',
    domain: 'dermal',
    tags: ['melanocortin', 'cyclic-lactam', 'd-residue'],
    sequence: 'XDHFRWK',
    mods: [
      { pos: 1, kind: 'Nle' },
      { pos: 1, kind: 'acetyl' },
      { pos: 4, kind: 'D' },
      { pos: 7, kind: 'amide' },
    ],
    cyclic: { from: 2, to: 7, type: 'lactam' },
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The ring, again. Same backbone as PT-141; the same loop, a different history.',
    note: 'Melanotan II has an amidated C terminus, unlike bremelanotide (PT-141).',
  },
  // ---- Somatotropic (pulse)
  {
    slug: 'ipamorelin',
    aliases: ["NNC 26-0161"],
    name: 'Ipamorelin',
    domain: 'somatotropic',
    tags: ['ghs-r', 'pentapeptide', 'd-residue'],
    sequence: 'AHFFK',
    mods: [
      { pos: 1, kind: 'Aib' },
      { pos: 3, kind: 'Nal' },
      { pos: 3, kind: 'D' },
      { pos: 4, kind: 'D' },
      { pos: 5, kind: 'amide' },
    ],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The five-note phrase. Two mirrored residues and a naphthyl ring in a chain you can count on one hand.',
  },
  {
    slug: 'kisspeptin-10',
    aliases: ['KP-10', 'Metastin (45-54)'],
    name: 'Kisspeptin-10',
    domain: 'somatotropic',
    tags: ['reproductive-signaling', 'kiss1r', 'decapeptide'],
    sequence: 'YNWNSFGLRF',
    mods: [{ pos: 10, kind: 'amide' }],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The reproductive signal. Ten residues ending in an amidated phenylalanine.',
  },
  {
    slug: 'cjc-1295',
    aliases: ["Modified GRF (1-29)", "Mod GRF 1-29", "CJC-1295 without DAC"],
    name: 'CJC-1295 (no DAC)',
    domain: 'somatotropic',
    tags: ['ghrh-r', 'ghrh-analogue', 'd-residue'],
    sequence: 'YADAIFTNSYRKVLGQLSARKLLQDILSR',
    mods: [
      { pos: 2, kind: 'D' },
      { pos: 29, kind: 'amide' },
    ],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The stabilised helix. Twenty-nine residues, one mirrored alanine near the start.',
  },
  {
    slug: 'sermorelin',
    aliases: ["GRF 1-29", "GHRH (1-29)"],
    name: 'Sermorelin',
    domain: 'somatotropic',
    tags: ['ghrh-r', 'ghrh-analogue'],
    sequence: 'YADAIFTNSYRKVLGQLSARKLLQDIMSR',
    mods: [{ pos: 29, kind: 'amide' }],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The original twenty-nine. The GHRH fragment the others are measured against.',
  },
  {
    slug: 'tesamorelin',
    aliases: ["Egrifta", "TH9507"],
    name: 'Tesamorelin',
    domain: 'somatotropic',
    tags: ['ghrh-r', 'ghrh-analogue', 'n-acyl'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The capped forty-four. A hexenoyl group on the N-terminus; full sequence pending verification.',
    note: '44-residue GHRH analogue with a trans-3-hexenoyl N-terminal modification. Sequence pending verification.',
  },
  {
    slug: 'hexarelin',
    aliases: ["Examorelin"],
    name: 'Hexarelin',
    domain: 'somatotropic',
    tags: ['ghs-r', 'hexapeptide'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The six-residue call. Sequence pending verification.',
  },
  {
    slug: 'ghrp-2',
    aliases: ["Pralmorelin", "KP-102"],
    name: 'GHRP-2',
    domain: 'somatotropic',
    tags: ['ghs-r', 'hexapeptide'],
    sequence: 'AXAWFK',
    mods: [
      { pos: 1, kind: 'D' },
      { pos: 2, kind: 'Nal' },
      { pos: 2, kind: 'D' },
      { pos: 5, kind: 'D' },
      { pos: 6, kind: 'amide' },
    ],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'A compact six-residue chain with three mirrored residues, a bulky naphthyl group and an amidated end.',
    note: 'Sequence and modifications are represented; the 3D pose is a computed illustration, not a measured structure.',
  },
  {
    slug: 'ghrp-6',
    aliases: ["Growth hormone releasing peptide-6"],
    name: 'GHRP-6',
    domain: 'somatotropic',
    tags: ['ghs-r', 'hexapeptide'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The sixth. Sequence pending verification.',
  },
  {
    slug: 'igf-1-lr3',
    aliases: ["Long R3 IGF-1", "LR3-IGF-1"],
    name: 'IGF-1 LR3',
    domain: 'somatotropic',
    tags: ['igf-1r', 'protein', 'n-extended'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The long-arm protein. Eighty-plus residues with an N-terminal extension; sequence pending verification.',
  },
  {
    slug: 'follistatin-344',
    aliases: ['FST344', 'Follistatin isoform 344'],
    name: 'Follistatin 344',
    domain: 'somatotropic',
    tags: ['protein', 'myostatin-binding', 'activin-binding'],
    sequence: 'MVRARHQPGGLCLLLLLLCQFMEDRSAQAGNCWLRQAKNGRCQVLYKTELSKEECCSTGRLSTSWTEEDVNDNTLFKWMIFNGGAPNCIPCKETCENVDCGPGKKCRMNKKNKPRCVCAPDCSNITWKGPVCGLDGKTYRNECALLKARCKEQPELEVQYQGRCKKTCRDVFCPGSSTCVVDQTNNAYCVTCNRICPEPASSEQYLCGNDGVTYSSACHLRKATCLLGRSIGLAYEGKCIKAKSCEDIQCTGGKKCLWDFKVGRGRCSLCDELCPDSKSDEPVCASDNATYASECAMKEAACSSGVLLEVKHSGSCNSISEDTEEEEEDEDQDYSFPISSILEW',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'A 344-residue precursor protein with many cysteines and several compact binding domains — nothing like a six-residue GHRP.',
    note: 'Full 344-residue human precursor sequence (UniProt P19883) with the AlphaFold P19883 model. Studied preparations may involve a different mature form.',
  },
  // ---- Cognitive & Neural (propagate)
  {
    slug: 'semax',
    aliases: ["Met-Glu-His-Phe-Pro-Gly-Pro", "ACTH(4-7)-PGP"],
    name: 'Semax',
    domain: 'cognitive',
    tags: ['acth-fragment', 'neurotrophic', 'heptapeptide'],
    sequence: 'MEHFPGP',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The ACTH fragment with a proline tail. Seven residues, two kinks at the end.',
  },
  {
    slug: 'selank',
    aliases: ["TP-7", "Tuftsin analogue"],
    name: 'Selank',
    domain: 'cognitive',
    tags: ['tuftsin-analogue', 'neurotrophic', 'heptapeptide'],
    sequence: 'TKPRPGP',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The tuftsin analogue. Three prolines in seven residues; a chain that refuses to straighten.',
  },
  {
    slug: 'cerebrolysin',
    aliases: ["FPF-1070"],
    name: 'Cerebrolysin',
    domain: 'cognitive',
    tags: ['neurotrophic', 'peptide-mixture'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The mixture. A porcine-derived peptide fraction, not a single defined sequence.',
    note: 'Peptide mixture — no single defined sequence. Rendered as pending.',
  },
  {
    slug: 'p21',
    aliases: ["P021"],
    name: 'P21',
    domain: 'cognitive',
    tags: ['neurotrophic', 'cntf-derived'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The CNTF-derived fragment. Sequence pending verification.',
  },
  {
    slug: 'pinealon',
    aliases: ["Glu-Asp-Arg tripeptide"],
    name: 'Pinealon',
    domain: 'cognitive',
    tags: ['pineal', 'tripeptide', 'bioregulator'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The short bioregulator. Three residues; sequence pending verification.',
  },
  // ---- Longevity (reknit)
  {
    slug: 'epitalon',
    aliases: ["Epithalon", "Epithalone", "AEDG peptide"],
    name: 'Epitalon',
    domain: 'longevity',
    tags: ['pineal', 'tetrapeptide', 'bioregulator'],
    sequence: 'AEDG',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The four-letter word. Two acidic residues in the middle, glycine at the end.',
  },
  {
    slug: 'mots-c',
    aliases: ["Mitochondrial open reading frame of the 12S rRNA-c"],
    name: 'MOTS-c',
    domain: 'longevity',
    tags: ['mitochondrial', 'mtdna-encoded'],
    sequence: 'MRWQEMGYIFYPRKLR',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The mitochondrial message. Sixteen residues encoded by mitochondrial DNA, a proline near the end.',
  },
  {
    slug: 'ss-31',
    aliases: ["Elamipretide", "Bendavia", "MTP-131"],
    name: 'SS-31 (Elamipretide)',
    domain: 'longevity',
    tags: ['mitochondrial', 'cardiolipin', 'tetrapeptide', 'd-residue'],
    sequence: 'RXKF',
    mods: [
      { pos: 1, kind: 'D' },
      { pos: 2, kind: 'Dmt' },
      { pos: 4, kind: 'amide' },
    ],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The four-residue alternator. Aromatic, cationic, aromatic, cationic — with two extra methyls on the tyrosine.',
  },
  {
    slug: 'humanin',
    aliases: ["HN", "MT-RNR2-derived peptide"],
    name: 'Humanin',
    domain: 'longevity',
    tags: ['mitochondrial', 'mtdna-encoded'],
    sequence: 'MAPRGFSCLLLLTSEIDLPVKRRA',
    mods: [],
    structureSource: 'pdb',
    pdbIds: ['1Y32', '2GD3'],
    pmids: [],
    archetype: 'The measured one. Twenty-four residues with a deposited NMR structure and a leucine core.',
  },
  {
    slug: 'nad-plus',
    aliases: ["Nicotinamide adenine dinucleotide", "NAD"],
    name: 'NAD+',
    domain: 'longevity',
    tags: ['redox', 'cofactor', 'non-peptide'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The non-peptide. A dinucleotide cofactor, listed honestly outside the chain grammar.',
    note: 'Non-peptide — nicotinamide adenine dinucleotide is a dinucleotide, not an amino acid chain. No sequence applies.',
  },
  {
    slug: 'glutathione',
    aliases: ["GSH", "γ-L-Glutamyl-L-cysteinylglycine"],
    name: 'Glutathione',
    domain: 'longevity',
    tags: ['redox', 'tripeptide', 'thiol'],
    sequence: 'ECG',
    mods: [{ pos: 1, kind: 'gamma' }],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The gamma-linked tripeptide. Glutamate joined through its side-chain carboxyl, not its backbone.',
    note: 'Tripeptide with a non-standard γ-glutamyl linkage (γ-Glu-Cys-Gly).',
  },
  // ---- Immune (sweep)
  {
    slug: 'thymosin-alpha-1',
    aliases: ["Thymalfasin", "Zadaxin", "Tα1"],
    name: 'Thymosin α1',
    domain: 'immune',
    tags: ['thymic', 'prothymosin-fragment', 'n-acetyl'],
    sequence: 'SDAAVDTSSEITTKDLKEKKEVVEEAEN',
    mods: [{ pos: 1, kind: 'acetyl' }],
    structureSource: 'pdb',
    pdbIds: ['2L9I', '2MNQ'],
    pmids: [],
    archetype: 'The acetylated twenty-eight. Acidic, measured by NMR, capped at the N-terminus.',
  },
  {
    slug: 'thymalin',
    aliases: ["Thymic polypeptide fraction"],
    name: 'Thymalin',
    domain: 'immune',
    tags: ['thymic', 'peptide-mixture'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The thymic extract. A polypeptide fraction; no single sequence on file.',
    note: 'Polypeptide fraction — no single defined sequence. Rendered as pending.',
  },
  {
    slug: 'thymogen',
    aliases: ["Glu-Trp dipeptide", "Oglufanide"],
    name: 'Thymogen',
    domain: 'immune',
    tags: ['thymic', 'dipeptide'],
    sequence: null,
    mods: [],
    structureSource: 'pending',
    pdbIds: [],
    pmids: [],
    archetype: 'The dipeptide. Two residues; sequence pending verification.',
  },
  {
    slug: 'll-37',
    aliases: ["Cathelicidin LL-37", "hCAP18 (140-170)"],
    name: 'LL-37',
    domain: 'immune',
    tags: ['antimicrobial', 'cathelicidin', 'amphipathic-helix'],
    sequence: 'LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES',
    mods: [],
    structureSource: 'pdb',
    pdbIds: ['2K6O', '5NNM', '7PDC'],
    pmids: [],
    archetype: 'The perimeter. An amphipathic helix — one face hydrophobic, one face charged — written into thirty-seven residues.',
  },
  {
    slug: 'kpv',
    aliases: ["Lys-Pro-Val", "α-MSH (11-13)"],
    name: 'KPV',
    domain: 'immune',
    tags: ['melanocortin', 'alpha-msh-fragment', 'tripeptide'],
    sequence: 'KPV',
    mods: [],
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The C-terminal three. The last three residues of α-MSH, on their own.',
  },
  // ---- Metabolic (dock)
  {
    slug: 'aod-9604',
    aliases: ["hGH fragment 176-191", "Tyr-hGH 177-191"],
    name: 'AOD-9604',
    domain: 'metabolic',
    tags: ['gh-fragment', 'hgh-176-191'],
    sequence: 'YLRIVQCRSVEGSCGF',
    mods: [],
    cyclic: { from: 7, to: 14, type: 'disulfide' },
    structureSource: 'computed',
    pdbIds: [],
    pmids: [],
    archetype: 'The modified growth-hormone fragment. Sixteen residues, with a Cys7–Cys14 disulfide-constrained loop.',
    note: 'The two cysteines at positions 7 and 14 are joined by an intramolecular disulfide bond.',
  },
  {
    slug: 'semaglutide',
    aliases: ["Ozempic", "Wegovy", "Rybelsus", "NN9535"],
    name: 'Semaglutide',
    domain: 'metabolic',
    tags: ['glp-1r', 'incretin-analogue', 'lipidated', 'aib'],
    sequence: 'HXEGTFTSDVSSYLEGQAAKEFIAWLVRGRG',
    mods: [
      { pos: 2, kind: 'Aib' },
      { pos: 20, kind: 'acyl' },
    ],
    structureSource: 'pdb',
    pdbIds: ['4ZGM', '7KI0'],
    pmids: [],
    archetype: 'The tethered helix. A thirty-one-residue GLP-1 analogue with a C18 diacid trailing off lysine-26.',
    note: '31 residues with Aib at residue 2 and a C18 fatty-diacid tether on Lys20 (GLP-1 positions 8 and 26). Deposited receptor-bound structures resolve the helical core.',
  },
  {
    slug: 'tirzepatide',
    aliases: ["Mounjaro", "Zepbound", "LY3298176"],
    name: 'Tirzepatide',
    domain: 'metabolic',
    tags: ['glp-1r', 'gip-r', 'incretin-analogue', 'lipidated', 'aib'],
    sequence: 'YXEGTFTSDYSIXLDKIAQKAFVQWLIAGGPSSGAPPPS',
    mods: [
      { pos: 2, kind: 'Aib' },
      { pos: 13, kind: 'Aib' },
      { pos: 20, kind: 'acyl' },
      { pos: 39, kind: 'amide' },
    ],
    structureSource: 'pdb',
    pdbIds: ['7FIM', '7RGP', '7FIY'],
    pmids: [],
    archetype: 'A 39-residue dual-receptor analogue with two Aib residues, a long C20 lipid tether and an amidated tail.',
    note: 'Full sequence and key modifications are represented. Deposited receptor-bound structures resolve the helical core; the flexible tail is modeled.',
  },
  {
    slug: 'retatrutide',
    aliases: ["LY3437943", "GLP3 (display name)"],
    name: 'Retatrutide',
    displayName: 'GLP3',
    domain: 'metabolic',
    tags: ['glp-1r', 'gip-r', 'glucagon-r', 'incretin-analogue', 'lipidated'],
    sequence: 'YXQGTFTSDYSIXLDKKAQXAFIEYLLEGGPSSGAPPPS',
    mods: [
      { pos: 2, kind: 'Aib' },
      { pos: 13, kind: 'MeLeu' },
      { pos: 17, kind: 'acyl' },
      { pos: 20, kind: 'Aib' },
      { pos: 39, kind: 'amide' },
    ],
    structureSource: 'pdb',
    pdbIds: ['8YW5'],
    pmids: [],
    archetype: 'The three-key negotiator. One chain, three receptor pockets.',
    note: 'Displayed as GLP3. Compound: retatrutide. The sequence includes Aib at residues 2 and 20, α-methyl-leucine at 13, a lipid tether at Lys17 and a C-terminal amide.',
  },
]

export const COMPOUND_BY_SLUG: Record<string, Compound> = Object.fromEntries(
  COMPOUNDS.map((c) => [c.slug, c]),
)

export function compoundsInDomain(domain: DomainId): Compound[] {
  return COMPOUNDS.filter((c) => c.domain === domain)
}

export function displayName(c: Compound): string {
  return c.displayName ?? c.name
}

/** Residue average masses (Da) for canonical residues (already minus water). */
const RESIDUE_MASS: Record<string, number> = {
  A: 71.0788, R: 156.1875, N: 114.1038, D: 115.0886, C: 103.1388, E: 129.1155, Q: 128.1307,
  G: 57.0519, H: 137.1411, I: 113.1594, L: 113.1594, K: 128.1741, M: 131.1926, F: 147.1766,
  P: 97.1167, S: 87.0782, T: 101.1051, W: 186.2132, Y: 163.1760, V: 99.1326,
}
const NONSTD_MASS: Partial<Record<ModKind, number>> = {
  Nle: 113.1594, // norleucine residue
  Aib: 85.1045, // alpha-aminoisobutyric acid residue
  Dmt: 163.176 + 28.0532, // 2',6'-dimethyltyrosine
  Nal: 147.1766 + 50.0596, // 3-(2-naphthyl)alanine
}

/**
 * Computed average molecular weight from the sequence. Returns undefined when the
 * sequence is null or contains a modification whose mass is not tabulated (e.g. acyl chains).
 * This is a computed value, not a measured one — label it as such wherever shown.
 */
export function computedMW(c: Compound): number | undefined {
  if (!c.sequence) return undefined
  let total = 18.0153 // water
  for (let i = 0; i < c.sequence.length; i++) {
    const code = c.sequence[i]
    const pos = i + 1
    const modsHere = c.mods.filter((m) => m.pos === pos)
    const nonstd = modsHere.find((m) => m.kind in NONSTD_MASS)
    if (nonstd) {
      total += NONSTD_MASS[nonstd.kind]!
    } else if (code === 'X') {
      return undefined
    } else {
      const m = RESIDUE_MASS[code]
      if (m === undefined) return undefined
      total += m
    }
    for (const m of modsHere) {
      if (m.kind === 'acetyl') total += 42.0367
      else if (m.kind === 'amide') total -= 0.9847
      else if (m.kind === 'acyl' || m.kind === 'PEG') return undefined
    }
  }
  if (c.cyclic?.type === 'lactam') total -= 18.0153
  if (c.cyclic?.type === 'disulfide') total -= 2.01565
  return Math.round(total * 100) / 100
}
