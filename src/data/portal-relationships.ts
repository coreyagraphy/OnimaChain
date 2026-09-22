import { COMPOUND_BY_SLUG, type Compound } from './compounds'

/** Curated, typed links. A shared shopping topic or keyword is not an evidence relationship. */
export interface PortalRelationship {
  from: string
  to: string
  label: string
  detail: string
  source: string
  kind: 'component' | 'receptor'
}

export const PORTAL_RELATIONSHIPS: PortalRelationship[] = [
  {
    from: 'wolverine-blend', to: 'bpc-157', kind: 'component', label: 'Blend component',
    detail: 'The Wolverine Blend lists BPC-157 as one of its two separate components; it is not one peptide.',
    source: 'catalog:compound:wolverine-blend',
  },
  {
    from: 'wolverine-blend', to: 'tb-500', kind: 'component', label: 'Blend component',
    detail: 'The Wolverine Blend lists TB-500 as one of its two separate components; it is not one peptide.',
    source: 'catalog:compound:wolverine-blend',
  },
  {
    from: 'semaglutide', to: 'tirzepatide', kind: 'receptor', label: 'GLP-1 receptor',
    detail: 'Both have GLP-1 receptor activity. Tirzepatide also acts at the GIP receptor.',
    source: 'https://pubmed.ncbi.nlm.nih.gov/39019866/',
  },
  {
    from: 'semaglutide', to: 'retatrutide', kind: 'receptor', label: 'GLP-1 receptor',
    detail: 'Both have GLP-1 receptor activity. Retatrutide also acts at the GIP and glucagon receptors.',
    source: 'https://pubmed.ncbi.nlm.nih.gov/39019866/',
  },
  {
    from: 'tirzepatide', to: 'retatrutide', kind: 'receptor', label: 'GLP-1 + GIP receptors',
    detail: 'Both have GLP-1 and GIP receptor activity. Retatrutide additionally acts at the glucagon receptor.',
    source: 'https://pubmed.ncbi.nlm.nih.gov/39019866/',
  },
]

export function relationshipsFor(slug: string, pool: Compound[] = Object.values(COMPOUND_BY_SLUG)) {
  const allowed = new Set(pool.map((compound) => compound.slug))
  return PORTAL_RELATIONSHIPS.flatMap((relationship) => {
    const otherSlug = relationship.from === slug ? relationship.to : relationship.to === slug ? relationship.from : null
    const compound = otherSlug && allowed.has(otherSlug) ? COMPOUND_BY_SLUG[otherSlug] : null
    return compound ? [{ compound, relationship }] : []
  })
}
