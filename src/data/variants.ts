/** Draft choices only; no dosage or price has been supplied for sale. */
export interface ProductVariant {
  id: string
  label: string
  pricePlaceholder: string
  status: 'placeholder'
}

// Add the owner-confirmed 20 slugs here. Epitalon stays only to replace the
// previously published 5 mg / 10 mg demonstration with non-numeric placeholders.
export const DOSAGE_PLACEHOLDER_SLUGS = ['epitalon'] as const
const PLACEHOLDER_SLUGS = new Set<string>(DOSAGE_PLACEHOLDER_SLUGS)
const PLACEHOLDER_VARIANTS: readonly ProductVariant[] = [
  { id: 'dosage-a', label: 'Dosage A · TBD', pricePlaceholder: '$XX.XX', status: 'placeholder' },
  { id: 'dosage-b', label: 'Dosage B · TBD', pricePlaceholder: '$YY.YY', status: 'placeholder' },
]

export const variantsFor = (slug: string): readonly ProductVariant[] => PLACEHOLDER_SLUGS.has(slug) ? PLACEHOLDER_VARIANTS : []
export const defaultVariantId = (slug: string): string | null => variantsFor(slug)[0]?.id ?? null
export const variantFor = (slug: string, id?: string | null): ProductVariant | undefined => variantsFor(slug).find((variant) => variant.id === id)
export const priceFor = (slug: string, id?: string | null): string => variantFor(slug, id)?.pricePlaceholder ?? '$XX.XX'
