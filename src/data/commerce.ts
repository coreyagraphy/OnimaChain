import type { CSSProperties } from 'react'
import { COMPOUNDS, displayName, type Compound } from './compounds'
import { DOMAIN_BY_ID } from './domains'

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
    condensed: { fontStretch: '75%', letterSpacing: '-0.055em' },
    wide: { fontStretch: '120%', letterSpacing: '0.015em' },
    mineral: { fontWeight: 650, letterSpacing: '-0.018em' },
    kinetic: { fontStyle: 'italic', fontStretch: '85%', letterSpacing: '-0.04em' },
    sculptural: { fontWeight: 820, letterSpacing: '-0.045em' },
    precise: { fontWeight: 720, letterSpacing: '-0.025em' },
  }
  return {
    ...styles[theme.titleStyle],
    color: '#F2EEE6',
    WebkitTextStroke: `1px ${theme.outlineStyle}`,
    textShadow: `0 2px 0 ${theme.extrusionStyle}55, 0 0 24px ${theme.glow}66, 0 18px 35px rgba(0,0,0,.72)`,
  }
}

const DESCRIPTIONS: Record<string, string> = {
  'bpc-157': 'BPC-157 is a short 15-amino-acid peptide that has attracted research interest around tissue response and recovery-related pathways. Most research indexed here comes from laboratory and animal models.',
  'tb-500': 'TB-500 is presented here alongside the thymosin beta-4 research record: a longer, flexible peptide studied in cell movement and tissue-response models.',
  'ghk-cu': 'GHK-Cu is a three-amino-acid copper complex studied in skin, matrix, and cellular signaling research. Its copper center gives it a distinct structural identity.',
  'mots-c': 'MOTS-c is a compact mitochondrial-derived peptide studied in cellular energy and metabolic signaling research.',
  'pt-141': 'PT-141 is a cyclic melanocortin peptide with a compact ring structure. Its research record and regulatory context are kept separate below.',
}

export function descriptionFor(compound: Compound): string {
  if (DESCRIPTIONS[compound.slug]) return DESCRIPTIONS[compound.slug]
  const domain = DOMAIN_BY_ID[compound.domain]
  const length = compound.sequence ? `${compound.sequence.length}-residue` : 'structurally distinct'
  return `${displayName(compound)} is a ${length} compound researchers have explored in ${domain.name.toLowerCase()} studies. Open the research record below to see what was studied and where the evidence currently stops.`
}
