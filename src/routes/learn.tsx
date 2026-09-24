import { createFileRoute, Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { LESSONS } from '~/data/lessons'
import { BRAND } from '~/brand'
import { PortalTitle } from '~/components/PortalTitle'

export const Route = createFileRoute('/learn')({
  head: () => ({ meta: [{ title: `Portal of Tides — ${BRAND}` }, { name: 'description', content: 'Short lessons that teach you how to tell a real study from a good story.' }] }),
  component: PortalOfTides,
})

const LAB_STATIONS = [
  { id: 'evidence', name: 'Evidence Worlds', task: 'Choose conclusions a fictional source can actually support.' },
  { id: 'scale', name: 'Scale Lab', task: 'Order physical scales from nanometres to metres.' },
  { id: 'report', name: 'Report Detective', task: 'Inspect a fictional analytical report and its limits.' },
  { id: 'constellation', name: 'Evidence Constellation', task: 'Trace three publications back to one experiment.' },
  { id: 'molecule', name: 'Molecule Explorer', task: 'Rotate a conceptual chain and inspect its parts.' },
  { id: 'history', name: 'Research Time Machine', task: 'Move through dated milestones and open their sources.' },
]

function PortalOfTides() {
  return (
    <div className="portal-page pt-[72px]">
      <header className="portal-hero">
        <div className="portal-caustics" aria-hidden><i/><i/><i/></div>
        <div className="wrap relative z-10 py-20 md:py-28">
          <p className="label portal-label">Start here</p>
          <PortalTitle className="mt-5" />
          <div className="mt-10 grid md:grid-cols-[1fr_.75fr] gap-8 items-end">
            <p className="lede max-w-2xl">Ideas change as they travel. Pick a lesson, follow it back to the source, and learn where the evidence ends and the opinion begins.</p>
            <div className="md:text-right"><p className="mono text-[11px] text-bone/45 hidden md:block">6 open stations · 1 interactive lesson<br/>9 lesson previews remain unavailable</p><Link to="/observatory" className="btn btn-primary mt-5 inline-flex">Enter the six-station Observatory →</Link></div>
          </div>
        </div>
        <div className="portal-waterline" aria-hidden />
      </header>

      <section className="wrap py-16 md:py-20" aria-labelledby="lab-stations-title">
        <p className="label portal-label">Six working stations</p>
        <h2 id="lab-stations-title" className="display text-[clamp(2rem,5vw,4.7rem)] mt-3">Choose your experiment.</h2>
        <p className="text-sm muted max-w-2xl mt-4">Each station has an interactive task and a text path; the models are illustrative. Evidence Worlds saves completed cases locally in this browser. No account or health profile is needed.</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-9">
          {LAB_STATIONS.map((station, index) => <Link key={station.id} to="/observatory" search={{ station: station.id }} className="panel-flat p-6 group hover:border-cyan/45 focus-visible:outline-2 focus-visible:outline-cyan"><span className="mono text-[11px] text-cyan">STATION {String(index + 1).padStart(2, '0')}</span><h3 className="display-md text-2xl mt-6">{station.name}</h3><p className="text-sm text-bone/65 mt-3">{station.task}</p><span className="label label-cyan inline-block mt-7">Enter station ↗</span></Link>)}
        </div>
      </section>

      <section className="wrap py-16 md:py-24" aria-label="Lessons">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="label portal-label">Pick a lesson</p><h2 className="display text-[clamp(2rem,5vw,4.7rem)] mt-3">Learn to spot the real thing.</h2></div>
          <p className="text-sm muted max-w-sm">Each lesson shows the original study next to the versions that grew out of it.</p>
        </div>
        <ol className="tide-lessons mt-12">
          {LESSONS.map((l, i) => (
            <li key={l.slug} style={{ '--tide-index': i } as CSSProperties}>
              {l.status === 'interactive' ? <Link to="/learn/$slug" params={{ slug: l.slug }} className="tide-lesson is-open"><TideCard lesson={l} index={i} status="Enter lesson" /></Link> : <div className="tide-lesson" aria-disabled="true"><TideCard lesson={l} index={i} status="Forming" /></div>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function TideCard({ lesson, index, status }: { lesson: (typeof LESSONS)[number]; index: number; status: string }) {
  return <><div className="tide-fill" aria-hidden/><div className="tide-card-copy"><div className="flex justify-between gap-4"><span className="mono text-[11px] text-bone/42">{String(index+1).padStart(2,'0')}</span><span className="label portal-label">{status}</span></div><h3 className="display-md text-2xl md:text-3xl mt-10">{lesson.title}</h3><p className="text-sm text-bone/62 mt-3 max-w-md">{lesson.summary}</p></div><span className="tide-arrow" aria-hidden>↗</span></>
}
