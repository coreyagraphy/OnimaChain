import { useMemo } from 'react'
import type { Compound } from '~/data/compounds'
import { DOMAIN_BY_ID, type DomainId } from '~/data/domains'
import { buildChain, buildPlaceholder, dominantClass, hashString, CLASS_COLORS, type ChainGeometry } from '../chain/geometry'
import { DockRig } from './dock'
import { PulseRig } from './pulse'
import { BranchRig } from './branch'
import { BloomRig } from './bloom'
import { PropagateRig } from './propagate'
import { ReknitRig } from './reknit'
import { SweepRig } from './sweep'
import { tempoFor, type RigProps } from './types'

export interface DomainRigProps {
  domain: DomainId
  /** Compound whose real sequence/mods drive the geometry. */
  compound?: Compound
  /** Raw one-letter sequence (used when no compound is given). */
  sequence?: string | null
  lod?: 0 | 1 | 2
  intensity?: number
}

const RIGS: Record<string, (p: RigProps) => React.JSX.Element> = {
  dock: DockRig,
  pulse: PulseRig,
  branch: BranchRig,
  bloom: BloomRig,
  propagate: PropagateRig,
  reknit: ReknitRig,
  sweep: SweepRig,
}

/** Derive the data-driven variation set for a compound (also used by the static card fallback). */
export function rigVariation(domain: DomainId, geometry: ChainGeometry) {
  const d = DOMAIN_BY_ID[domain]
  const cls = geometry.placeholder ? 'polar' : dominantClass(geometry.residues)
  return {
    tint: d.palette.base,
    accent: geometry.placeholder ? d.palette.accent : CLASS_COLORS[cls],
    glow: d.palette.glow,
    tempo: tempoFor(geometry.length),
    dominant: cls,
  }
}

export function geometryFor(compound?: Compound, sequence?: string | null, slug = 'anon'): ChainGeometry {
  if (compound) return buildChain(compound)
  if (sequence) return buildChain({ slug, name: slug, domain: 'repair', tags: [], sequence, mods: [], structureSource: 'computed', pdbIds: [], pmids: [], archetype: '', aliases: [] })
  return buildPlaceholder(slug)
}

/** DomainRig dispatcher. Contract: { domain, sequence | compound, lod, intensity }. */
export function DomainRig({ domain, compound, sequence, lod = 2, intensity = 1 }: DomainRigProps) {
  const geometry = useMemo(() => geometryFor(compound, sequence, compound?.slug), [compound, sequence])
  const v = useMemo(() => rigVariation(domain, geometry), [domain, geometry])
  const Rig = RIGS[DOMAIN_BY_ID[domain].rig]
  return <Rig geometry={geometry} tint={v.tint} accent={v.accent} glow={v.glow} lod={lod} intensity={intensity} tempo={v.tempo} seed={hashString(geometry.slug)} />
}
