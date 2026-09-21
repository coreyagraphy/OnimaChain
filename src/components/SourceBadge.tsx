import { pubmedUrl } from '~/data/studies'

interface Props {
  pmid: string | null
  verified: boolean
  /** Show the PubMed link. */
  link?: boolean
}

/** A citation badge. Unverified records never render as a citation. */
export function SourceBadge({ pmid, verified, link = true }: Props) {
  if (!pmid || !verified) return <span className="chip chip-amber">Source relationship unresolved</span>
  const inner = <span className="mono">PMID {pmid}</span>
  if (!link) return <span className="chip chip-cyan">{inner}</span>
  return (
    <a href={pubmedUrl(pmid)} target="_blank" rel="noreferrer noopener" className="chip chip-cyan hover:bg-cyan/10">
      {inner}
      <span aria-hidden>↗</span>
    </a>
  )
}

import type { Compound } from '~/data/compounds'

/**
 * Structure provenance. The renderer always draws a procedural, sequence-derived chain; it never loads
 * a deposited structure. So a compound with PDB entries is labelled honestly: the drawing is sequence-derived,
 * and resolved structures exist elsewhere. Never "predicted model" — we have none.
 */
export function provenanceText(c: Pick<Compound, 'sequence' | 'structureSource' | 'pdbIds'>): { primary: string; secondary: string | null; kind: 'pdb' | 'sequence' | 'conceptual' } {
  const pdb = c.pdbIds.length ? `Experimentally resolved (PDB ${c.pdbIds.join(', ')}) — deposited, not rendered here` : null
  if (!c.sequence) return { primary: 'Artist’s illustration', secondary: pdb ?? 'Sequence still being confirmed', kind: 'conceptual' }
  return { primary: 'Drawn from the sequence (not a measured structure)', secondary: pdb, kind: c.pdbIds.length ? 'pdb' : 'sequence' }
}

export function ProvenanceLabel({ compound, className = '' }: { compound: Pick<Compound, 'sequence' | 'structureSource' | 'pdbIds'>; className?: string }) {
  const p = provenanceText(compound)
  return (
    <span className={`mono text-[11px] text-bone/65 ${className}`}>
      {p.primary}
      {p.secondary && <span className="text-bone/45"> · {p.secondary}</span>}
    </span>
  )
}
