import { createFileRoute } from '@tanstack/react-router'
import { PLATFORMS, SCIENTIFIC_SOURCES } from '~/data/signal'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/coverage')({
  head: () => ({ meta: [{ title: `Coverage — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Coverage</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What we can see. What we can’t.</h1>
      <p className="lede mt-5 max-w-2xl">We never say &ldquo;the internet says&rdquo;. This page shows exactly which sources are connected, so you know what every number on this site is based on.</p>
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <section><h2 className="display-md text-2xl mb-4">Social and public sites</h2><table className="data panel-flat"><thead><tr><th>Site</th><th>How it would connect</th><th>Status</th></tr></thead><tbody>{PLATFORMS.map((p) => <tr key={p.id}><td>{p.name}</td><td className="text-[12px] muted">{p.adapter}</td><td><span className="chip chip-hollow">{p.state}</span></td></tr>)}</tbody></table></section>
        <section><h2 className="display-md text-2xl mb-4">Science and regulator sources</h2><table className="data panel-flat"><thead><tr><th>Source</th><th>Status</th></tr></thead><tbody>{SCIENTIFIC_SOURCES.map((s) => <tr key={s.id}><td>{s.name}</td><td><span className={`chip ${s.enabled ? 'chip-cyan' : 'chip-hollow'}`}>{s.state}</span></td></tr>)}</tbody></table></section>
      </div>
    </div>
  ),
})
