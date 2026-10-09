/**
 * Public identity lives here so a page, email, or integration never has to
 * invent its own version of the OnimaChain name or promise.
 */
export const brand = {
  name: 'OnimaChain',
  displayName: 'ONIMACHAIN',
  primaryTagline: 'From amino chains to molecular insight.',
  secondaryTagline: 'See the molecule. Follow the signal. Trace the evidence.',
  description: 'See what each molecule is, which studies mention it, and what nobody has checked yet.',
  meaning: 'Onima is Amino read backward. Chain is for the chains of amino acids, and the chain of evidence behind each one.',
  socialImage: '/posters/hero.jpg',
  logoFull: '/brand/onimachain-clean.webp',
  logoWordmark: '/brand/onimachain-clean-wordmark.webp',
  icon: '/favicon-clean.png',
} as const

/** Backward-compatible alias for existing page titles and sentences. */
export const BRAND = brand.name
