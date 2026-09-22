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
import { DEPOSITED_CONFORMERS } from '~/data/conformers'
import { structurePresentation } from '~/data/structure-presentation'

/**
 * Structure provenance mirrors what the renderer receives: bundled deposited coordinates when available,
 * otherwise a sequence-derived conformer or an explicitly conceptual placeholder.
 */
export function provenanceText(c: Compound): { primary: string; secondary: string | null; kind: 'pdb' | 'sequence' | 'conceptual' } {
  const presentation = structurePresentation(c)
  if (presentation.kind === 'blend' || presentation.kind === 'mixture' || presentation.kind === 'non-peptide' || presentation.kind === 'unresolved') return {
    primary: presentation.label, secondary: presentation.detail, kind: 'conceptual',
  }
  const deposited = DEPOSITED_CONFORMERS[c.slug]
  if (deposited?.source.startsWith('RCSB')) return { primary: 'Rendered from deposited C-alpha coordinates', secondary: `${deposited.source}; any unresolved tail is modeled`, kind: 'pdb' }
  if (deposited?.source.startsWith('AlphaFold')) return { primary: 'Rendered from an AlphaFold model', secondary: deposited.source, kind: 'sequence' }
  const pdb = c.pdbIds.length ? `Experimentally resolved (PDB ${c.pdbIds.join(', ')}) — deposited, not rendered here` : null
  return { primary: 'Sequence-derived illustration (not a measured structure)', secondary: pdb, kind: 'sequence' }
}

export function ProvenanceLabel({ compound, className = '' }: { compound: Compound; className?: string }) {
  const p = provenanceText(compound)
  return (
    <span className={`mono text-[11px] text-bone/65 ${className}`}>
      {p.primary}
      {p.secondary && <span className="text-bone/45"> · {p.secondary}</span>}
    </span>
  )
}
