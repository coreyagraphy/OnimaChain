import type { Species } from '~/data/studies'

const LABEL: Record<Exclude<Species, null>, string> = { rat: 'Rat', mouse: 'Mouse', human: 'Human', 'other-animal': 'Other animal' }

/** Species is displayed only when stated in the record; otherwise an explicit "not stated in title". */
export function SpeciesBadge({ species, source = 'title' }: { species: Species; source?: 'title' | 'abstract' }) {
  if (!species) return <span className="chip chip-hollow" title="The study title does not say what it was tested on">Tested on: not in title</span>
  return (
    <span className="chip" title={`Species stated in the record ${source}`}>
      <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-cyan" />
      {LABEL[species]}
    </span>
  )
}
