import { createFileRoute, Link } from '@tanstack/react-router'
import { LESSONS } from '~/data/lessons'
import { BRAND } from '~/brand'
import { ExperienceLaunchpad } from '~/components/ExperienceLaunchpad'

export const Route = createFileRoute('/learn')({
  head: () => ({ meta: [{ title: `Play & Learn — ${BRAND}` }, { name: 'description', content: 'Turn a molecule, spot an exaggerated headline, and explore the invisible. Six hands-on activities in plain English.' }] }),
  component: LearningLab,
})
function LearningLab() {
  return <div className="learning-playground">
    <header className="playground-intro wrap"><span className="electric-eyebrow">PEPTIDE SCIENCE / HANDS ON</span><h1>Follow your<br/><em>curiosity.</em><span className="intro-asterisk" aria-hidden>✳</span></h1><p>Turn it. Zoom in. Try an answer.<br/>Start anywhere. Learn something you can use.</p><a href="#experience-title" className="playground-scroll">Choose an activity ↓</a></header>
    <ExperienceLaunchpad/>
    <section className="wrap open-lessons"><p className="electric-eyebrow">GO A LITTLE DEEPER</p><h2>Follow a story back to its source.</h2>{LESSONS.filter(l=>l.status==='interactive').map(l=><Link key={l.slug} to="/learn/$slug" params={{slug:l.slug}} className="open-lesson"><div><h3>{l.title}</h3><p>{l.summary}</p></div><span>Open lesson ↗</span></Link>)}
    <details><summary>Coming later: {LESSONS.filter(l=>l.status!=='interactive').length} more lessons</summary><ul>{LESSONS.filter(l=>l.status!=='interactive').map(l=><li key={l.slug}>{l.title} — preview only</li>)}</ul></details></section>
  </div>
}
