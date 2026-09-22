import { brand } from '~/brand'

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M6 16h6.5m7 0H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="5.5" cy="16" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      <circle cx="26.5" cy="16" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="m13 7 3-3 3 3M13 25l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
    </svg>
  )
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-wordmark" aria-label={brand.name}>
      <span className="brand-word brand-onima" aria-hidden>{brand.displayName.slice(0, 5)}</span>
      <span className="brand-bond" aria-hidden><i /><b /><i /></span>
      {!compact && <span className="brand-word brand-chain" aria-hidden>{brand.displayName.slice(5)}</span>}
    </span>
  )
}
