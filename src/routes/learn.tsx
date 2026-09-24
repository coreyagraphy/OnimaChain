import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { LESSONS } from '~/data/lessons'
import { BRAND } from '~/brand'
import { ExperienceLaunchpad } from '~/components/ExperienceLaunchpad'
import { LearningActivities } from '~/components/LearningActivities'
import '../styles/workbench.css'

export const Route = createFileRoute('/learn')({
  validateSearch:(s:Record<string,unknown>):{activity?:string;case?:number}=>({activity:typeof s.activity==='string'?s.activity:undefined,case:Number.isInteger(Number(s.case))?Number(s.case):undefined}),
  head: () => ({ meta: [{ title: `Play & Learn — ${BRAND}` }, { name: 'description', content: 'Turn a molecule, spot an exaggerated headline, and explore the invisible. Six hands-on activities in plain English.' }] }),
  component: LearningLab,
})
function LearningLab() {
  const search=Route.useSearch()
  const pathname=useRouterState({select:state=>state.location.pathname})
  if(pathname!=='/learn')return <Outlet/>
  if(search.activity)return <LearningActivities station={search.activity} initialCase={search.case}/>
  return <div className="learning-playground">
    <header className="playground-intro wrap"><span className="electric-eyebrow">PEPTIDE SCIENCE / HANDS ON</span><h1>Follow your<br/><em>curiosity.</em><span className="intro-asterisk" aria-hidden>✳</span></h1><p>Turn it. Zoom in. Try an answer.<br/>Start anywhere. Learn something you can use.</p><a href="#experience-title" className="playground-scroll">Choose an activity ↓</a></header>
    <section className="learning-game-entry wrap"><p className="electric-eyebrow">NEW / A PLAYABLE 3D CHAMBER</p><h2>Catch. Guide. Connect.</h2><p>Build a fictional chain one piece at a time. Moving shutters, glowing targets, and room to try again.</p><Link to="/learn/chainforge" className="btn btn-primary">Play Chainforge →</Link><p>Prefer to observe? <Link to="/observatory">Open the molecular workbench →</Link></p></section>
    <ExperienceLaunchpad/>
    <section className="wrap open-lessons"><p className="electric-eyebrow">GO A LITTLE DEEPER</p><h2>Follow a story back to its source.</h2>{LESSONS.filter(l=>l.status==='interactive').map(l=><Link key={l.slug} to="/learn/$slug" params={{slug:l.slug}} className="open-lesson"><div><h3>{l.title}</h3><p>{l.summary}</p></div><span>Open lesson ↗</span></Link>)}
    <details><summary>Coming later: {LESSONS.filter(l=>l.status!=='interactive').length} more lessons</summary><ul>{LESSONS.filter(l=>l.status!=='interactive').map(l=><li key={l.slug}>{l.title} — preview only</li>)}</ul></details></section>
  </div>
}
