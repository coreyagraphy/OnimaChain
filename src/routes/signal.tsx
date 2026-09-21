import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import { CORPUS, CONSTELLATION_LEGEND, EMPTY_PLATFORM, HUMAN_SIGNAL_LINE, PLATFORMS, SIGNAL_FILTERS } from '~/data/signal'
import { CorpusHeader } from '~/components/CorpusHeader'
import { SignalFingerprint } from '~/components/SignalFingerprint'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed, useMounted } from '~/motion/useReducedMotion'

const Constellation = lazy(() => import('~/scenes/signal/Constellation').then((m) => ({ default: m.Constellation })))

export const Route = createFileRoute('/signal')({
  head: () => ({ meta: [{ title: 'Signal Map — Cyravon' }] }),
  component: SignalMap,
})

function SignalMap() {
  const allowed = useCanvasAllowed()
  const mounted = useMounted()
  const [view, setView] = useState<'constellation' | 'network' | 'timeline' | 'heatmap'>('constellation')
  return (
    <div className="pt-28">
      <div className="wrap">
        <p className="label label-violet">Signal map</p>
        <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">What people report, as a field.</h1>
        <p className="lede mt-5 max-w-2xl">{HUMAN_SIGNAL_LINE}</p>
        <div className="mt-6 panel p-4"><CorpusHeader /><p className="mt-2 text-[12px] muted">Known missing coverage: every platform. {EMPTY_PLATFORM}.</p></div>
      </div>
      <div className="wrap mt-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="panel-flat p-4 grid gap-3 content-start" aria-label="Filters">
          {SIGNAL_FILTERS.map((f) => (
            <label key={f.id} className="grid gap-1"><span className="label">{f.label}</span>
              <select disabled aria-disabled className="w-full"><option>{'options' in f ? f.options.join(' / ') : 'No corpus to filter'}</option></select>
            </label>
          ))}
          <p className="text-[11px] faint">Filters are inert until a source adapter is enabled.</p>
        </aside>
        <div>
          <div className="flex flex-wrap gap-1 mb-3" role="group" aria-label="Visual">
            {(['constellation', 'network', 'timeline', 'heatmap'] as const).map((v) => <button key={v} className="btn btn-sm capitalize" aria-pressed={view === v} onClick={() => setView(v)}>{v}</button>)}
          </div>
          <div className="relative panel-flat overflow-hidden h-[520px]">
            {view === 'constellation' && mounted && allowed ? (
              <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={18}>
                <Suspense fallback={null}><Constellation /></Suspense>
              </Lod0Canvas>
            ) : (
              <svg className="absolute inset-0 w-full h-full" aria-hidden><defs><radialGradient id="sg" cx="50%" cy="50%" r="55%"><stop offset="0%" stopColor="#8A63FF" stopOpacity="0.12" /><stop offset="100%" stopColor="#8A63FF" stopOpacity="0" /></radialGradient></defs><rect width="100%" height="100%" fill="url(#sg)" /></svg>
            )}
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center px-6">
                <p className="display-md text-xl md:text-2xl text-bone/85">{view === 'constellation' ? 'An empty field.' : `${view[0].toUpperCase() + view.slice(1)} view: nothing to draw.`}</p>
                <p className="mt-2 text-sm muted max-w-md">{EMPTY_PLATFORM}. Reports will appear here as points, clustered by body area, stated research goal, reported observation, compound, duration, co-interventions, platform and date — never with prominence implying truth.</p>
              </div>
            </div>
            <div className="absolute left-3 bottom-3 flex flex-wrap gap-3 mono text-[10px] text-bone/60 bg-obsidian/70 rounded-lg px-3 py-2" aria-label="Legend">
              {CONSTELLATION_LEGEND.map((l) => <span key={l.id} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${l.id === 'independent' ? 'bg-violet' : l.id === 'derivative' ? 'border border-violet' : l.id === 'documented' ? 'bg-violet ring-2 ring-violet/40' : 'bg-violet/30'}`} />{l.label}</span>)}
            </div>
            <p className="absolute right-3 top-3 mono text-[10px] text-bone/50">{CORPUS.header}</p>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            {PLATFORMS.map((p) => <div key={p.id} className="panel-flat p-4 border-dashed"><p className="label label-violet">{p.name}</p><p className="text-sm mt-1 text-bone/80">{EMPTY_PLATFORM}</p><p className="mono text-[10px] text-bone/40 mt-2">adapter: {p.adapter}</p></div>)}
          </div>
          <div className="mt-6"><SignalFingerprint title="Signal integrity — all themes" /></div>
        </div>
      </div>
    </div>
  )
}
