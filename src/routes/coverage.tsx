import { createFileRoute } from '@tanstack/react-router'
import { PLATFORMS, SCIENTIFIC_SOURCES } from '~/data/signal'
import { COMPOUNDS } from '~/data/compounds'
import { STUDIES, studiesForCompound } from '~/data/studies'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/coverage')({
  head: () => ({ meta: [{ title: `Coverage — ${BRAND}` }] }),
  component: () => (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Coverage</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What we can see. What we can’t.</h1>
      <p className="lede mt-5 max-w-3xl">What we have connected so far. “Checked” means a study exists, not that every statement about it was reviewed.</p>
      <div className="mt-8 panel-flat p-6 max-w-3xl"><p className="label label-cyan">What we list today</p><p className="text-sm mt-3">{COMPOUNDS.length} molecules · {STUDIES.length} PubMed studies · {COMPOUNDS.filter(c => studiesForCompound(c.slug).length === 0).length} molecules with no checked study yet.</p><p className="text-sm muted mt-2">These counts are not an approval of any claim.</p></div>
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <section><h2 className="display-md text-2xl mb-4">Social and public sites</h2><table className="data panel-flat"><thead><tr><th>Site</th><th>How it would connect</th><th>Status</th></tr></thead><tbody>{PLATFORMS.map((p) => <tr key={p.id}><td>{p.name}</td><td className="text-[12px] muted">{p.adapter}</td><td><span className="chip chip-hollow">{p.state}</span></td></tr>)}</tbody></table></section>
        <section><h2 className="display-md text-2xl mb-4">Science and regulator sources</h2><table className="data panel-flat"><thead><tr><th>Source</th><th>Status</th></tr></thead><tbody>{SCIENTIFIC_SOURCES.map((s) => <tr key={s.id}><td>{s.name}</td><td><span className={`chip ${s.enabled ? 'chip-cyan' : 'chip-hollow'}`}>{s.state}</span></td></tr>)}</tbody></table></section>
      </div>
    </div>
  ),
})
