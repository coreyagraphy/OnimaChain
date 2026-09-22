import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { LESSON_BY_SLUG } from '~/data/lessons'
import { CLAIM_BY_ID } from '~/data/claims'
import { MutationLadder } from '~/components/MutationLadder'
import { LessonVisual } from '~/components/LessonVisual'

export const Route = createFileRoute('/learn/$slug')({
  loader: ({ params }) => {
    const lesson = LESSON_BY_SLUG[params.slug]
    if (!lesson) throw notFound()
    return { slug: lesson.slug }
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${LESSON_BY_SLUG[loaderData?.slug || '']?.title || 'Lesson'} — OnimaChain Learning Lab` }] }),
  component: Lesson,
})

function Lesson() {
  const { slug } = Route.useLoaderData()
  const lesson = LESSON_BY_SLUG[slug]
  return <main className="learn-lab learn-detail pt-[110px]" style={{ '--lesson-accent': lesson.accent } as CSSProperties}>
    <div className="wrap">
      <Link to="/learn" className="learn-back">← All lessons</Link>
      <header className="learn-detail-head"><div><p className="learn-overline">RESEARCH LITERACY LAB / {lesson.category.toUpperCase()} <span className="learn-detail-status">{lesson.status === 'live' ? 'LIVE' : lesson.status === 'next-up' ? 'NEXT UP' : 'FORMING'}</span></p><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><LessonVisual kind={lesson.visual} /></header>
      <section className="learn-detail-brief" aria-label="Lesson overview"><div><span>THE QUESTION</span><p>{lesson.lessonGoal}</p></div><div><span>COMMON MISREAD</span><p>{lesson.misunderstanding}</p></div><div><span>TAKE AWAY</span><p>{lesson.takeaway}</p></div></section>
      {lesson.status === 'live' ? <LiveLesson /> : <PreviewLesson key={lesson.slug} lesson={lesson} />}
      <section className="learn-sources" aria-labelledby="learn-sources-title"><p className="learn-overline">FURTHER READING</p><h2 id="learn-sources-title">Go to the source.</h2><p>These links support the lesson's research-literacy concepts. The preview examples are illustrations, not quotes or new study results.</p><ul>{lesson.sources.map((source) => <li key={source.url}><span>{source.kind}</span><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul></section>
      <div className="learn-detail-end"><Link to="/learn">← Back to the Learning Lab</Link><Link to="/claims">Trace another claim ↗</Link></div>
    </div>
  </main>
}

function LiveLesson() { return <section className="learn-live" aria-labelledby="learn-live-title"><p className="learn-overline">INTERACTIVE LESSON / SOURCED STARTING POINTS</p><h2 id="learn-live-title">Watch the wording change.</h2><p>Move through the steps. The opening finding links to a study; later phrases are clearly labeled example wording, not real quotations. Watch for the species, uncertainty, and scope disappearing.</p><div className="learn-live-steps"><span><b>01 / SCRUB</b> Move from study to post.</span><span><b>02 / SPOT LOSSES</b> Notice what context drops out.</span><span><b>03 / CHECK ADDITIONS</b> Look for certainty that was never tested.</span></div><MutationLadder claim={CLAIM_BY_ID['CLAIM-BPC157-TENDON-REPAIR']} autoplay /><MutationLadder claim={CLAIM_BY_ID['CLAIM-TB4-CELL-MIGRATION']} /><p className="learn-live-note">Some summaries are fair. The skill is seeing exactly what changed, then returning to the original source.</p></section> }

function PreviewLesson({ lesson }: { lesson: typeof LESSON_BY_SLUG[string] }) {
  const [answer, setAnswer] = useState<number | null>(null)
  const teaser = lesson.teaser
  if (!teaser) return null
  return <section className="learn-preview" aria-labelledby="learn-preview-title"><div className="learn-preview-intro"><p className="learn-overline">INTERACTIVE PREVIEW / FULL LESSON {lesson.status === 'next-up' ? 'NEXT UP' : 'FORMING'}</p><h2 id="learn-preview-title">Try one question.</h2><p>The full lesson is being built. This short preview gives you the core distinction without pretending the rest is ready.</p></div><div className="learn-question"><p className="learn-question-label">FIELD CHECK / 01</p><h3>{teaser.question}</h3><div className="learn-options">{teaser.options.map((option, i) => <button key={option} type="button" aria-pressed={answer === i} onClick={() => setAnswer(i)}><span>{i === 0 ? 'A' : 'B'}</span>{option}</button>)}</div>{answer !== null && <div className="learn-feedback" role="status"><strong>{answer === teaser.correct ? 'That keeps the evidence in view.' : 'Look a little closer.'}</strong><p>{teaser.explanation}</p></div>}<button type="button" className="learn-question-reset" onClick={() => setAnswer(null)} disabled={answer === null}>Reset question ↺</button></div></section>
}
