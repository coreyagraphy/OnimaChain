import type { StudyType } from '~/data/studies'

const LABEL: Record<Exclude<StudyType, null>, string> = {
  'in-vitro': 'In vitro',
  animal: 'Animal',
  review: 'Review',
  'systematic-review': 'Systematic review',
  'observational-human': 'Observational human',
  'controlled-human': 'Controlled human',
}

/** Evidence class chip. Colour is never the only carrier: the text names the class. */
export function EvidenceChip({ type, count }: { type: StudyType; count?: number }) {
  if (!type) return <span className="chip chip-hollow">Type not assessed</span>
  const cls = type === 'in-vitro' ? 'chip-violet' : type === 'animal' ? 'chip-cyan' : type.includes('human') ? 'chip' : 'chip'
  return (
    <span className={`chip ${cls}`}>
      {LABEL[type]}
      {typeof count === 'number' && <span className="mono opacity-70">{count}</span>}
    </span>
  )
}
