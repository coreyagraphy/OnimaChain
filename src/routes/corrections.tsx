import { createFileRoute } from '@tanstack/react-router'
import { EditorialIntake } from '~/components/EditorialIntake'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/corrections')({
  head: () => ({ meta: [{ title: `Corrections — ${BRAND}` }, { name: 'description', content: 'Dated public corrections and a release-gated editorial intake for source or factual errors.' }] }),
  component: Corrections,
})

function Corrections() {
  return <div className="pt-28 wrap"><p className="label label-amber">Corrections</p><h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">A change should leave a trail.</h1><p className="lede mt-5 max-w-2xl">Each correction will show the page, the date, the old and new wording, the reason and the source.</p><div className="mt-10 panel-flat p-6 max-w-3xl"><strong>Public correction ledger</strong><p className="text-sm muted mt-2">No corrections yet. That does not mean every page has been reviewed.</p></div><div className="mt-10"><EditorialIntake /></div></div>
}
