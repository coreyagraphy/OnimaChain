import type { CSSProperties } from 'react'
import { COMPOUNDS, displayName, type Compound } from './compounds'
import { DOMAIN_BY_ID, type DomainId } from './domains'
import { environmentFor } from './environments'

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

const DESCRIPTIONS: Record<string, string> = {
  'retatrutide': 'Retatrutide, shown here as GLP3, is an experimental medicine that targets three appetite and metabolism signals at once. Researchers are studying it for weight management, but it is not yet an approved treatment.',
  'tirzepatide': 'Tirzepatide is a prescription medicine that works on two gut-hormone signals involved in appetite and blood sugar. It is approved for certain people with obesity, overweight, or type 2 diabetes under specific brand names.',
  'semaglutide': 'Semaglutide is the well-known GLP-1 medicine behind brands such as Wegovy and Ozempic. It can help eligible patients manage appetite, blood sugar, and weight when prescribed for the right use.',
  'tesamorelin': 'Tesamorelin signals the body to release more of its own growth hormone. Its approved use is narrow: reducing excess abdominal fat in adults with HIV-related lipodystrophy—not general belly-fat loss.',
  'mots-c': 'MOTS-c is a tiny peptide made by mitochondria, the energy centers inside cells. Researchers are exploring links to exercise and metabolism, but the human evidence does not support calling it “exercise in a bottle.”',
  'follistatin-344': 'Follistatin 344 is a large binding protein studied for how it interacts with myostatin and other growth signals. Muscle-building claims are experimental, and its safety and benefit in people are not established.',
  'igf-1-lr3': 'IGF-1 LR3 is a longer-lasting laboratory version of an insulin-like growth signal. It is discussed in muscle research, but it is not an approved shortcut for size, strength, or recovery.',
  'cjc-1295': 'CJC-1295 is an experimental peptide designed to imitate a natural signal that triggers growth-hormone release. Human data are limited, so anti-aging, fat-loss, and muscle-building promises run ahead of the evidence.',
  'ipamorelin': 'Ipamorelin is an experimental peptide that activates a growth-hormone release signal. It is often marketed for sleep, recovery, or body composition, but those uses are not established treatments.',
  'bpc-157': 'BPC-157 is a 15-amino-acid research peptide commonly promoted for injuries, joints, and gut problems. Most of the evidence is still preclinical, so fast-healing promises have not been proven in people.',
  'tb-500': 'TB-500 is a research product related to thymosin beta-4, a peptide involved in cell movement and repair. It is widely discussed for recovery, but claims that it rebuilds tissue or erases pain are not proven clinical outcomes.',
  'wolverine-blend': 'The Wolverine Blend combines BPC-157 and TB-500 in one product concept. The dramatic recovery claims come from marketing—not strong human trials of the blend—and no single molecular structure applies.',
  'kpv': 'KPV is a three-amino-acid fragment of a natural signaling peptide. Early research explores inflammation in the gut and skin, but it is not a proven cure for bowel, skin, or allergy problems.',
  'thymosin-alpha-1': 'Thymosin alpha-1 is an immune-signaling peptide used medically in some countries and studied in several immune conditions. It may influence immune response, but “instant immune boost” is not an accurate promise.',
  'kisspeptin-10': 'Kisspeptin-10 is a short form of a natural signal that helps control reproductive hormones. Researchers study it in fertility and hormone testing; it is not a guaranteed testosterone or libido booster.',
  'pt-141': 'PT-141, or bremelanotide, acts on melanocortin signals in the brain. A prescription form is approved for a specific sexual-desire disorder in some premenopausal women—not as a general performance enhancer.',
  'epitalon': 'Epitalon is a four-amino-acid experimental peptide promoted for sleep and longevity. Claims that it protects DNA, resets aging, or turns back time remain unproven.',
  'ghk-cu': 'GHK-Cu is a tiny copper-binding peptide used in many skin and hair products. Research explores collagen, firmer-looking skin, wound repair, and hair growth.',
  'pinealon': 'Pinealon is a three-amino-acid experimental peptide marketed for memory and healthy aging. Evidence for sharper focus or protection from brain aging is still limited.',
  'semax': 'Semax is a seven-amino-acid peptide studied for effects on brain signaling and attention. It is used in a few countries, but claims of instant focus, faster learning, or effortless productivity are not well established.',
  'selank': 'Selank is a seven-amino-acid experimental peptide related to an immune peptide called tuftsin. Early studies explore anxiety and mood, but it is not proven to erase stress on demand.',
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
