import type { StudyType } from '~/data/studies'

const LABEL: Record<Exclude<StudyType, null>, string> = {
  'in-vitro': 'Cells in a dish (in vitro)',
  animal: 'Animal study',
  review: 'Review paper',
  'systematic-review': 'Systematic review',
  'observational-human': 'People, observed',
  'controlled-human': 'Human trial',
}

/** Evidence class chip. Colour is never the only carrier: the text names the class. */
export function EvidenceChip({ type, count }: { type: StudyType; count?: number }) {
  if (!type) return <span className="chip chip-hollow">Study type unknown</span>
  const cls = type === 'in-vitro' ? 'chip-violet' : type === 'animal' ? 'chip-cyan' : type.includes('human') ? 'chip' : 'chip'
  return (
    <span className={`chip ${cls}`}>
      {LABEL[type]}
      {typeof count === 'number' && <span className="mono opacity-70">{count}</span>}
    </span>
  )
}
