import { COMPOUND_BY_SLUG, type Compound } from './compounds'

/** Curated, typed links. A shared browsing subject or keyword is not an evidence relationship. */
export interface PortalRelationship {
  from: string
  to: string
  label: string
  detail: string
  source: string
  kind: 'component' | 'receptor'
}

// The previous three edges all cited one retatrutide structural paper as if it
// validated every paired comparison. Hold the edges until each exact relation,
// molecular form and source scope has been reviewed. Topic navigation remains.
export const PORTAL_RELATIONSHIPS: PortalRelationship[] = []

export function relationshipsFor(slug: string, pool: Compound[] = Object.values(COMPOUND_BY_SLUG)) {
  const allowed = new Set(pool.map((compound) => compound.slug))
  return PORTAL_RELATIONSHIPS.flatMap((relationship) => {
    const otherSlug = relationship.from === slug ? relationship.to : relationship.to === slug ? relationship.from : null
    const compound = otherSlug && allowed.has(otherSlug) ? COMPOUND_BY_SLUG[otherSlug] : null
    return compound ? [{ compound, relationship }] : []
  })
}
