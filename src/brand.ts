/**
 * Public identity lives here so a page, email, or integration never has to
 * invent its own version of the OnimaChain name or promise.
 */
export const brand = {
  name: 'OnimaChain',
  displayName: 'ONIMACHAIN',
  primaryTagline: 'From amino chains to molecular insight.',
  secondaryTagline: 'See the molecule. Follow the signal. Trace the evidence.',
  description: 'Explore molecule identities, conceptual and sourced structures, attached citation records, and what remains under review.',
  meaning: 'Onima is Amino read backward. Chain connects the molecular chains, biological signals, and evidence trails we make easier to follow.',
  socialImage: '/posters/hero.jpg',
  logoFull: '/brand/onimachain-clean.webp',
  logoWordmark: '/brand/onimachain-clean-wordmark.webp',
  icon: '/favicon-clean.png',
} as const

/** Backward-compatible alias for existing page titles and sentences. */
export const BRAND = brand.name
