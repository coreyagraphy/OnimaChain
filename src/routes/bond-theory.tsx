import { createFileRoute, Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { BRAND } from '~/brand'
import { COMPOUNDS, COMPOUND_BY_SLUG, displayName, type Compound } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { descriptionFor } from '~/data/commerce'
import { studiesForCompound, pubmedUrl, type Study } from '~/data/studies'
import { distributionFor } from '~/data/evidence'
import { environmentFor } from '~/data/environments'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { SequenceSVG } from '~/components/SequenceSVG'

const BondStage = lazy(() => import('~/scenes/bond/BondStage').then((m) => ({ default: m.BondStage })))

export const Route = createFileRoute('/bond-theory')({
  head: () => ({ meta: [{ title: `Bond Theory: The Stack Effect — ${BRAND}` }, { name: 'description', content: 'Pick peptides. See what’s known about them together.' }] }),
  component: BondTheory,
})

type Question = 'might' | 'similar' | 'together' | 'unknown' | 'studies'
const QUESTIONS: Array<{ id: Question; label: string }> = [
  { id: 'might', label: 'What might they do?' },
  { id: 'similar', label: 'Do they do similar things?' },
  { id: 'together', label: 'Have they been studied together?' },
  { id: 'unknown', label: 'What don’t we know?' },
  { id: 'studies', label: 'See the studies' },
]
const SAVE_KEY = 'bond-theory-picks'
const STATIONS = 4

/** Plain-language study context: the actual model, never a guess. */
function studiedIn(s: Study): string {
  if (s.speciesFromTitle === 'rat') return 'In rats'
  if (s.speciesFromTitle === 'mouse') return 'In mice'
  if (s.speciesFromTitle === 'human') return 'In people'
  if (s.speciesFromTitle === 'other-animal') return 'In animals'
  if (s.studyType === 'in-vitro') return 'In cells'
  if (s.studyType === 'review' || s.studyType === 'systematic-review') return 'A review of other studies'
  if (s.studyType === 'controlled-human' || s.studyType === 'observational-human') return 'In people'
  return 'Study setting not stated in the title'
}

/** Studies in our checked record that name every compound in the pair. */
function sharedStudies(a: string, b: string): Study[] {
  return studiesForCompound(a).filter((s) => s.compounds.includes(b))
}

function BondTheory() {
  const canvasOk = useCanvasAllowed()
  const [picks, setPicks] = useState<string[]>([])
  const [active, setActive] = useState(0)
  const [page, setPage] = useState(0)
  const [picker, setPicker] = useState(false)
  const [q, setQ] = useState('')
  const [question, setQuestion] = useState<Question | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [undo, setUndo] = useState<{ slug: string; at: number } | null>(null)
  const [saved, setSaved] = useState(false)
  const [single, setSingle] = useState(false)
  const chooseBtn = useRef<HTMLButtonElement>(null)
  const questionOpener = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setSingle(window.innerWidth < 768)
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? '[]'); if (Array.isArray(s)) setPicks(s.filter((x) => COMPOUND_BY_SLUG[x])) } catch { /* nothing saved */ }
  }, [])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(null), 2600); return () => clearTimeout(t) }, [notice])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (picker) { setPicker(false); chooseBtn.current?.focus() }
      else if (question) { setQuestion(null); questionOpener.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picker, question])

  // search matches names and aliases, so a synonym resolves to the same peptide (duplicate detection by identity, not by text)
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    return COMPOUNDS.filter((c) => !t || displayName(c).toLowerCase().includes(t) || c.name.toLowerCase().includes(t) || c.aliases.some((a) => a.toLowerCase().includes(t)))
  }, [q])
  const add = (slug: string) => {
    if (picks.includes(slug)) { setNotice('You already picked this one.'); return }
    const next = [...picks, slug]
    setPicks(next); setActive(next.length - 1); setPage(Math.floor((next.length - 1) / STATIONS)); setSaved(false)
  }
  const remove = (slug: string) => {
    const i = picks.indexOf(slug)
    setPicks(picks.filter((s) => s !== slug)); setUndo({ slug, at: i }); setActive(0); setSaved(false)
  }
  const doUndo = () => {
    if (!undo) return
    const next = [...picks]; next.splice(Math.min(undo.at, next.length), 0, undo.slug)
    setPicks(next); setUndo(null)
  }
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(picks)) } catch { /* private mode */ } setSaved(true) }

  const compounds = picks.map((s) => COMPOUND_BY_SLUG[s])
  const pages = Math.max(1, Math.ceil(picks.length / STATIONS))
  const visible = picks.slice(page * STATIONS, page * STATIONS + STATIONS)
  const localActive = Math.max(0, Math.min(visible.length - 1, active - page * STATIONS))
  const pairs = useMemo(() => {
    const out: Array<{ a: Compound; b: Compound; studies: Study[] }> = []
    for (let i = 0; i < compounds.length; i++) for (let j = i + 1; j < compounds.length; j++) out.push({ a: compounds[i], b: compounds[j], studies: sharedStudies(compounds[i].slug, compounds[j].slug) })
    return out
  }, [picks]) // eslint-disable-line react-hooks/exhaustive-deps
  const links = useMemo(() => {
    const l: Array<[number, number]> = []
    for (let i = 0; i < visible.length; i++) for (let j = i + 1; j < visible.length; j++) if (sharedStudies(visible[i], visible[j]).length) l.push([i, j])
    return l
  }, [visible.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const download = () => {
    const lines: string[] = [`${BRAND} — Bond Theory: The Stack Effect`, `Your picks: ${compounds.map(displayName).join(', ')}`, `Made: ${new Date().toISOString().slice(0, 10)}`, '', 'This is a research summary, not medical advice. It does not say these should be taken together, or how.', '']
    for (const c of compounds) {
      lines.push(`## ${displayName(c)}`, descriptionFor(c))
      const st = studiesForCompound(c.slug)
      lines.push(st.length ? `Checked studies: ${st.length}` : 'Checked studies: none added yet')
      for (const s of st) lines.push(`- ${studiedIn(s)}: ${s.meta?.title ?? s.pmid} (${s.meta?.year ?? 'year n/a'}) ${pubmedUrl(s.pmid)}`)
      lines.push('')
    }
    lines.push('## Have they been studied together?')
    if (pairs.length === 0) lines.push('Pick at least two peptides to compare.')
    for (const p of pairs) lines.push(p.studies.length ? `- ${displayName(p.a)} + ${displayName(p.b)}: ${p.studies.length} checked study looked at both (${p.studies.map((s) => studiedIn(s).toLowerCase()).join(', ')}). ${p.studies.map((s) => pubmedUrl(s.pmid)).join(' ')}` : `- ${displayName(p.a)} + ${displayName(p.b)}: We didn’t find a study of these together.`)
    lines.push('', '## What we don’t know')
    for (const u of unknowns(compounds, pairs)) lines.push(`- ${u}`)
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bond-theory-summary.txt'; a.click(); URL.revokeObjectURL(a.href)
  }

  const openQuestion = (id: Question, e: React.MouseEvent<HTMLButtonElement>) => { questionOpener.current = e.currentTarget; setQuestion((cur) => (cur === id ? null : id)) }

  return (
    <div className="pt-24 pb-24">
      <header className="wrap">
        <p className="label label-cyan">Compare peptides</p>
        <h1 className="display text-[clamp(2.6rem,7vw,6.2rem)] mt-3 leading-[0.95]">Bond Theory:<br /><span className="bond-title-accent">The Stack Effect</span></h1>
        <p className="lede mt-5 max-w-2xl">Pick peptides. See what’s known about them together.</p>
      </header>

      {/* the stage */}
      <section className="wrap mt-10" aria-label="Your picks on the stage">
        <div className="bond-stage relative">
          {picks.length === 0 ? (
            <div className="absolute inset-0 grid place-items-center text-center p-6 z-10">
              <div>
                <p className="display-md text-2xl md:text-3xl">An empty stage.</p>
                <p className="mt-2 text-bone/70 max-w-md mx-auto">Pick two or more peptides to see what checked studies say about each one, and whether anyone has studied them together.</p>
                <button ref={chooseBtn} className="btn btn-primary mt-6 stage-btn" onClick={() => setPicker(true)}>Choose peptides</button>
              </div>
            </div>
          ) : null}
          {canvasOk ? (
            <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={16}>
              <Suspense fallback={null}><BondStage slugs={visible} active={single ? active - page * STATIONS : localActive} links={links} single={single} /></Suspense>
            </Lod0Canvas>
          ) : (
            <div className="absolute inset-0 grid gap-3 p-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, visible.length)}, minmax(0,1fr))` }}>
              {visible.map((s) => <div key={s} className="panel-flat relative"><SequenceSVG geometry={buildChain(COMPOUND_BY_SLUG[s])} tint={environmentFor(s).neon} className="absolute inset-0 w-full h-full p-4" label /></div>)}
            </div>
          )}
          {/* station name labels (HTML, readable, not part of the glow) */}
          {picks.length > 0 && (
            <div className="bond-names" style={{ gridTemplateColumns: `repeat(${single ? 1 : visible.length}, minmax(0,1fr))` }}>
              {(single ? [visible[localActive]] : visible).filter(Boolean).map((s, i) => {
                const idx = single ? localActive : i
                const env = environmentFor(s)
                return (
                  <button key={s} className="bond-name" aria-pressed={idx === localActive} onClick={() => setActive(page * STATIONS + idx)} style={{ '--env': env.neon } as React.CSSProperties}>
                    <span className="block text-[15px] font-semibold">{displayName(COMPOUND_BY_SLUG[s])}</span>
                    <span className="block text-[12px] text-bone/60">{DOMAIN_BY_ID[COMPOUND_BY_SLUG[s].domain].name}</span>
                  </button>
                )
              })}
            </div>
          )}
          {single && picks.length > 1 && (
            <div className="absolute inset-x-3 top-3 flex justify-between z-10">
              <button className="btn btn-sm stage-btn" disabled={active === 0} onClick={() => setActive(Math.max(0, active - 1))} aria-label="Previous pick">←</button>
              <span className="text-[13px] text-bone/70 self-center">{active + 1} of {picks.length}</span>
              <button className="btn btn-sm stage-btn" disabled={active >= picks.length - 1} onClick={() => setActive(Math.min(picks.length - 1, active + 1))} aria-label="Next pick">→</button>
            </div>
          )}
          {!single && pages > 1 && (
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
              <button className="btn btn-sm stage-btn" disabled={page === 0} onClick={() => { setPage(page - 1); setActive((page - 1) * STATIONS) }}>←</button>
              <span className="text-[13px] text-bone/70">Showing {page * STATIONS + 1}–{Math.min(picks.length, (page + 1) * STATIONS)} of {picks.length}</span>
              <button className="btn btn-sm stage-btn" disabled={page >= pages - 1} onClick={() => { setPage(page + 1); setActive((page + 1) * STATIONS) }}>→</button>
            </div>
          )}
          {links.length > 0 && !single && <p className="absolute left-3 top-3 z-10 mono text-[11px] text-bone/60 max-w-[46ch]">Dashed line = one checked study looked at both. It is not a chemical bond and not proof they work together.</p>}
        </div>

        {/* tray: your picks */}
        <div className="bond-tray mt-4" aria-label="Your picks">
          <span className="label mr-1">Your picks</span>
          {picks.length === 0 && <span className="text-[13px] text-bone/55">None yet.</span>}
          {picks.map((s) => (
            <span key={s} className="bond-chip" style={{ '--env': environmentFor(s).neon } as React.CSSProperties}>
              {displayName(COMPOUND_BY_SLUG[s])}
              <button onClick={() => remove(s)} aria-label={`Remove ${displayName(COMPOUND_BY_SLUG[s])}`}>Remove</button>
            </span>
          ))}
          {undo && <button className="btn btn-sm stage-btn" onClick={doUndo}>Undo</button>}
          {picks.length > 0 && <button ref={chooseBtn} className="btn btn-sm stage-btn" onClick={() => setPicker(true)}>Choose peptides</button>}
        </div>
        {notice && <p className="mt-3 text-[14px] text-amber" role="status">{notice}</p>}

        {/* questions: one drawer at a time */}
        {picks.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Ask a question">
              {QUESTIONS.map((x) => <button key={x.id} className="btn btn-sm stage-btn" aria-pressed={question === x.id} onClick={(e) => openQuestion(x.id, e)}>{x.label}</button>)}
            </div>
            {question && (
              <div className="glass relative rounded-3xl p-6 md:p-8 mt-4 drawer-in" role="region" aria-label={QUESTIONS.find((x) => x.id === question)?.label}>
                <div className="relative"><QuestionBody id={question} compounds={compounds} pairs={pairs} /></div>
                <button className="btn btn-sm stage-btn relative mt-6" onClick={() => { setQuestion(null); questionOpener.current?.focus() }}>Close</button>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <button className="btn btn-primary" onClick={save}>Save your picks</button>
              <button className="btn" onClick={download}>Download your summary</button>
              {saved && <span className="text-[13px] text-bone/70" role="status">Saved on this device.</span>}
            </div>
            <p className="mt-4 text-[12px] text-bone/50 max-w-2xl">This page compares what checked studies say about each peptide. It never tells you what to take, how much, or whether to combine them. Talk to a doctor about anything you put in your body.</p>
          </div>
        )}
      </section>

      {/* picker drawer */}
      {picker && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Choose peptides">
          <button className="absolute inset-0 veil" onClick={() => { setPicker(false); chooseBtn.current?.focus() }} aria-label="Close" />
          <div className="absolute right-0 top-0 h-full w-[min(94vw,480px)] glass p-6 overflow-y-auto drawer-in" data-lenis-prevent style={{ borderRadius: 0 }}>
            <div className="relative flex items-center justify-between"><p className="label label-cyan">Choose peptides</p><button className="btn btn-sm stage-btn" onClick={() => { setPicker(false); chooseBtn.current?.focus() }}>Done</button></div>
            <label className="relative block mt-5"><span className="block text-[14px] text-bone/80 mb-2">What are you looking into?</span>
              <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or other name…" className="w-full" /></label>
            {notice && <p className="relative mt-3 text-[14px] text-amber" role="status">{notice}</p>}
            <ul className="relative mt-4 grid gap-1.5">
              {results.map((c) => {
                const on = picks.includes(c.slug)
                return (
                  <li key={c.slug}>
                    <button className="stage-feature" aria-pressed={on} onClick={() => add(c.slug)}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: environmentFor(c.slug).neon }} aria-hidden />
                      <span className="flex-1">{displayName(c)}<span className="block text-[12px] text-bone/55">{DOMAIN_BY_ID[c.domain].name}</span></span>
                      <span className="text-[12px] text-bone/60">{on ? 'Picked' : 'Add'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function unknowns(compounds: Compound[], pairs: Array<{ a: Compound; b: Compound; studies: Study[] }>): string[] {
  const out: string[] = []
  if (pairs.some((p) => p.studies.length === 0)) out.push('We didn’t find a study of some of these together. Missing data is not the same as “safe together”.')
  if (compounds.length >= 3) out.push('Even where two were studied together, that says nothing about taking three or more at once.')
  const noHuman = compounds.filter((c) => distributionFor(c.slug).human === 0).map(displayName)
  if (noHuman.length) out.push(`No checked study in people for: ${noHuman.join(', ')}.`)
  const noStudies = compounds.filter((c) => studiesForCompound(c.slug).length === 0).map(displayName)
  if (noStudies.length) out.push(`We haven’t added any checked study yet for: ${noStudies.join(', ')}.`)
  out.push('No study we have checked looks at the safety of taking any of these together.')
  return out
}

function QuestionBody({ id, compounds, pairs }: { id: Question; compounds: Compound[]; pairs: Array<{ a: Compound; b: Compound; studies: Study[] }> }) {
  if (id === 'might') return (
    <div className="grid md:grid-cols-2 gap-4">
      {compounds.map((c) => {
        const st = studiesForCompound(c.slug)
        return (
          <div key={c.slug}>
            <p className="label" style={{ color: environmentFor(c.slug).neon }}>{displayName(c)}</p>
            <p className="mt-2 text-[15px] text-bone/85 leading-relaxed">{descriptionFor(c)}</p>
            <p className="mt-2 text-[13px] text-bone/60">{st.length ? `Checked studies: ${Array.from(new Set(st.map(studiedIn))).join(' · ')}` : 'No checked study added yet.'}</p>
          </div>
        )
      })}
    </div>
  )
  if (id === 'similar') {
    const groups = new Map<string, Compound[]>()
    for (const c of compounds) groups.set(c.domain, [...(groups.get(c.domain) ?? []), c])
    const shared = [...groups.entries()].filter(([, cs]) => cs.length > 1)
    return (
      <div>
        <p className="display-md text-xl">Do they do similar things?</p>
        {shared.length ? shared.map(([d, cs]) => (
          <p key={d} className="mt-3 text-[15px] text-bone/85"><b>{cs.map(displayName).join(' and ')}</b> are both filed under <b>{DOMAIN_BY_ID[d as keyof typeof DOMAIN_BY_ID].name}</b>. These may be looked into for similar reasons. That doesn’t mean they work the same way, or better together.</p>
        )) : <p className="mt-3 text-[15px] text-bone/85">Your picks sit in different topics. We have no checked record showing they act the same way.</p>}
        <p className="mt-4 text-[13px] text-bone/60">A shared topic is not a shared mechanism, and it is not a reason to combine them.</p>
      </div>
    )
  }
  if (id === 'together') return (
    <div>
      <p className="display-md text-xl">Have they been studied together?</p>
      {pairs.length === 0 && <p className="mt-3 text-[15px] text-bone/85">Pick at least two peptides to check.</p>}
      <ul className="mt-3 grid gap-3">
        {pairs.map((p) => (
          <li key={`${p.a.slug}-${p.b.slug}`} className="text-[15px] text-bone/85">
            <b>{displayName(p.a)} + {displayName(p.b)}:</b>{' '}
            {p.studies.length ? (
              <>One checked study looked at both — {p.studies.map((s) => <span key={s.pmid}>{studiedIn(s).toLowerCase()}: <a className="underline" href={pubmedUrl(s.pmid)} target="_blank" rel="noreferrer noopener">{(s.meta?.title ?? `PubMed ${s.pmid}`).replace(/.$/, '')}</a></span>)}. Open it to see whether they were given together or compared side by side. One animal study is not proof they work together.</>
            ) : 'We didn’t find a study of these together.'}
          </li>
        ))}
      </ul>
    </div>
  )
  if (id === 'unknown') return (
    <div>
      <p className="display-md text-xl">What don’t we know?</p>
      <ul className="mt-3 grid gap-2 list-disc pl-5 text-[15px] text-bone/85">{unknowns(compounds, pairs).map((u) => <li key={u}>{u}</li>)}</ul>
    </div>
  )
  return (
    <div>
      <p className="display-md text-xl">See the studies</p>
      {compounds.map((c) => {
        const st = studiesForCompound(c.slug)
        return (
          <div key={c.slug} className="mt-4">
            <p className="label" style={{ color: environmentFor(c.slug).neon }}>{displayName(c)}</p>
            {st.length ? (
              <ul className="mt-2 grid gap-1.5 text-[14px]">{st.map((s) => <li key={s.pmid}><span className="text-bone/60">{studiedIn(s)} · </span><Link to="/study/$pmid" params={{ pmid: s.pmid }} className="underline">{s.meta?.title ?? `PubMed ${s.pmid}`}</Link></li>)}</ul>
            ) : <p className="mt-1 text-[14px] text-bone/60">No checked study added yet.</p>}
          </div>
        )
      })}
    </div>
  )
}
