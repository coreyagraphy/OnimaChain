import type { CompoundTheme } from './commerce'
import { WATCHLIST } from './research-entities'

// Distinct art directions for informational watchlist profiles. These are visual
// identities, not claims about experimental molecular color or geometry.
const ART_DIRECTIONS: Record<string, { secondary: string; tertiary: string; titleStyle: CompoundTheme['titleStyle']; moleculeMaterial: CompoundTheme['moleculeMaterial']; lightRig: CompoundTheme['lightRig']; motionSignature: CompoundTheme['motionSignature']; cardTreatment: CompoundTheme['cardTreatment'] }> = {
  zenagamtide: { secondary: '#B183FF', tertiary: '#315CFF', titleStyle: 'sculptural', moleculeMaterial: 'glass', lightRig: 'halo', motionSignature: 'orbit', cardTreatment: 'halo' },
  petrelintide: { secondary: '#6C9CFF', tertiary: '#6541AB', titleStyle: 'mineral', moleculeMaterial: 'crystal', lightRig: 'sweep', motionSignature: 'breathe', cardTreatment: 'mineral' },
  enicepatide: { secondary: '#5FE3FF', tertiary: '#234C96', titleStyle: 'precise', moleculeMaterial: 'metal', lightRig: 'edge', motionSignature: 'signal', cardTreatment: 'beam' },
  vk2735: { secondary: '#F0D48C', tertiary: '#176B68', titleStyle: 'wide', moleculeMaterial: 'satin', lightRig: 'burst', motionSignature: 'flow', cardTreatment: 'split' },
  cagrilintide: { secondary: '#8A63FF', tertiary: '#954746', titleStyle: 'mineral', moleculeMaterial: 'crystal', lightRig: 'halo', motionSignature: 'breathe', cardTreatment: 'mineral' },
  mazdutide: { secondary: '#FF9A68', tertiary: '#745124', titleStyle: 'kinetic', moleculeMaterial: 'metal', lightRig: 'sweep', motionSignature: 'burst', cardTreatment: 'beam' },
  berobenatide: { secondary: '#60D4E1', tertiary: '#3F7939', titleStyle: 'wide', moleculeMaterial: 'glass', lightRig: 'edge', motionSignature: 'flow', cardTreatment: 'split' },
  pemvidutide: { secondary: '#EACE83', tertiary: '#B44868', titleStyle: 'kinetic', moleculeMaterial: 'satin', lightRig: 'burst', motionSignature: 'orbit', cardTreatment: 'halo' },
  survodutide: { secondary: '#A899E8', tertiary: '#315CFF', titleStyle: 'condensed', moleculeMaterial: 'metal', lightRig: 'sweep', motionSignature: 'signal', cardTreatment: 'beam' },
  eloralintide: { secondary: '#6BE3D9', tertiary: '#8E3A81', titleStyle: 'sculptural', moleculeMaterial: 'crystal', lightRig: 'halo', motionSignature: 'breathe', cardTreatment: 'mineral' },
}

export const WATCHLIST_THEMES: Record<string, CompoundTheme> = Object.fromEntries(WATCHLIST.map((compound) => {
  const direction = ART_DIRECTIONS[compound.id]
  const primary = compound.accent
  const theme: CompoundTheme = {
    primary, secondary: direction.secondary, tertiary: direction.tertiary,
    glow: primary, deepBackground: '#080D18', rimLight: direction.secondary,
    particleTint: primary, fogTint: direction.tertiary,
    titleStyle: direction.titleStyle, outlineStyle: `${primary}99`, extrusionStyle: direction.tertiary,
    moleculeMaterial: direction.moleculeMaterial, lightRig: direction.lightRig,
    motionSignature: direction.motionSignature, cardTreatment: direction.cardTreatment,
  }
  return [compound.id, theme]
}))
