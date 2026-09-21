import { createFileRoute } from '@tanstack/react-router'
import { PLATFORMS, SCIENTIFIC_SOURCES } from '~/data/signal'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/coverage')({
  head: () => ({ meta: [{ title: `Coverage — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Coverage</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What {BRAND} can and cannot see.</h1>
      <p className="lede mt-5 max-w-2xl">{BRAND} never implies &ldquo;the internet says&rdquo;. This page is the denominator for every statement on the site.</p>
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <section><h2 className="display-md text-2xl mb-4">Public platforms</h2><table className="data panel-flat"><thead><tr><th>Platform</th><th>Adapter</th><th>State</th></tr></thead><tbody>{PLATFORMS.map((p) => <tr key={p.id}><td>{p.name}</td><td className="text-[12px] muted">{p.adapter}</td><td><span className="chip chip-hollow">{p.state}</span></td></tr>)}</tbody></table></section>
        <section><h2 className="display-md text-2xl mb-4">Scientific &amp; regulatory sources</h2><table className="data panel-flat"><thead><tr><th>Source</th><th>State</th></tr></thead><tbody>{SCIENTIFIC_SOURCES.map((s) => <tr key={s.id}><td>{s.name}</td><td><span className={`chip ${s.enabled ? 'chip-cyan' : 'chip-hollow'}`}>{s.state}</span></td></tr>)}</tbody></table></section>
      </div>
    </div>
  ),
})
