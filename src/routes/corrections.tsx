import { createFileRoute } from '@tanstack/react-router'
import { EditorialIntake } from '~/components/EditorialIntake'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/corrections')({
  head: () => ({ meta: [{ title: `Corrections — ${BRAND}` }, { name: 'description', content: 'Dated public corrections and a release-gated editorial intake for source or factual errors.' }] }),
  component: Corrections,
})

function Corrections() {
  return <div className="pt-28 wrap"><p className="label label-amber">Corrections</p><h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">A change should leave a trail.</h1><p className="lede mt-5 max-w-2xl">After publication, substantive corrections will identify the affected page, date, previous wording, revised wording, reason and source. Changes in this review branch are not yet public corrections.</p><div className="mt-10 panel-flat p-6 max-w-3xl"><strong>Public correction ledger</strong><p className="text-sm muted mt-2">No post-release corrections are recorded in this build. This does not mean every page has been scientifically reviewed.</p></div><div className="mt-10"><EditorialIntake /></div></div>
}
