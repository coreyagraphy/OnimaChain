import type { Catalog } from './types.ts'

// Server-only prices in integer minor units (USD cents). Intentionally empty.
// Add actual sellable SKUs only after pricing and merchant/product approval.
// Never import the browser's placeholder prices or accept totals from a request.
export const catalog: Catalog = Object.freeze({})
