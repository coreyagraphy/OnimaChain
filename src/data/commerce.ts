import type { CSSProperties } from 'react'
import { COMPOUNDS, displayName, type Compound } from './compounds'
import { DOMAIN_BY_ID, type DomainId } from './domains'

export const PRICE_PLACEHOLDER = '$XX.XX'

export interface CompoundTheme {
  primary: string
  secondary: string
  tertiary: string
  glow: string
  deepBackground: string
  rimLight: string
  particleTint: string
  fogTint: string
  titleStyle: 'condensed' | 'wide' | 'mineral' | 'kinetic' | 'sculptural' | 'precise'
  outlineStyle: string
  extrusionStyle: string
  moleculeMaterial: 'glass' | 'metal' | 'satin' | 'crystal'
  lightRig: 'edge' | 'sweep' | 'halo' | 'burst'
  motionSignature: 'signal' | 'flow' | 'orbit' | 'burst' | 'breathe'
  cardTreatment: 'split' | 'halo' | 'beam' | 'mineral'
}

const PALETTES = [
  ['#5FE3FF', '#8A63FF', '#315CFF'],
  ['#46E6C8', '#5A7DFF', '#B86BFF'],
  ['#53B8FF', '#315CFF', '#9B6CFF'],
  ['#54E6DE', '#C77A4D', '#147A89'],
  ['#C272FF', '#FF4FD8', '#4C5DFF'],
  ['#86F26A', '#4AD1B1', '#5B74FF'],
  ['#FF5FA2', '#9D5CFF', '#4F6CFF'],
] as const

const PERSONALITIES: Record<string, Partial<CompoundTheme>> = {
  'bpc-157': { primary: '#5FE3FF', secondary: '#8A63FF', tertiary: '#315CFF', titleStyle: 'condensed', motionSignature: 'signal', cardTreatment: 'beam' },
  'tb-500': { primary: '#53B8FF', secondary: '#315CFF', tertiary: '#9B6CFF', titleStyle: 'wide', motionSignature: 'flow', cardTreatment: 'halo' },
  'ghk-cu': { primary: '#55E4DF', secondary: '#C77A4D', tertiary: '#147A89', titleStyle: 'mineral', moleculeMaterial: 'metal', cardTreatment: 'mineral' },
  'mots-c': { primary: '#B86BFF', secondary: '#FF4FD8', tertiary: '#315CFF', titleStyle: 'kinetic', motionSignature: 'burst' },
  'pt-141': { primary: '#FF5FA2', secondary: '#9D5CFF', tertiary: '#4F3D8A', titleStyle: 'sculptural', cardTreatment: 'split' },
}

export function themeFor(compound: Compound): CompoundTheme {
  const i = COMPOUNDS.findIndex((c) => c.slug === compound.slug)
  const palette = PALETTES[(i + DOMAIN_BY_ID[compound.domain].order) % PALETTES.length]
  const base: CompoundTheme = {
    primary: palette[0], secondary: palette[1], tertiary: palette[2], glow: palette[0],
    deepBackground: '#070912', rimLight: palette[1], particleTint: palette[0], fogTint: palette[2],
    titleStyle: (['condensed', 'wide', 'mineral', 'kinetic', 'sculptural', 'precise'] as const)[i % 6],
    outlineStyle: `${palette[0]}66`, extrusionStyle: palette[2],
    moleculeMaterial: (['glass', 'satin', 'crystal', 'metal'] as const)[i % 4],
    lightRig: (['edge', 'sweep', 'halo', 'burst'] as const)[i % 4],
    motionSignature: (['signal', 'flow', 'orbit', 'burst', 'breathe'] as const)[i % 5],
    cardTreatment: (['split', 'halo', 'beam', 'mineral'] as const)[i % 4],
  }
  return { ...base, ...PERSONALITIES[compound.slug] }
}

export function wordmarkStyle(theme: CompoundTheme): CSSProperties {
  const styles: Record<CompoundTheme['titleStyle'], CSSProperties> = {
    condensed: { fontFamily: 'Inter Variable, sans-serif', fontStretch: '72%', fontWeight: 860, letterSpacing: '-0.075em' },
    wide: { fontFamily: 'Manrope Variable, sans-serif', fontStretch: '125%', fontWeight: 610, letterSpacing: '0.025em' },
    mineral: { fontFamily: 'Georgia, Cambria, serif', fontWeight: 700, letterSpacing: '-0.035em' },
    kinetic: { fontFamily: 'Inter Variable, sans-serif', fontStyle: 'italic', fontStretch: '78%', fontWeight: 780, letterSpacing: '-0.06em' },
    sculptural: { fontFamily: 'Manrope Variable, sans-serif', fontWeight: 900, letterSpacing: '-0.065em' },
    precise: { fontFamily: 'JetBrains Mono Variable, monospace', fontWeight: 650, letterSpacing: '-0.045em' },
  }
  return {
    ...styles[theme.titleStyle],
    color: '#F2EEE6',
    WebkitTextStroke: `1px ${theme.outlineStyle}`,
    textShadow: `0 2px 0 ${theme.extrusionStyle}55, 0 0 24px ${theme.glow}66, 0 18px 35px rgba(0,0,0,.72)`,
  }
}

const DESCRIPTIONS: Record<string, string> = {
  'bpc-157': 'BPC-157 is a short peptide made from 15 amino acids. People often look it up when learning about recovery and tissue repair. Its page shows what researchers checked—and what is still unknown.',
  'tb-500': 'TB-500 is connected to thymosin beta-4, a longer peptide involved in how cells move. Its page separates the studies from the bigger claims you may see online.',
  'ghk-cu': 'GHK-Cu is a tiny peptide joined to copper. It is commonly discussed in skin and hair care. Open its page to see the molecule and the research behind those conversations.',
  'mots-c': 'MOTS-c is a small peptide made inside mitochondria, the parts of cells that help make energy. Its page explains why people look it up and what has actually been studied.',
  'pt-141': 'PT-141 is a small peptide shaped like a ring. Its page explains the molecule, the names it is sold under, and the difference between a study and a claim.',
}

const SHOP_TOPICS: Record<DomainId, string> = {
  repair: 'recovery and tissue repair',
  metabolic: 'metabolism and appetite',
  somatotropic: 'growth-hormone signals',
  dermal: 'skin and hair',
  cognitive: 'the brain and focus',
  longevity: 'cell energy and ageing',
  immune: 'immune response',
}

export function shopTopicFor(compound: Compound): string {
  return SHOP_TOPICS[compound.domain]
}

export function descriptionFor(compound: Compound): string {
  if (DESCRIPTIONS[compound.slug]) return DESCRIPTIONS[compound.slug]
  const length = compound.sequence ? `${compound.sequence.length}-residue` : 'structurally distinct'
  return `${displayName(compound)} is a ${length} compound often discussed around ${SHOP_TOPICS[compound.domain]}. See what it is, why people look it up, and what the available research can—and cannot—tell us.`
}
