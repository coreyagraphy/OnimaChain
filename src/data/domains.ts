export type DomainId =
  | 'metabolic'
  | 'somatotropic'
  | 'repair'
  | 'dermal'
  | 'cognitive'
  | 'longevity'
  | 'immune'

export type RigId = 'dock' | 'pulse' | 'branch' | 'bloom' | 'propagate' | 'reknit' | 'sweep'

export interface Domain {
  id: DomainId
  name: string
  /** "Compounds investigated in X research" — never "best for". */
  researchLabel: string
  rig: RigId
  /** One line of motion-grammar description (structural, never outcome language). */
  grammar: string
  /** Backbone tint + accent for the domain. Restrained: cyan ↔ cobalt ↔ violet. Amber is never a domain colour. */
  palette: { base: string; accent: string; glow: string }
  order: number
}

export const DOMAINS: Domain[] = [
  {
    id: 'repair',
    name: 'Tissue repair',
    researchLabel: 'Compounds investigated in tissue-repair research',
    rig: 'branch',
    grammar: 'Branch — a line network grows from the edges toward the centre and closes over a mask.',
    palette: { base: '#5FE3FF', accent: '#9FF0FF', glow: '#5FE3FF' },
    order: 1,
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    researchLabel: 'Compounds investigated in metabolic research',
    rig: 'dock',
    grammar: 'Dock — a ligand approaches a receptor ring; on contact, a signal wave propagates inward.',
    palette: { base: '#4F7BFF', accent: '#8FB0FF', glow: '#2247D6' },
    order: 2,
  },
  {
    id: 'somatotropic',
    name: 'Somatotropic',
    researchLabel: 'Compounds investigated in growth-hormone-axis research',
    rig: 'pulse',
    grammar: 'Pulse — emissive intensity rides a night-weighted 24h waveform; bursts on the peaks.',
    palette: { base: '#8A63FF', accent: '#B9A2FF', glow: '#8A63FF' },
    order: 3,
  },
  {
    id: 'dermal',
    name: 'Dermal & matrix',
    researchLabel: 'Compounds investigated in skin and extracellular-matrix research',
    rig: 'bloom',
    grammar: 'Bloom — a point emits a radial diffusion field that spreads outward and settles.',
    palette: { base: '#9FD8E8', accent: '#D7EEF5', glow: '#7FC8DD' },
    order: 4,
  },
  {
    id: 'cognitive',
    name: 'Cognitive & neural',
    researchLabel: 'Compounds investigated in neural research',
    rig: 'propagate',
    grammar: 'Propagate — a single packet hops a sparse graph; edges flash in sequence as it crosses.',
    palette: { base: '#A98BFF', accent: '#CBB8FF', glow: '#8A63FF' },
    order: 5,
  },
  {
    id: 'longevity',
    name: 'Mitochondrial & ageing',
    researchLabel: 'Compounds investigated in mitochondrial and ageing research',
    rig: 'reknit',
    grammar: 'Reknit — an assembly curve played in reverse with slow rotation.',
    palette: { base: '#7FD1C9', accent: '#B2EBE5', glow: '#5FE3FF' },
    order: 6,
  },
  {
    id: 'immune',
    name: 'Immune & antimicrobial',
    researchLabel: 'Compounds investigated in immune and antimicrobial research',
    rig: 'sweep',
    grammar: 'Sweep — a cone of light sweeps a field of points, locks on one, flags it, and resumes.',
    palette: { base: '#B7C6D6', accent: '#E3ECF3', glow: '#9FD8E8' },
    order: 7,
  },
]

export const DOMAIN_BY_ID: Record<DomainId, Domain> = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<
  DomainId,
  Domain
>
