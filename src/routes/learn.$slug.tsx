import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { LESSONS } from '~/data/lessons'
import { CLAIM_BY_ID } from '~/data/claims'
import { MutationLadder } from '~/components/MutationLadder'

export const Route = createFileRoute('/learn/$slug')({
  loader: ({ params }) => {
    const l = LESSONS.find((x) => x.slug === params.slug)
    if (!l) throw notFound()
    return { slug: l.slug }
  },
  component: Lesson,
})

function Lesson() {
  const { slug } = Route.useLoaderData()
  const l = LESSONS.find((x) => x.slug === slug)!
  return (
    <div className="portal-page pt-28 wrap">
      <Link to="/learn" className="label portal-label hover:!text-bone">← Portal of Tides</Link>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-4">{l.title}</h1>
      <p className="lede mt-4 max-w-2xl">{l.summary}</p>
      {l.status === 'interactive' ? (
        <div className="mt-10 grid gap-8">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="panel-flat p-5"><p className="label label-cyan">1 · Scrub</p><p className="mt-2 muted">Drag the slider. The source finding is copied verbatim from a verified abstract. Every later step is illustrative wording — labelled as such.</p></div>
            <div className="panel-flat p-5"><p className="label label-amber">2 · Watch what drops</p><p className="mt-2 muted">Struck words are dropped from the previous step. Species, model and uncertainty tend to go first.</p></div>
            <div className="panel-flat p-5"><p className="label label-violet">3 · Watch what appears</p><p className="mt-2 muted">Violet words were added. Outcomes, speed and scope tend to arrive last — and were never measured.</p></div>
          </div>
          <MutationLadder claim={CLAIM_BY_ID['CLAIM-BPC157-TENDON-REPAIR']} autoplay />
          <MutationLadder claim={CLAIM_BY_ID['CLAIM-TB4-CELL-MIGRATION']} />
          <p className="text-sm muted max-w-2xl">This is called claim mutation, not misinformation. Some steps are faithful paraphrases. The point is to see which transformation happened, and to link each one to its source text.</p>
        </div>
      ) : (
        <div className="mt-10 panel-flat p-8"><p className="display-md text-xl">In production</p></div>
      )}
    </div>
  )
}
