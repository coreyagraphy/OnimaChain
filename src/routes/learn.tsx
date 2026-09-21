import { createFileRoute, Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { LESSONS } from '~/data/lessons'
import { BRAND } from '~/brand'
import { PortalTitle } from '~/components/PortalTitle'

export const Route = createFileRoute('/learn')({
  head: () => ({ meta: [{ title: `Portal of Tides — ${BRAND}` }, { name: 'description', content: 'Short lessons that teach you how to tell a real study from a good story.' }] }),
  component: PortalOfTides,
})

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
            <p className="mono text-[11px] text-right text-bone/45 hidden md:block">10 lessons · 1 ready to try now<br/>more open as we finish checking them</p>
          </div>
        </div>
        <div className="portal-waterline" aria-hidden />
      </header>

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
