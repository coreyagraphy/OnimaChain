import type { Compound } from './compounds'
import { DEPOSITED_CONFORMERS } from './conformers'

export type StructureKind = 'deposited' | 'predicted' | 'sequence' | 'mixture' | 'non-peptide' | 'unresolved'

export interface StructurePresentation {
  kind: StructureKind
  label: string
  detail: string
  sourceUrl?: string
}

const SPECIFIC_DETAILS: Record<string, string> = {
  'aod-9604': '16 residues · Cys7–Cys14 disulfide · constrained loop',
  'semaglutide': '31 residues · Aib2 · lipid tether at Lys20',
  'tirzepatide': '39 residues · Aib2 + Aib13 · lipid tether at Lys20',
  'retatrutide': '39 residues · Aib2 + Aib20 · lipid tether at Lys17',
  'pt-141': '7 residues · lactam ring · free-acid C terminus',
  'melanotan-ii': '7 residues · lactam ring · amidated C terminus',
  'ghk-cu': '3 residues · copper complex',
}
const REFERENCE_URLS: Record<string, string> = {
  'aod-9604': 'https://pubchem.ncbi.nlm.nih.gov/compound/AOD-9604',
  'pt-141': 'https://www.accessdata.fda.gov/drugsatfda_docs/nda/2019/210557Orig1s000ChemR.pdf',
  'melanotan-ii': 'https://pubchem.ncbi.nlm.nih.gov/compound/92432',
}

export function structurePresentation(compound: Compound): StructurePresentation {
  if (compound.tags.includes('non-peptide')) return {
    kind: 'non-peptide', label: 'Not a peptide', detail: 'A peptide backbone would be inaccurate',
  }
  if (compound.tags.includes('peptide-mixture')) return {
    kind: 'mixture', label: 'Peptide mixture', detail: 'No single sequence or 3D structure applies',
  }
  if (!compound.sequence) return {
    kind: 'unresolved', label: 'Structure not verified', detail: 'No molecular model shown until its sequence is checked',
  }
  const deposited = DEPOSITED_CONFORMERS[compound.slug]
  const detail = SPECIFIC_DETAILS[compound.slug] ?? `${compound.sequence.length} residues · ${compound.mods.length ? `${compound.mods.length} recorded modification${compound.mods.length === 1 ? '' : 's'}` : 'residue-order schematic'}`
  if (deposited?.source.startsWith('RCSB')) {
    const pdb = deposited.source.match(/PDB ([A-Z0-9]+)/)?.[1]
    return { kind: 'deposited', label: `PDB ${pdb} · ${deposited.count}/${compound.sequence.length} resolved`, detail, sourceUrl: pdb ? `https://www.rcsb.org/structure/${pdb}` : undefined }
  }
  if (deposited?.source.startsWith('AlphaFold')) return {
    kind: 'predicted', label: 'Predicted model · not measured', detail,
    sourceUrl: 'https://alphafold.ebi.ac.uk/entry/P19883',
  }
  return { kind: 'sequence', label: 'Sequence-derived illustration', detail, sourceUrl: REFERENCE_URLS[compound.slug] }
}

/** Chemical identity, not visual pose. Used to catch accidental reuse between catalog entries. */
export function structureIdentity(compound: Compound): string | null {
  if (!compound.sequence) return null
  return JSON.stringify({
    sequence: compound.sequence,
    mods: compound.mods.map(({ pos, kind }) => [pos, kind]),
    cyclic: compound.cyclic ?? null,
    metal: compound.metal ?? null,
  })
}
