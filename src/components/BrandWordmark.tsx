import { brand } from '~/brand'

/** Lossless crops of the supplied OnimaChain artwork, kept as public assets. */
export function BrandWordmark({ decorative = false }: { decorative?: boolean }) {
  return <img className="brand-wordmark" src={brand.logoWordmark} width={1210} height={140} alt={decorative ? '' : brand.name} decoding="async" />
}

export function BrandLogo({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return <img className={`brand-logo-full ${className}`} src={brand.logoFull} width={1210} height={800} alt={brand.name} loading={priority ? 'eager' : 'lazy'} decoding="async" />
}
