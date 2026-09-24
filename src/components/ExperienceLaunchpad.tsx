import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'

export const ACTIVITIES = [
  { id: 'molecule', title: 'Meet a molecule', verb: 'Turn it. See the links.', detail: 'See how tiny building blocks become a peptide.', color: '#73edff', shape: 'chain' },
  { id: 'evidence', title: 'Can you spot the leap?', verb: 'One study. Three stories.', detail: 'Pick the headline that sticks to what happened.', color: '#ff762e', shape: 'portal' },
  { id: 'scale', title: 'How small is small?', verb: 'Zoom into the invisible.', detail: 'Put a molecule, a cell and a person in size order.', color: '#edff59', shape: 'scale' },
  { id: 'report', title: 'What does 96% mean?', verb: 'Look past the big number.', detail: 'Open a lab report and find what it leaves out.', color: '#ffbb83', shape: 'sheets' },
  { id: 'constellation', title: 'Three stories. One study?', verb: 'Follow the connections.', detail: 'Find out when different articles use the same data.', color: '#b9a5ff', shape: 'network' },
  { id: 'history', title: 'Rewind the discoveries', verb: 'Move through the years.', detail: 'Visit four moments that changed peptide science.', color: '#edff59', shape: 'rings' },
] as const

export function ActivitySculpture({ shape }: { shape: string }) {
  return <div className={`activity-sculpture sculpture-${shape}`} aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--n': i } as CSSProperties}/>)}</div>
}

export function ExperienceLaunchpad({ compact = false }: { compact?: boolean }) {
  return <section className={`experience-launchpad wrap ${compact ? 'is-compact' : ''}`} aria-labelledby="experience-title">
    <div className="experience-heading"><div><p className="electric-eyebrow">THE OBSERVATORY / OPEN TO CURIOSITY</p><h2 id="experience-title">Less reading.<br/><em>More discovering.</em></h2></div><p>No science degree needed. Pick something that makes you curious. Every activity shows you what to do.</p></div>
    <div className="activity-grid">{ACTIVITIES.map((item, i) => <Link key={item.id} to="/observatory" search={{ station: item.id }} className={`activity-door door-${item.shape}`} style={{ '--activity': item.color } as CSSProperties}>
      <span className="activity-number">0{i + 1}<span>EXPLORE ↗</span></span><ActivitySculpture shape={item.shape}/>
      <div className="activity-copy"><span>{item.verb}</span><h3>{item.title}</h3><p>{item.detail}</p><span className="activity-enter">Enter station <b aria-hidden="true">↗</b></span></div>
    </Link>)}</div>
    <p className="experience-note">Conceptual visuals, real questions. No account needed. Your challenge progress stays in this browser.</p>
  </section>
}
