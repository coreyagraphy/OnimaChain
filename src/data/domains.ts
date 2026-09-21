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
  /** Plain, consumer-facing topic name (shown everywhere). */
  name: string
  /** One persuasive line; describes what people look into, never promises a result. */
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
    name: 'Recovery & Repair',
    tagline: 'For the days after the hard days.',
    image: '/topics/repair.webp',
    researchLabel: 'Peptides people look into for recovery and repair',
    rig: 'branch',
    grammar: 'Branch — a line network grows from the edges toward the centre and closes over a mask.',
    palette: { base: '#5FE3FF', accent: '#9FF0FF', glow: '#5FE3FF' },
    order: 1,
  },
  {
    id: 'metabolic',
    name: 'Weight & Metabolism',
    tagline: 'The GLP names everyone is talking about.',
    image: '/topics/metabolic.webp',
    researchLabel: 'Peptides people look into for weight and metabolism',
    rig: 'dock',
    grammar: 'Dock — a ligand approaches a receptor ring; on contact, a signal wave propagates inward.',
    palette: { base: '#4F7BFF', accent: '#8FB0FF', glow: '#2247D6' },
    order: 2,
  },
  {
    id: 'somatotropic',
    name: 'Growth & Muscle',
    tagline: 'Studied around your body’s own growth signals.',
    image: '/topics/somatotropic.webp',
    researchLabel: 'Peptides people look into for growth and muscle',
    rig: 'pulse',
    grammar: 'Pulse — emissive intensity rides a night-weighted 24h waveform; bursts on the peaks.',
    palette: { base: '#8A63FF', accent: '#B9A2FF', glow: '#8A63FF' },
    order: 3,
  },
  {
    id: 'dermal',
    name: 'Skin, Hair & Glow',
    tagline: 'Collagen, color, and that lit-from-within look.',
    image: '/topics/dermal.webp',
    researchLabel: 'Peptides people look into for skin and hair',
    rig: 'bloom',
    grammar: 'Bloom — a point emits a radial diffusion field that spreads outward and settles.',
    palette: { base: '#9FD8E8', accent: '#D7EEF5', glow: '#7FC8DD' },
    order: 4,
  },
  {
    id: 'cognitive',
    name: 'Focus & Mood',
    tagline: 'Brain peptides people talk about for calm and clarity.',
    image: '/topics/cognitive.webp',
    researchLabel: 'Peptides people look into for focus and mood',
    rig: 'propagate',
    grammar: 'Propagate — a single packet hops a sparse graph; edges flash in sequence as it crosses.',
    palette: { base: '#A98BFF', accent: '#CBB8FF', glow: '#8A63FF' },
    order: 5,
  },
  {
    id: 'longevity',
    name: 'Aging & Cell Energy',
    tagline: 'The fountain-of-youth research: what’s real, what’s hype.',
    image: '/topics/longevity.webp',
    researchLabel: 'Peptides people look into for aging and cell energy',
    rig: 'reknit',
    grammar: 'Reknit — an assembly curve played in reverse with slow rotation.',
    palette: { base: '#7FD1C9', accent: '#B2EBE5', glow: '#5FE3FF' },
    order: 6,
  },
  {
    id: 'immune',
    name: 'Immune Defense',
    tagline: 'Studied around how the body guards itself.',
    image: '/topics/immune.webp',
    researchLabel: 'Peptides people look into for immune support',
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
