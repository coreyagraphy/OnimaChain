/**
 * Public identity lives here so a page, email, or integration never has to
 * invent its own version of the OnimaChain name or promise.
 */
export const brand = {
  name: 'OnimaChain',
  displayName: 'ONIMACHAIN',
  primaryTagline: 'From amino chains to molecular insight.',
  secondaryTagline: 'See the molecule. Follow the signal. Trace the evidence.',
  description: 'Explore commonly discussed peptides in plain English, see their molecular structure, and open the research behind each claim.',
  meaning: 'Onima is Amino read backward. Chain connects the molecular chains, biological signals, and evidence trails we make easier to follow.',
  cartLabel: 'OnimaChain shopping cart',
  socialImage: '/posters/hero.jpg',
  logoFull: '/brand/onimachain-clean.png',
  logoWordmark: '/brand/onimachain-clean-wordmark.png',
  icon: '/favicon-clean.png',
} as const

/** Backward-compatible alias for existing page titles and sentences. */
export const BRAND = brand.name
