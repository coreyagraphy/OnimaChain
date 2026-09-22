import { COMBINATIONS, RESEARCH_COMPOUNDS, RESEARCH_ENTITY_BY_ID, TARGETS, type ResearchEntity } from './research-entities'

/** Relationships are projections of the canonical registry, never a second catalog. */
export interface PortalRelationship {
  from: string
  to: string
  label: string
  detail: string
  source: string
  kind: 'component' | 'receptor'
}

const targetLabels = Object.fromEntries(TARGETS.map((target) => [target.id, target.label]))

export const PORTAL_RELATIONSHIPS: PortalRelationship[] = [
  ...COMBINATIONS.flatMap((combination) => combination.componentIds.map((componentId) => ({
    from: combination.id,
    to: componentId,
    kind: 'component' as const,
    label: 'Component',
    detail: `${RESEARCH_ENTITY_BY_ID[componentId]?.name ?? componentId} is one separate component of ${combination.name}; the combination is not a single molecule.`,
    source: combination.source ?? `/combinations#${combination.id}`,
  }))),
  ...RESEARCH_COMPOUNDS.flatMap((first, index) => RESEARCH_COMPOUNDS.slice(index + 1).flatMap((second) => {
    const shared = first.targets.filter((target) => second.targets.includes(target))
    if (!shared.length) return []
    const names = shared.map((target) => targetLabels[target]).join(' + ')
    return [{
      from: first.id,
      to: second.id,
      kind: 'receptor' as const,
      label: names,
      detail: `${first.name} and ${second.name} are both mapped to ${names} in the OnimaChain target registry. Shared target mapping does not establish equivalent effects or safety.`,
      source: '/targets',
    }]
  })),
]

export function relationshipsFor(id: string, pool: ResearchEntity[] = Object.values(RESEARCH_ENTITY_BY_ID)) {
  const allowed = new Set(pool.map((entity) => entity.id))
  return PORTAL_RELATIONSHIPS.flatMap((relationship) => {
    const otherId = relationship.from === id ? relationship.to : relationship.to === id ? relationship.from : null
    const entity = otherId && allowed.has(otherId) ? RESEARCH_ENTITY_BY_ID[otherId] : null
    return entity ? [{ entity, relationship }] : []
  })
}
