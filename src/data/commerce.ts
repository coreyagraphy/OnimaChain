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
  'retatrutide': "Retatrutide, shown here as GLP3, targets three appetite and metabolism signals at once. In a phase 2 trial, people lost about 24% of their body weight on average over 48 weeks, and it is now in late-stage trials.",
  'tirzepatide': "Tirzepatide works on two gut-hormone signals, GLP-1 and GIP, that control appetite and blood sugar. It is approved as Zepbound and Mounjaro, with about 21% average weight loss at the top dose in its main trial.",
  'semaglutide': "Semaglutide is the GLP-1 medicine behind Wegovy and Ozempic. It turns down appetite and steadies blood sugar, with about 15% average weight loss in its main weight trial.",
  'tesamorelin': "Tesamorelin signals the body to release more of its own growth hormone. It is approved as Egrifta to reduce belly fat in adults with HIV-related fat buildup, and is studied for body composition.",
  'mots-c': "MOTS-c is a tiny peptide made by mitochondria, the energy centers inside cells. In mice it boosted exercise capacity and insulin sensitivity, which is why people call it an exercise signal.",
  'follistatin-344': "Follistatin 344 is a binding protein that blocks myostatin, the body’s natural brake on muscle growth. In animal research, raising follistatin led to noticeably more muscle.",
  'igf-1-lr3': "IGF-1 LR3 is a longer-lasting version of IGF-1, one of the body’s main growth signals. Lab research uses it for its strong effect on muscle and cell growth.",
  'cjc-1295': "CJC-1295 copies the natural signal that triggers growth-hormone release, built to last much longer. Early human trials showed growth hormone and IGF-1 stayed higher for days after a single dose.",
  'ipamorelin': "Ipamorelin uses the ghrelin signal to release growth hormone, with little effect on stress hormones in animal studies. People look it up for sleep, recovery and body composition.",
  'sermorelin': "Sermorelin is a short copy of the body’s own growth-hormone release signal. It was once FDA-approved to test and treat growth hormone deficiency in children, and is still discussed for healthy aging.",
  'hexarelin': "Hexarelin is one of the strongest growth-hormone triggers in its class. Rat studies also found it protected heart tissue.",
  'ghrp-2': "GHRP-2 uses the ghrelin signal to release growth hormone. Human studies show it raises both growth hormone and appetite.",
  'ghrp-6': "GHRP-6 releases growth hormone through the ghrelin signal and is known for a strong boost in hunger. It is discussed for building size and recovery.",
  'bpc-157': "BPC-157 is a 15-amino-acid peptide based on a protein found in stomach juice. In rat studies it sped up healing of tendons, ligaments, muscle and the gut lining, making it one of the most talked-about recovery peptides.",
  'tb-500': "TB-500 is based on thymosin beta-4, a protein that helps cells move to where repair is needed. Animal studies link it to faster wound healing and tissue recovery, and it is a staple of recovery conversations.",
  'wolverine-blend': "The Wolverine Blend pairs BPC-157 and TB-500, two of the most-discussed recovery peptides, in one product. Each half has its own animal repair research, and the pairing is a favorite in recovery circles.",
  'kpv': "KPV is a three-amino-acid piece of alpha-MSH, a natural calming signal. Mouse studies found it settled gut inflammation, and researchers are exploring it for skin as well.",
  'thymosin-alpha-1': "Thymosin alpha-1 is an immune-signaling peptide that helps train and activate immune cells. It is approved in several countries as Zadaxin and is studied across a range of immune conditions.",
  'thymalin': "Thymalin is a thymus-derived peptide mix that supports immune cells. It has been used in Russia, is studied mostly by one research group, and is discussed for immune support with age.",
  'thymogen': "Thymogen is a two-amino-acid thymus peptide used in Russia to support immune function.",
  'll-37': "LL-37 is a germ-fighting peptide your own body makes. Animal studies show it kills bacteria and speeds wound healing, and a small human trial found faster healing of leg ulcers.",
  'kisspeptin-10': "Kisspeptin-10 is a short form of the natural signal that starts the body’s sex-hormone chain. In human studies it briefly raised LH and testosterone, and it is used in fertility and hormone research.",
  'pt-141': "PT-141, or bremelanotide, works on desire signals in the brain rather than blood flow. A prescription form, Vyleesi, is approved for low sexual desire in some premenopausal women.",
  'melanotan-ii': "Melanotan II switches on the skin’s pigment signal and a brain desire signal. Small human studies showed tanning and improved erections, which is why it is known as the tanning peptide.",
  'epitalon': "Epitalon is a four-amino-acid peptide researched for sleep and longevity. Rodent studies linked it to melatonin changes and longer lifespan, making it a favorite in the anti-aging world.",
  'ghk-cu': "GHK-Cu is a tiny copper-binding peptide found in many skin and hair products. Research links it to collagen, firmer-looking skin, wound repair and hair growth.",
  'pinealon': "Pinealon is a three-amino-acid peptide aimed at brain cells. Rat and lab studies found it protected nerve cells, and it is popular with people interested in memory and healthy aging.",
  'semax': "Semax is a seven-amino-acid peptide that raises BDNF, a growth factor for brain cells. It is used in Russia for stroke recovery and attention, and draws interest for focus and memory.",
  'selank': "Selank is a seven-amino-acid peptide related to tuftsin, an immune peptide. Russian studies found calming effects in anxiety, and people look it up for stress and a clearer head.",
  'cerebrolysin': "Cerebrolysin is a mix of brain-derived peptides that support nerve cells. It is used in several countries and has been tested in stroke and brain-injury trials.",
  'p21': "P21 is a lab-designed peptide built from a brain growth factor. In mice it improved memory and the growth of new nerve cells.",
  'ss-31': "SS-31, also called elamipretide, protects the inner wall of mitochondria, the cell’s power plants. It has been tested in trials for rare mitochondrial diseases and restored muscle function in old mice.",
  'humanin': "Humanin is a protective signal made by mitochondria. Mouse studies link it to healthier metabolism, and higher levels are associated with healthy aging in people.",
  'nad-plus': "NAD+ is a molecule every cell needs to turn food into energy, and levels drop with age. Small human studies show boosters raise NAD levels, and it sits at the center of the longevity conversation.",
  'glutathione': "Glutathione is the body’s main built-in antioxidant, a three-amino-acid peptide. Small trials found brighter, more even skin tone, and it is popular for skin and recovery.",
  'aod-9604': "AOD-9604 is a fragment of growth hormone designed to target fat without growth effects. It burned fat in obese mice; human weight-loss trials did not beat placebo.",
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
  return `${displayName(compound)} is a ${length} compound often discussed around ${SHOP_TOPICS[compound.domain]}. See what it is, why people look it up, and what the research shows.`
}
