import type { HotspotKind } from './geometry'

/**
 * Hotspot rules: how each structural feature is drawn and described.
 * The detection itself lives in geometry.ts (buildChain); this file is the presentation contract.
 */
export interface HotspotRule {
  kind: HotspotKind
  title: string
  color: string
  /** Marker shape used by ChainRenderer. */
  marker: 'hinge' | 'ring' | 'ion' | 'bridge' | 'tether' | 'cap' | 'twin' | 'dot'
  /** Short structural explanation (no claims about effects). */
  explain: string
}

export const HOTSPOT_RULES: Record<HotspotKind, HotspotRule> = {
  proline: {
    kind: 'proline',
    title: 'Proline kink',
    color: '#B9A2FF',
    marker: 'hinge',
    explain: 'Proline\'s ring closes onto its own backbone nitrogen, removing an H-bond donor. The helix bends 30–40° here.',
  },
  glycine: {
    kind: 'glycine',
    title: 'Glycine',
    color: '#B9A2FF',
    marker: 'dot',
    explain: 'No side chain. The backbone is unusually flexible at this residue.',
  },
  copper: {
    kind: 'copper',
    title: 'Copper site',
    color: '#E0863A',
    marker: 'ion',
    explain: 'Cu(II) coordinated by the backbone and side chains of the listed residues.',
  },
  lactam: {
    kind: 'lactam',
    title: 'Lactam bridge',
    color: '#8A63FF',
    marker: 'bridge',
    explain: 'A side-chain-to-side-chain amide (Asp–Lys) closes the chain into a ring.',
  },
  acyl: {
    kind: 'acyl',
    title: 'Acyl tether',
    color: '#B9B4AA',
    marker: 'tether',
    explain: 'A fatty-acid chain attached through a linker trails off the residue.',
  },
  acetyl: {
    kind: 'acetyl',
    title: 'N-acetyl cap',
    color: '#DCE8EE',
    marker: 'cap',
    explain: 'The N-terminal amine is acetylated, removing its positive charge.',
  },
  amide: {
    kind: 'amide',
    title: 'C-terminal amide',
    color: '#DCE8EE',
    marker: 'cap',
    explain: 'The C-terminal carboxyl is converted to an amide, removing its negative charge.',
  },
  aib: {
    kind: 'aib',
    title: 'Aib',
    color: '#9C9691',
    marker: 'twin',
    explain: 'α-Aminoisobutyric acid carries two methyls on the α-carbon and strongly favours helical backbone angles.',
  },
  'd-residue': {
    kind: 'd-residue',
    title: 'D-residue',
    color: '#5FE3FF',
    marker: 'ring',
    explain: 'Mirror-image stereocentre. Drawn with a ring badge.',
  },
  nonstandard: {
    kind: 'nonstandard',
    title: 'Non-standard residue',
    color: '#9C9691',
    marker: 'dot',
    explain: 'A residue outside the twenty canonical amino acids.',
  },
  gamma: {
    kind: 'gamma',
    title: 'γ-linkage',
    color: '#5FE3FF',
    marker: 'dot',
    explain: 'The peptide bond is formed through the side-chain carboxyl of glutamate rather than its α-carboxyl.',
  },
}
