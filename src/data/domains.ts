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
  /** Educational browsing subject (not a personal-use category). */
  name: string
  /** Scope line for the subject, without an outcome promise. */
  tagline: string
  /** Faded background image for the topic card (public/topics). Illustrative only. */
  image: string
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
    name: 'Tissue biology',
    tagline: 'Models of tissue response and repair research.',
    image: '/topics/repair.webp',
    researchLabel: 'Peptides indexed in tissue-biology research',
    rig: 'branch',
    grammar: 'Branch — a line network grows from the edges toward the centre and closes over a mask.',
    palette: { base: '#5FE3FF', accent: '#9FF0FF', glow: '#5FE3FF' },
    order: 1,
  },
  {
    id: 'metabolic',
    name: 'Metabolic signaling',
    tagline: 'Hormones, receptors and metabolic study settings.',
    image: '/topics/metabolic.webp',
    researchLabel: 'Peptides indexed in metabolic-signaling research',
    rig: 'dock',
    grammar: 'Dock — a ligand approaches a receptor ring; on contact, a signal wave propagates inward.',
    palette: { base: '#4F7BFF', accent: '#8FB0FF', glow: '#2247D6' },
    order: 2,
  },
  {
    id: 'somatotropic',
    name: 'Growth-factor biology',
    tagline: 'Study records involving growth signaling pathways.',
    image: '/topics/somatotropic.webp',
    researchLabel: 'Peptides indexed in growth-factor research',
    rig: 'pulse',
    grammar: 'Pulse — emissive intensity rides a night-weighted 24h waveform; bursts on the peaks.',
    palette: { base: '#8A63FF', accent: '#B9A2FF', glow: '#8A63FF' },
    order: 3,
  },
  {
    id: 'dermal',
    name: 'Skin and pigment biology',
    tagline: 'Pigment and tissue models, separated by study setting.',
    image: '/topics/dermal.webp',
    researchLabel: 'Peptides indexed in skin and pigment research',
    rig: 'bloom',
    grammar: 'Bloom — a point emits a radial diffusion field that spreads outward and settles.',
    palette: { base: '#9FD8E8', accent: '#D7EEF5', glow: '#7FC8DD' },
    order: 4,
  },
  {
    id: 'cognitive',
    name: 'Nervous-system research',
    tagline: 'Neural mechanisms and the limits of their models.',
    image: '/topics/cognitive.webp',
    researchLabel: 'Peptides indexed in nervous-system research',
    rig: 'propagate',
    grammar: 'Propagate — a single packet hops a sparse graph; edges flash in sequence as it crosses.',
    palette: { base: '#A98BFF', accent: '#CBB8FF', glow: '#8A63FF' },
    order: 5,
  },
  {
    id: 'longevity',
    name: 'Cellular energy and aging',
    tagline: 'Cellular-energy questions and evidence boundaries.',
    image: '/topics/longevity.webp',
    researchLabel: 'Compounds indexed in cellular-energy research',
    rig: 'reknit',
    grammar: 'Reknit — an assembly curve played in reverse with slow rotation.',
    palette: { base: '#7FD1C9', accent: '#B2EBE5', glow: '#5FE3FF' },
    order: 6,
  },
  {
    id: 'immune',
    name: 'Immune-system research',
    tagline: 'Immune-signaling research by model and source.',
    image: '/topics/immune.webp',
    researchLabel: 'Peptides indexed in immune-system research',
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
