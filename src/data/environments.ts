/*
 * A distinct visual environment for every peptide, keyed by the real slug — never by array position.
 * These are art-direction swatches, not medical categories. Scientific atom colours never change;
 * the environment (deep background, neon light, supporting light) is what differs.
 */
export interface Environment {
  id: string
  /** Deep background hue behind the molecule. */
  deep: string
  /** Neon key light / primary accent. */
  neon: string
  /** Supporting light / secondary accent. */
  support: string
  /** Tertiary tone used for extrusions, fog and far particles. */
  tertiary: string
}

export const ENVIRONMENTS: Record<string, Environment> = {
  violet: { id: 'violet', deep: '#170A2D', neon: '#AE66FF', support: '#67E8FF', tertiary: '#4C3A8F' },
  teal: { id: 'teal', deep: '#032B2D', neon: '#3BF7D3', support: '#A9F5FF', tertiary: '#146B6E' },
  cobalt: { id: 'cobalt', deep: '#081C48', neon: '#4D8DFF', support: '#8AEFFF', tertiary: '#233F8F' },
  ember: { id: 'ember', deep: '#351306', neon: '#FF9D42', support: '#FFD59A', tertiary: '#8A4A1E' },
  crimson: { id: 'crimson', deep: '#310B20', neon: '#FF548C', support: '#DCA8FF', tertiary: '#7A2A55' },
  chartreuse: { id: 'chartreuse', deep: '#192807', neon: '#C5F657', support: '#7FE7C1', tertiary: '#4E6B1C' },
  // deliberate expansions for a 36-entry catalogue (same rules: deep / neon / support)
  ice: { id: 'ice', deep: '#0B2233', neon: '#8AEFFF', support: '#D7F6FF', tertiary: '#2C5A73' },
  rose: { id: 'rose', deep: '#2E0F1A', neon: '#FF7BB8', support: '#FFD1E8', tertiary: '#7A2F52' },
  amber: { id: 'amber', deep: '#2E1F05', neon: '#FFC64A', support: '#FFF0B8', tertiary: '#7A5A18' },
  jade: { id: 'jade', deep: '#062A1E', neon: '#5CF0A5', support: '#C7FFE2', tertiary: '#1E6B4B' },
  indigo: { id: 'indigo', deep: '#0F0F3A', neon: '#7C7CFF', support: '#C9C9FF', tertiary: '#33338F' },
  copper: { id: 'copper', deep: '#2A1508', neon: '#FF8A5B', support: '#FFD6C2', tertiary: '#7A3F22' },
}

/** Stable assignment by peptide slug. Neighbouring products in a topic get different environments on purpose. */
export const ENVIRONMENT_BY_SLUG: Record<string, keyof typeof ENVIRONMENTS> = {
  // repair
  'bpc-157': 'cobalt',
  'tb-500': 'teal',
  'wolverine-blend': 'ice',
  // skin / dermal
  'ghk-cu': 'copper',
  'pt-141': 'crimson',
  'melanotan-ii': 'ember',
  // growth-hormone axis
  'ipamorelin': 'violet',
  'kisspeptin-10': 'rose',
  'cjc-1295': 'indigo',
  'sermorelin': 'cobalt',
  'tesamorelin': 'teal',
  'hexarelin': 'amber',
  'ghrp-2': 'chartreuse',
  'ghrp-6': 'jade',
  'igf-1-lr3': 'crimson',
  'follistatin-344': 'ember',
  // cognitive
  'semax': 'chartreuse',
  'selank': 'ice',
  'cerebrolysin': 'indigo',
  'p21': 'violet',
  'pinealon': 'rose',
  // longevity
  'epitalon': 'amber',
  'mots-c': 'violet',
  'ss-31': 'ember',
  'humanin': 'jade',
  'nad-plus': 'teal',
  'glutathione': 'chartreuse',
  // immune
  'thymosin-alpha-1': 'indigo',
  'thymalin': 'ice',
  'thymogen': 'cobalt',
  'll-37': 'crimson',
  'kpv': 'jade',
  // metabolic
  'aod-9604': 'rose',
  'semaglutide': 'cobalt',
  'tirzepatide': 'copper',
  'retatrutide': 'amber',
}

const FALLBACK: Environment = ENVIRONMENTS.cobalt

/** Environment for a slug. Unknown slugs fall back to cobalt so a new entry never renders black. */
export function environmentFor(slug: string): Environment {
  const key = ENVIRONMENT_BY_SLUG[slug]
  return (key && ENVIRONMENTS[key]) || FALLBACK
}
