import type { CSSProperties } from 'react'
import { COMPOUNDS, displayName, type Compound } from './compounds'
import { DOMAIN_BY_ID, type DomainId } from './domains'
import { environmentFor } from './environments'

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
  // Colour is keyed to the real peptide slug via environments.ts — never to array position.
  const i = COMPOUNDS.findIndex((c) => c.slug === compound.slug)
  const env = environmentFor(compound.slug)
  const palette = [env.neon, env.support, env.tertiary] as const
  void DOMAIN_BY_ID
  const base: CompoundTheme = {
    primary: palette[0], secondary: palette[1], tertiary: palette[2], glow: palette[0],
    deepBackground: env.deep, rimLight: palette[1], particleTint: palette[0], fogTint: palette[2],
    titleStyle: (['condensed', 'wide', 'mineral', 'kinetic', 'sculptural', 'precise'] as const)[i % 6],
    outlineStyle: `${palette[0]}66`, extrusionStyle: palette[2],
    moleculeMaterial: (['glass', 'satin', 'crystal', 'metal'] as const)[i % 4],
    lightRig: (['edge', 'sweep', 'halo', 'burst'] as const)[i % 4],
    motionSignature: (['signal', 'flow', 'orbit', 'burst', 'breathe'] as const)[i % 5],
    cardTreatment: (['split', 'halo', 'beam', 'mineral'] as const)[i % 4],
  }
  // Personalities keep typography / motion signatures; colour always comes from the environment map.
  const { primary: _p, secondary: _s, tertiary: _t, ...personality } = PERSONALITIES[compound.slug] ?? {}
  void _p; void _s; void _t
  return { ...base, ...personality }
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

/** Identity-only summaries shared by cards, search previews, dossiers and maps.
 * Outcome summaries remain withheld until an exact claim/source review is recorded. */
export function descriptionFor(compound: Compound): string {
  if (compound.slug === 'nad-plus') return 'NAD+ is a nucleotide-derived coenzyme, not a peptide. This page distinguishes its chemical identity from studies of different precursors or formulations.'
  if (compound.slug === 'cerebrolysin' || compound.slug === 'thymalin') return `${displayName(compound)} is a mixture rather than one defined peptide sequence. Its composition and source-specific research require separate review.`
  if (compound.slug === 'tb-500') return 'TB-500 is a name used for a thymosin β4 fragment. Its identity is not the same as the 43-residue full-length protein; source and structure review is pending.'
  if (compound.slug === 'thymosin-beta-4') return 'Full-length thymosin β4 is a 43-residue peptide. This record is separate from the fragment commonly called TB-500.'
  if (compound.slug === 'cjc-1295') return 'The CJC-1295 name is used across formulations. This record does not transfer findings from a long-acting analog to a separately described no-DAC form.'
  if (compound.slug === 'ghk-cu') return 'GHK-Cu names a copper complex of the three-residue GHK peptide. Structure artwork here is illustrative, not an experimentally measured model.'
  const identity = compound.sequence ? `${compound.sequence.length}-residue peptide` : 'compound with sequence identity under review'
  return `${displayName(compound)} is indexed here as a ${identity}. A source-backed outcome summary has not yet been completed for this record.`
}
