import { createFileRoute, Link } from '@tanstack/react-router'
import { LESSONS } from '~/data/lessons'

export const Route = createFileRoute('/learn')({
  head: () => ({ meta: [{ title: 'Learn — Cyravon' }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Learn</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Ten interactive lessons.</h1>
      <p className="lede mt-5 max-w-2xl">Not a blog. Each lesson is a scene you can scrub.</p>
      <ol className="mt-10 grid md:grid-cols-2 gap-3">
        {LESSONS.map((l, i) => (
          <li key={l.slug}>
            {l.status === 'interactive' ? (
              <Link to="/learn/$slug" params={{ slug: l.slug }} className="panel-flat p-6 block card-tilt hover:border-cyan/40 h-full">
                <p className="mono text-[11px] text-bone/45">{String(i + 1).padStart(2, '0')} · <span className="text-cyan">interactive</span></p>
                <h2 className="display-md text-2xl mt-2">{l.title}</h2>
                <p className="text-sm muted mt-2">{l.summary}</p>
              </Link>
            ) : (
              <div className="panel-flat p-6 h-full opacity-70">
                <p className="mono text-[11px] text-bone/45">{String(i + 1).padStart(2, '0')} · in production</p>
                <h2 className="display-md text-2xl mt-2">{l.title}</h2>
                <p className="text-sm muted mt-2">{l.summary}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  ),
})
