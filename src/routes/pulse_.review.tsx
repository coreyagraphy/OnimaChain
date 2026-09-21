import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { BRAND } from '~/brand'
import { PulseCard } from '~/components/Pulse'
import { timeAgo } from '~/pulse/usePulse'
import type { PulseEvent, PulseSnapshot } from '~/pulse/types'

/*
 * PulseChain review queue — for the site owner. Not linked from the site and not indexed.
 * The review key (PULSE_ADMIN_TOKEN) is pasted once and kept on this device.
 */
export const Route = createFileRoute('/pulse_/review')({
  head: () => ({ meta: [{ title: `Review queue — ${BRAND}` }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ReviewPage,
})

interface Queue { generatedAt: string | null; runs: PulseSnapshot['runs']; waiting: PulseEvent[]; decided: PulseEvent[]; live: PulseEvent[] }
type Tab = 'waiting' | 'live' | 'decided'
const KEY = 'pulse-review-key'
const ACTION_LABEL: Record<string, string> = { approve: 'Approved', reject: 'Rejected', pull: 'Pulled from feed' }

function ReviewPage() {
  const [key, setKey] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState<Queue | null>(null)
  const [tab, setTab] = useState<Tab>('waiting')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { try { setKey(localStorage.getItem(KEY)) } catch { /* private mode */ } }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t) }, [toast])

  const call = useCallback(async (body?: object) => {
    if (!key) return null
    const r = await fetch('/api/pulse-review', { method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    const j = await r.json().catch(() => ({ error: 'The review service isn’t reachable. It only runs on the live site.' }))
    if (r.status === 401) { setError('That key didn’t work.'); try { localStorage.removeItem(KEY) } catch { /* */ } setKey(null); return null }
    if (!r.ok) { setError(j.error ?? 'Something went wrong.'); return null }
    setError(null)
    return j
  }, [key])

  useEffect(() => { if (key) call().then((j) => j && setQ(j as Queue)) }, [key, call])

  const act = async (id: string, action: string, note?: string) => {
    setBusy(id + action)
    const j = await call({ id, action, note })
    if (j && 'waiting' in j) { setQ(j as Queue); setToast(action === 'note' ? 'Note saved' : ACTION_LABEL[action] ?? 'Restored') }
    setBusy(null)
  }
  const runNow = async () => {
    setBusy('run')
    const j = await call({ action: 'run' })
    setToast(j?.started ? 'Checking sources now. Refresh in a few minutes.' : 'Couldn’t start a run.')
    setBusy(null)
  }

  if (!key) {
    return (
      <div className="pt-28 pb-24 wrap max-w-xl">
        <p className="label label-cyan">PulseChain</p>
        <h1 className="display-md text-[clamp(2rem,6vw,3rem)] mt-2">Review queue</h1>
        <p className="mt-3 text-bone/70">Paste your review key. It stays on this device.</p>
        <form className="mt-6 grid gap-3" onSubmit={(e) => { e.preventDefault(); const k = draft.trim(); if (!k) return; try { localStorage.setItem(KEY, k) } catch { /* */ } setKey(k) }}>
          <input className="goal-input" type="password" autoComplete="current-password" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Review key" aria-label="Review key" />
          <button className="btn btn-primary justify-center">Open the queue</button>
        </form>
        {error && <p className="mt-3 text-amber text-[14px]" role="alert">{error}</p>}
      </div>
    )
  }

  const list = q ? (tab === 'waiting' ? q.waiting : tab === 'live' ? q.live : q.decided) : []
  return (
    <div className="pt-24 pb-24">
      <header className="wrap">
        <p className="label label-cyan">PulseChain</p>
        <h1 className="display-md text-[clamp(2rem,6vw,3rem)] mt-2">Review queue</h1>
        <p className="mt-2 text-bone/70 max-w-2xl">The engine holds back anything it shouldn’t publish on its own, such as a loud claim that clashes with the FDA record or an item it couldn’t link to a peptide. Approve it, reject it, or add a note. You can also pull anything out of the live feed.</p>
        <div className="review-head mt-4 flex flex-wrap items-center gap-2">
          <button className="btn btn-sm" onClick={() => call().then((j) => j && setQ(j as Queue))}>Refresh</button>
          <button className="btn btn-sm commerce-btn" onClick={runNow} disabled={busy === 'run'}>{busy === 'run' ? 'Starting…' : 'Check sources now'}</button>
          <Link to="/pulse" className="btn btn-sm">Open the public feed</Link>
          <button className="btn btn-sm" onClick={() => { try { localStorage.removeItem(KEY) } catch { /* */ } setKey(null); setQ(null) }}>Lock</button>
        </div>
        {q?.generatedAt && <p className="mt-3 mono text-[11px] text-bone/50">Last run {timeAgo(q.generatedAt)}</p>}
        {q && <div className="review-health mt-3">{q.runs.map((r) => <span key={r.source} data-ok={r.ok ? '1' : undefined} title={r.note}>{r.source} · {r.ok ? r.items : 'off'}</span>)}</div>}
        {error && <p className="mt-3 text-amber text-[14px]" role="alert">{error}</p>}
      </header>

      <section className="wrap mt-6">
        <div className="pulse-tabs" role="tablist" aria-label="Queue">
          {([['waiting', 'Waiting', q?.waiting.length], ['live', 'In the feed', q?.live.length], ['decided', 'Decided', q?.decided.length]] as const).map(([id, label, n]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}{n ? <span>{n}</span> : null}</button>
          ))}
        </div>
        <div className="pulse-list mt-5">
          {!q && !error && [0, 1].map((i) => <div key={i} className="pulse-card pulse-skeleton" />)}
          {q && !list.length && <div className="pulse-empty"><p className="font-semibold">{tab === 'waiting' ? 'Nothing waiting. The engine is handling everything on its own.' : 'Nothing here.'}</p></div>}
          {list.map((e) => <PulseCard key={e.id} e={e} footer={<ReviewControls e={e} tab={tab} busy={busy} onAct={act} />} />)}
        </div>
      </section>
      {toast && <p className="review-toast" role="status">{toast}</p>}
    </div>
  )
}

function ReviewControls({ e, tab, busy, onAct }: { e: PulseEvent; tab: Tab; busy: string | null; onAct: (id: string, action: string, note?: string) => void }) {
  const [note, setNote] = useState(e.reviewed?.note ?? '')
  const held = e.tier === 'review' ? 'Held: a loud claim that conflicts with the record' : e.tier === 'hold' ? 'Held: not linked to any peptide or the peptide market' : null
  const b = (action: string, label: string, cls = '') => <button className={`btn btn-sm justify-center ${cls}`} disabled={busy === e.id + action} onClick={() => onAct(e.id, action, note)}>{label}</button>
  return (
    <div className="review-controls">
      {held && <p className="review-reason">{held}</p>}
      {e.reviewed?.action && <p className="review-reason">{ACTION_LABEL[e.reviewed.action]} {timeAgo(e.reviewed.at)}</p>}
      <label className="block">
        <span className="sr-only">Editor’s note</span>
        <textarea className="goal-input" rows={2} maxLength={400} value={note} onChange={(x) => setNote(x.target.value)} placeholder="Editor’s note, shown on the card (optional)" />
      </label>
      <div className="review-buttons">
        {tab === 'waiting' && <>{b('approve', 'Approve', 'commerce-btn')}{b('reject', 'Reject')}</>}
        {tab === 'live' && <>{b('pull', 'Pull from feed')}</>}
        {tab === 'decided' && e.reviewed?.action && b('restore', 'Undo decision')}
        {b('note', 'Save note')}
      </div>
    </div>
  )
}
