import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { BRAND } from '~/brand'
import { BEGINNER_PATH, LESSONS, LESSON_CATEGORIES, type Lesson, type LessonCategory } from '~/data/lessons'
import { LessonVisual } from '~/components/LessonVisual'

export const Route = createFileRoute('/learn')({
  head: () => ({ meta: [{ title: `Research Literacy Lab — ${BRAND}` }, { name: 'description', content: 'Ten short lessons to help you trace claims, read studies, and understand where evidence ends.' }] }),
  component: LearnRoute,
})

function LearnRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return pathname === '/learn' || pathname === '/learn/' ? <LearnLab /> : <Outlet />
}

const stages = [
  { tag: '01 / ORIGINAL STUDY', line: 'A result appears in a rat tendon study.', context: 'Species and experimental conditions are named.' },
  { tag: '02 / SUMMARY', line: 'A peptide shows a promising tendon signal.', context: 'The rat model is now easier to miss.' },
  { tag: '03 / HEADLINE', line: 'A peptide may help tendon repair.', context: 'The cautious word remains; the species is gone.' },
  { tag: '04 / SOCIAL POST', line: 'This peptide helps tendons heal.', context: '“May” has become certainty.' },
  { tag: '05 / VIRAL CLAIM', line: 'The healing peptide works for everyone.', context: 'A broad human claim replaces a narrow finding.' },
]

function LearnLab() {
  const [stage, setStage] = useState(0)
  const [filter, setFilter] = useState<LessonCategory | 'all'>('all')
  const groups = LESSON_CATEGORIES.filter((category) => filter === 'all' || filter === category.id)

  return <main className="learn-lab pt-[72px]">
    <header className="learn-hero wrap">
      <div className="learn-hero-copy">
        <p className="learn-overline">ONIMACHAIN LEARNING LAB <span> / 10 FIELD NOTES</span></p>
        <h1>Learn to spot what the <em>research really says.</em></h1>
        <p className="learn-lede">Peptide claims move fast. A study becomes a headline, a headline becomes a post, and the details can disappear along the way. These interactive lessons show you how to tell the difference.</p>
        <div className="learn-actions"><Link to="/learn/$slug" params={{ slug: 'how-internet-claims-mutate' }} className="learn-primary">Start with the viral claim lesson <span aria-hidden>↗</span></Link><a href="#lessons" className="learn-secondary">Explore all lessons ↓</a></div>
        <p className="learn-hero-note">No medical advice. No certainty theater. Just better questions.</p>
      </div>
      <div className="learn-instrument" aria-label="Illustrative example of how a study finding can change as it spreads">
        <div className="learn-instrument-top"><span>CLAIM TRANSMISSION / CONCEPTUAL EXAMPLE</span><span>0{stage + 1} : 05</span></div>
        <div className="learn-transmission" aria-hidden>{stages.map((item, i) => <span key={item.tag} className={i === stage ? 'active' : ''}><i/></span>)}</div>
        <div className="learn-instrument-body" aria-live="polite"><span>{stages[stage].tag}</span><strong>{stages[stage].line}</strong><p>{stages[stage].context}</p></div>
        <div className="learn-instrument-controls"><label htmlFor="claim-stage">Move through the example</label><input id="claim-stage" type="range" min="0" max="4" value={stage} onChange={(event) => setStage(Number(event.target.value))} /><span>STUDY <b>→</b> CLAIM</span></div>
        <p className="learn-instrument-foot">Illustrative wording, not a quotation. <Link to="/learn/$slug" params={{ slug: 'how-internet-claims-mutate' }}>See the sourced, interactive lesson ↗</Link></p>
      </div>
    </header>

    <section className="learn-why wrap" aria-labelledby="learn-why-title"><p className="learn-overline">WHY THIS LAB EXISTS</p><h2 id="learn-why-title">Why come here?</h2><div className="learn-why-points"><p><b>01 / READ THE STUDY</b><span>Understand what researchers actually measured.</span></p><p><b>02 / FOLLOW THE CLAIM</b><span>See how wording changes as research moves online.</span></p><p><b>03 / KNOW THE LIMITS</b><span>Learn where animal, cell, and early-stage research stops.</span></p></div></section>

    <section id="lessons" className="learn-index wrap" aria-labelledby="lessons-title"><div className="learn-index-heading"><div><p className="learn-overline">THE EXHIBIT INDEX / 10 LESSONS</p><h2 id="lessons-title">Choose a thread to pull.</h2></div><p>One lesson is live. The others have useful previews while the full interactions are being built.</p></div>
      <div className="learn-filters" role="group" aria-label="Filter lessons by topic"><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All topics <span>10</span></button>{LESSON_CATEGORIES.map((category) => <button key={category.id} type="button" aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category.label} <span>{LESSONS.filter((l) => l.category === category.id).length}</span></button>)}</div>
      {groups.map((category) => { const entries = LESSONS.filter((l) => l.category === category.id); return <div className={`learn-group learn-group--${category.id}`} key={category.id}><div className="learn-group-intro"><div><p className="learn-overline">{category.label.toUpperCase()} / {String(entries.length).padStart(2, '0')}</p><h3>{category.description}</h3></div><span className="learn-group-rule" /></div><ol className="learn-card-grid">{entries.map((lesson) => <li key={lesson.slug}><LessonCard lesson={lesson} number={LESSONS.indexOf(lesson) + 1} /></li>)}</ol></div> })}
    </section>

    <section className="learn-path wrap" aria-labelledby="learn-path-title"><div><p className="learn-overline">NEW TO THIS? / SUGGESTED ORDER</p><h2 id="learn-path-title">Take the beginner path.</h2><p>Start with how a claim changes. Then learn what each kind of evidence can—and cannot—tell you.</p></div><details><summary>Show the 10-lesson route <span aria-hidden>＋</span></summary><ol>{BEGINNER_PATH.map((slug, index) => { const l = LESSONS.find((item) => item.slug === slug)!; return <li key={slug}><span>{String(index + 1).padStart(2, '0')}</span><Link to="/learn/$slug" params={{ slug }}>{l.title}</Link><small>{statusText(l.status)}</small></li> })}</ol></details></section>
    <section className="learn-philosophy wrap"><p className="learn-overline">THE ONIMACHAIN APPROACH</p><h2>The point isn't to tell you what to believe.</h2><p>The point is to help you see how the evidence was built, where the claim came from, and what is still unknown.</p></section>
    <footer className="learn-end wrap"><p className="learn-overline">PEPTIDE RESEARCH IS COMPLICATED. UNDERSTANDING IT DOES NOT HAVE TO BE.</p><h2>Ready to use what <span>you learned?</span></h2><div className="learn-end-links"><Link to="/explore">Explore Compounds ↗</Link><Link to="/watchlist">Open the Watchlist ↗</Link><Link to="/claims">Trace a Claim ↗</Link></div></footer>
  </main>
}

function statusText(status: Lesson['status']) { return status === 'live' ? 'LIVE' : status === 'next-up' ? 'NEXT UP' : 'FORMING' }

function LessonCard({ lesson, number }: { lesson: Lesson; number: number }) {
  return <Link to="/learn/$slug" params={{ slug: lesson.slug }} className={`learn-card learn-card--${lesson.visual}`} style={{ '--lesson-accent': lesson.accent } as CSSProperties}>
    <div className="learn-card-top"><span>{String(number).padStart(2, '0')} / 10</span><span className={`learn-status learn-status--${lesson.status}`}>{statusText(lesson.status)}</span></div>
    <LessonVisual kind={lesson.visual} />
    <div className="learn-card-copy"><span className="learn-card-category">{LESSON_CATEGORIES.find((c) => c.id === lesson.category)?.label}</span><h4>{lesson.title}</h4><p>{lesson.summary}</p><span className="learn-card-action">{lesson.status === 'live' ? 'Enter interactive lesson' : 'Open lesson preview'} <b aria-hidden>↗</b></span></div>
  </Link>
}
