/** Commercial data is illustrative until strengths, inventory, and prices are approved. */
export interface ProductVariant {
  id: string
  label: string
  pricePlaceholder: string
  illustrative: true
}

// This is an interaction example, not a claim that either strength is stocked.
const EXAMPLE_VARIANTS: Record<string, readonly ProductVariant[]> = {
  epitalon: [
    { id: 'example-5mg', label: 'Example 5 mg', pricePlaceholder: '$XX.XX', illustrative: true },
    { id: 'example-10mg', label: 'Example 10 mg', pricePlaceholder: '$YY.YY', illustrative: true },
  ],
}

export const variantsFor = (slug: string): readonly ProductVariant[] => EXAMPLE_VARIANTS[slug] ?? []
export const defaultVariantId = (slug: string): string | null => variantsFor(slug)[0]?.id ?? null
export const variantFor = (slug: string, id?: string | null): ProductVariant | undefined => variantsFor(slug).find((variant) => variant.id === id)
export const priceFor = (slug: string, id?: string | null): string => variantFor(slug, id)?.pricePlaceholder ?? '$XX.XX'
