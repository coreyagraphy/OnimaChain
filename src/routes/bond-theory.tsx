import { createFileRoute, Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { BRAND } from '~/brand'
import { COMPOUNDS, COMPOUND_BY_SLUG, displayName, type Compound } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { studiesForCompound, type Study } from '~/data/studies'
import { environmentFor } from '~/data/environments'
import { GOALS, GOAL_BY_ID, LEVELS, LEVEL_RANK, goalsFromText, matchesFor, profileFor, topLevel, type GoalId, type Level } from '~/data/goals'
import { reportsFor } from '~/data/reports'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { SequenceSVG } from '~/components/SequenceSVG'
import { CompositeStructure } from '~/components/CompositeStructure'
import { structurePresentation } from '~/data/structure-presentation'

const BondStage = lazy(() => import('~/scenes/bond/BondStage').then((m) => ({ default: m.BondStage })))

export const Route = createFileRoute('/bond-theory')({
  head: () => ({ meta: [{ title: `Bond Theory: The Stack Effect — ${BRAND}` }, { name: 'description', content: 'Tell us what you’re after. See which peptides the research points to, and what they do together.' }] }),
  component: BondTheory,
})

const SAVE_KEY = 'bond-theory-picks'
const GOAL_KEY = 'bond-theory-goals'
const STATIONS = 4
const LEVEL_COLOR: Record<Level, string> = { cells: '#9AA3B5', animals: '#C6A8FF', people: '#5FE3FF', approved: '#6EF2A6' }

/** Plain-language study context: the actual model, never a guess. */
function studiedIn(s: Study): string {
  if (s.speciesFromTitle === 'rat') return 'in rats'
  if (s.speciesFromTitle === 'mouse') return 'in mice'
  if (s.speciesFromTitle === 'human') return 'in people'
  if (s.speciesFromTitle === 'other-animal') return 'in animals'
  if (s.studyType === 'in-vitro') return 'in cells'
  if (s.studyType === 'review' || s.studyType === 'systematic-review') return 'in a review of other studies'
  if (s.studyType === 'controlled-human' || s.studyType === 'observational-human') return 'in people'
  return 'in a published study'
}

/** Studies in our checked record that name every compound in the pair. */
function sharedStudies(a: string, b: string): Study[] {
  return studiesForCompound(a).filter((s) => s.compounds.includes(b))
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)

function BondTheory() {
  const canvasOk = useCanvasAllowed()
  const [picks, setPicks] = useState<string[]>([])
  const [chosenGoals, setChosenGoals] = useState<GoalId[]>([])
  const [text, setText] = useState('')
  const [dismissed, setDismissed] = useState<GoalId[]>([])
  const [active, setActive] = useState(0)
  const [page, setPage] = useState(0)
  const [picker, setPicker] = useState(false)
  const [q, setQ] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [undo, setUndo] = useState<{ slug: string; at: number } | null>(null)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [single, setSingle] = useState(false)
  const chooseBtn = useRef<HTMLButtonElement>(null)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSingle(window.innerWidth < 768)
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? '[]'); if (Array.isArray(s)) setPicks(s.filter((x) => COMPOUND_BY_SLUG[x])) } catch { /* nothing saved */ }
    try { const g = JSON.parse(localStorage.getItem(GOAL_KEY) ?? '{}'); if (Array.isArray(g.goals)) setChosenGoals(g.goals.filter((x: string) => x in GOAL_BY_ID)); if (typeof g.text === 'string') setText(g.text) } catch { /* nothing saved */ }
  }, [])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(null), 2600); return () => clearTimeout(t) }, [notice])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && picker) { setPicker(false); chooseBtn.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picker])

  // goals = the chips they tapped + anything we recognise in what they typed
  const typedGoals = useMemo(() => goalsFromText(text), [text])
  const goals = useMemo(() => Array.from(new Set([...chosenGoals, ...typedGoals.filter((g) => !dismissed.includes(g))])), [chosenGoals, typedGoals, dismissed])
  const toggleGoal = (g: GoalId) => {
    if (goals.includes(g)) { setChosenGoals((cur) => cur.filter((x) => x !== g)); setDismissed((d) => [...d, g]) }
    else { setChosenGoals((cur) => [...cur, g]); setDismissed((d) => d.filter((x) => x !== g)) }
  }

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
  const save = () => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(picks)); localStorage.setItem(GOAL_KEY, JSON.stringify({ goals: chosenGoals, text })) } catch { /* private mode */ }
    setSaved(true)
  }
  const saveImage = async () => {
    if (!card.current) return
    setExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const url = await toPng(card.current, { pixelRatio: 2, backgroundColor: '#0A0B10', filter: (n) => !(n instanceof HTMLElement && n.dataset.noexport === '1') })
      const a = document.createElement('a'); a.href = url; a.download = 'my-stack.png'; a.click()
    } catch { setNotice('Couldn’t make the picture. A screenshot works too.') }
    setExporting(false)
  }

  const compounds = picks.map((s) => COMPOUND_BY_SLUG[s])
  const pages = Math.max(1, Math.ceil(picks.length / STATIONS))
  const visible = picks.slice(page * STATIONS, page * STATIONS + STATIONS)
  const localActive = Math.max(0, Math.min(visible.length - 1, active - page * STATIONS))
  const links = useMemo(() => {
    const l: Array<[number, number]> = []
    for (let i = 0; i < visible.length; i++) for (let j = i + 1; j < visible.length; j++) if (sharedStudies(visible[i], visible[j]).length) l.push([i, j])
    return l
  }, [visible.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pt-24 pb-24">
      <header className="wrap">
        <p className="label label-cyan">Build a stack</p>
        <h1 className="display text-[clamp(2.6rem,7vw,6.2rem)] mt-3 leading-[0.95]">Bond Theory:<br /><span className="bond-title-accent">The Stack Effect</span></h1>
        <p className="lede mt-5 max-w-2xl">Tell us what you’re after. See which peptides the research points to, and what they do together.</p>
      </header>

      {/* 1 — what they're after */}
      <section className="wrap mt-10" aria-labelledby="goal-h">
        <div className="goal-panel">
          <p className="label label-cyan">Step 1</p>
          <h2 id="goal-h" className="display-md text-[clamp(1.6rem,3.4vw,2.4rem)] mt-2">What are you working on?</h2>
          <label className="block mt-4">
            <span className="block text-[14px] text-bone/75 mb-2">Type it the way you’d say it. Pick as many as you like.</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="goal-input" placeholder="e.g. bad knee, bloating after meals, want to drop 20 lbs, better sleep" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Goals">
            {GOALS.map((g) => {
              const on = goals.includes(g.id)
              return <button key={g.id} className="goal-chip" aria-pressed={on} onClick={() => toggleGoal(g.id)} title={!chosenGoals.includes(g.id) && typedGoals.includes(g.id) ? 'Picked up from what you typed' : undefined}>{g.label}</button>
            })}
          </div>
          {typedGoals.length > 0 && <p className="mt-3 text-[13px] text-bone/60" role="status">From what you typed: {list(typedGoals.map((g) => GOAL_BY_ID[g].label))}.</p>}
        </div>
      </section>

      {/* 2 — research matches per goal */}
      {goals.length > 0 && (
        <section className="wrap mt-10" aria-labelledby="match-h">
          <p className="label label-cyan">Step 2</p>
          <h2 id="match-h" className="display-md text-[clamp(1.6rem,3.4vw,2.4rem)] mt-2">What the research points to</h2>
          <p className="mt-2 text-bone/70 max-w-2xl">Strongest research first. Add the ones you want to your stack.</p>
          <div className="mt-6 grid lg:grid-cols-2 gap-5">
            {goals.map((g) => (
              <div key={g} className="match-group">
                <p className="display-md text-xl">{GOAL_BY_ID[g].label}</p>
                <ol className="mt-4 grid gap-3">
                  {matchesFor(g).slice(0, 5).map((m, i) => {
                    const c = COMPOUND_BY_SLUG[m.slug]
                    const p = profileFor(m.slug)!
                    const inStack = picks.includes(m.slug)
                    const reports = reportsFor(m.slug, g)
                    return (
                      <li key={m.slug} className="match-row" style={{ '--env': environmentFor(m.slug).neon } as CSSProperties}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to="/compound/$slug" params={{ slug: m.slug }} className="font-semibold text-[16px] hover:underline">{displayName(c)}</Link>
                          <LevelBadge level={m.level} />
                          {i === 0 && <span className="match-top">Strongest research</span>}
                        </div>
                        <p className="mt-2 text-[14px] text-bone/88"><b className="text-bone">What studies found:</b> {p.animal}</p>
                        <p className="mt-1 text-[14px] text-bone/75"><b className="text-bone">In people:</b> {p.people}</p>
                        {reports.length > 0 && <p className="mt-1 text-[13px] text-bone/65"><b className="text-bone">People online:</b> {reports.length} linked first-hand report{reports.length > 1 ? 's' : ''}.</p>}
                        <button className={`btn btn-sm mt-3 ${inStack ? '' : 'commerce-btn'}`} onClick={() => (inStack ? remove(m.slug) : add(m.slug))} aria-pressed={inStack}>{inStack ? 'In your stack · remove' : 'Add to stack'}</button>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3 — the stage */}
      <section className="wrap mt-12" aria-label="Your stack on the stage">
        <p className="label label-cyan">Step 3</p>
        <h2 className="display-md text-[clamp(1.6rem,3.4vw,2.4rem)] mt-2 mb-5">Your stack</h2>
        <div className="bond-stage relative">
          {picks.length === 0 ? (
            <div className="absolute inset-0 grid place-items-center text-center p-6 z-10">
              <div>
                <p className="display-md text-2xl md:text-3xl">Nothing stacked yet.</p>
                <p className="mt-2 text-bone/70 max-w-md mx-auto">Add peptides from the matches above, or pick them yourself.</p>
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
              {visible.map((s) => <div key={s} className="panel-flat relative">{s === 'wolverine-blend' ? <CompositeStructure compact /> : COMPOUND_BY_SLUG[s].sequence ? <SequenceSVG geometry={buildChain(COMPOUND_BY_SLUG[s])} tint={environmentFor(s).neon} className="absolute inset-0 w-full h-full p-4" label /> : <div className="structure-unavailable" style={{ '--product': environmentFor(s).neon } as CSSProperties}><strong>{structurePresentation(COMPOUND_BY_SLUG[s]).label}</strong></div>}</div>)}
            </div>
          )}
          {picks.length > 0 && (
            <div className="bond-names" style={{ gridTemplateColumns: `repeat(${single ? 1 : visible.length}, minmax(0,1fr))` }}>
              {(single ? [visible[localActive]] : visible).filter(Boolean).map((s, i) => {
                const idx = single ? localActive : i
                return (
                  <button key={s} className="bond-name" aria-pressed={idx === localActive} onClick={() => setActive(page * STATIONS + idx)} style={{ '--env': environmentFor(s).neon } as CSSProperties}>
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
          {links.length > 0 && !single && <p className="absolute left-3 top-3 z-10 mono text-[11px] text-bone/60 max-w-[46ch]">Dashed line = a published study looked at both.</p>}
        </div>

        <div className="bond-tray mt-4" aria-label="Your picks">
          <span className="label mr-1">Your picks</span>
          {picks.length === 0 && <span className="text-[13px] text-bone/55">None yet.</span>}
          {picks.map((s) => (
            <span key={s} className="bond-chip" style={{ '--env': environmentFor(s).neon } as CSSProperties}>
              {displayName(COMPOUND_BY_SLUG[s])}
              <button onClick={() => remove(s)} aria-label={`Remove ${displayName(COMPOUND_BY_SLUG[s])}`}>Remove</button>
            </span>
          ))}
          {undo && <button className="btn btn-sm stage-btn" onClick={doUndo}>Undo</button>}
          {picks.length > 0 && <button ref={chooseBtn} className="btn btn-sm stage-btn" onClick={() => setPicker(true)}>Choose peptides</button>}
        </div>
        {notice && <p className="mt-3 text-[14px] text-amber" role="status">{notice}</p>}
      </section>

      {/* 4 — the summary they can screenshot or save */}
      {picks.length > 0 && (
        <section className="wrap mt-12" aria-labelledby="sum-h">
          <p className="label label-cyan">Step 4</p>
          <h2 id="sum-h" className="display-md text-[clamp(1.6rem,3.4vw,2.4rem)] mt-2">What they do together</h2>
          <p className="mt-2 text-bone/70">Screenshot it, or save it as a picture.</p>
          <div className="mt-6"><StackCard ref={card} compounds={compounds} goals={goals} picks={picks} onAdd={add} /></div>
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <button className="btn btn-primary" onClick={saveImage} disabled={exporting}>{exporting ? 'Making your picture…' : 'Save as picture'}</button>
            <button className="btn" onClick={save}>Save your picks</button>
            {saved && <span className="text-[13px] text-bone/70" role="status">Saved on this device.</span>}
          </div>
          <details className="method-detail mt-8">
            <summary>See the studies <span>+</span></summary>
            <div className="px-[22px] pb-[22px]">
              {compounds.map((c) => {
                const st = studiesForCompound(c.slug)
                return (
                  <div key={c.slug} className="mt-4">
                    <p className="label" style={{ color: environmentFor(c.slug).neon }}>{displayName(c)}</p>
                    {st.length ? (
                      <ul className="mt-2 grid gap-1.5 text-[14px]">{st.map((s) => <li key={s.pmid}><span className="text-bone/60">{studiedIn(s)} · </span><Link to="/study/$pmid" params={{ pmid: s.pmid }} className="underline">{s.meta?.title ?? `PubMed ${s.pmid}`}</Link></li>)}</ul>
                    ) : <p className="mt-1 text-[14px] text-bone/60">Checked PubMed records for this one are coming.</p>}
                  </div>
                )
              })}
            </div>
          </details>
        </section>
      )}

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

function LevelBadge({ level }: { level: Level }) {
  return <span className="level-badge" style={{ '--lv': LEVEL_COLOR[level] } as CSSProperties}>{LEVELS.find((l) => l.id === level)!.label}</span>
}

/** Cells → Animals → People → Approved, lit up to where the research has reached. */
function Ladder({ slug }: { slug: string }) {
  const top = LEVEL_RANK[topLevel(slug)]
  return (
    <div className="ladder" aria-label={`Research has reached: ${LEVELS[top].label}`}>
      {LEVELS.map((l, i) => <span key={l.id} data-on={i <= top ? '1' : undefined} style={{ '--lv': LEVEL_COLOR[LEVELS[top].id] } as CSSProperties}>{l.short}</span>)}
    </div>
  )
}

interface CardProps { compounds: Compound[]; goals: GoalId[]; picks: string[]; onAdd: (slug: string) => void; ref?: React.Ref<HTMLDivElement> }

/** The picture: overlap, what each one adds, whether your goals are covered, and how far the research has gone. */
function StackCard({ compounds, goals, picks, onAdd, ref }: CardProps) {
  const name = (s: string) => displayName(COMPOUND_BY_SLUG[s])
  const covering = (g: GoalId) => picks.filter((s) => profileFor(s)?.goals[g])
  // every goal any pick is studied for, their own goals first
  const rows = Array.from(new Set([...goals, ...picks.flatMap((s) => Object.keys(profileFor(s)?.goals ?? {}) as GoalId[])]))
  const overlaps = rows.filter((g) => covering(g).length >= 2)
  const adds = picks.map((s) => ({ s, only: (Object.keys(profileFor(s)?.goals ?? {}) as GoalId[]).filter((g) => covering(g).length === 1) })).filter((x) => x.only.length)
  const together: Array<{ a: string; b: string; st: Study[] }> = []
  for (let i = 0; i < picks.length; i++) for (let j = i + 1; j < picks.length; j++) { const st = sharedStudies(picks[i], picks[j]); if (st.length) together.push({ a: picks[i], b: picks[j], st }) }
  const date = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div ref={ref} className="stack-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label label-cyan">My stack</p>
          <p className="stack-names mt-2">{compounds.map((c) => <span key={c.slug} style={{ '--env': environmentFor(c.slug).neon } as CSSProperties}>{displayName(c)}</span>)}</p>
        </div>
        <p className="mono text-[11px] text-bone/50 text-right">{BRAND}<br />{date}</p>
      </div>
      {goals.length > 0 && <p className="mt-4 text-[14px] text-bone/80"><b className="text-bone">Going for:</b> {list(goals.map((g) => GOAL_BY_ID[g].label))}</p>}

      <div className="stack-together mt-5">
        {overlaps.map((g) => {
          const cs = covering(g)
          return (
            <p key={g}><span className="stack-tag stack-tag-overlap">Overlap</span><b>{GOAL_BY_ID[g].label}:</b> {list(cs.map(name))} are {cs.length === 2 ? 'both' : 'all'} studied for this{new Set(cs.map((s) => profileFor(s)?.how)).size > 1 ? ', each by a different route' : ''}.</p>
          )
        })}
        {overlaps.length > 0 && (
          <p><span className="stack-tag stack-tag-route">How they get there</span>{picks.map((s, i) => <span key={s}>{i > 0 && ' · '}<b>{name(s)}</b> {profileFor(s)?.how.replace(/^./, (x) => x.toLowerCase())}</span>)}.</p>
        )}
        {adds.map(({ s, only }) => (
          <p key={s}><span className="stack-tag">Adds</span><b>{name(s)}</b> brings {list(only.map((g) => GOAL_BY_ID[g].label.toLowerCase()))}.</p>
        ))}
        {together.map((t) => (
          <p key={`${t.a}-${t.b}`}><span className="stack-tag stack-tag-study">Studied together</span><b>{name(t.a)} + {name(t.b)}</b> were looked at in the same published study, {list(Array.from(new Set(t.st.map(studiedIn))))}.</p>
        ))}
        {goals.filter((g) => covering(g).length === 0).map((g) => {
          const best = matchesFor(g).find((m) => !picks.includes(m.slug))
          return (
            <p key={g}><span className="stack-tag stack-tag-gap">Gap</span><b>{GOAL_BY_ID[g].label}</b> isn’t covered yet.{best && <> Strongest research match: <b>{name(best.slug)}</b>. <button data-noexport="1" className="stack-add" onClick={() => onAdd(best.slug)}>Add it</button></>}</p>
          )
        })}
        {picks.length === 1 && <p className="text-bone/65">Add a second peptide to see the overlap.</p>}
      </div>

      {/* the matrix: rows are goals, columns are picks, dots show how far research has gone */}
      <div className="stack-matrix mt-6" style={{ '--cols': picks.length } as CSSProperties} role="table" aria-label="What each pick is studied for">
        <div role="row" className="stack-matrix-head"><span role="columnheader">Studied for</span>{picks.map((s) => <span key={s} role="columnheader" style={{ color: environmentFor(s).neon }}>{name(s).split(" (")[0]}</span>)}</div>
        {rows.map((g) => {
          const n = covering(g).length
          return (
            <div role="row" key={g} data-overlap={n >= 2 ? '1' : undefined} data-mine={goals.includes(g) ? '1' : undefined}>
              <span role="rowheader">{GOAL_BY_ID[g].label}{goals.includes(g) && <i className="stack-mine">your goal</i>}</span>
              {picks.map((s) => {
                const lv = profileFor(s)?.goals[g]
                return <span role="cell" key={s}>{lv ? <i className="stack-dot" style={{ '--lv': LEVEL_COLOR[lv] } as CSSProperties} title={LEVELS.find((l) => l.id === lv)!.label}>{LEVELS.find((l) => l.id === lv)!.short}</i> : <i className="stack-none">—</i>}</span>
              })}
            </div>
          )
        })}
      </div>

      <div className="stack-each mt-6">
        {compounds.map((c) => {
          const p = profileFor(c.slug)
          if (!p) return null
          return (
            <div key={c.slug} className="stack-each-card" style={{ '--env': environmentFor(c.slug).neon } as CSSProperties}>
              <p className="font-semibold text-[16px]" style={{ color: environmentFor(c.slug).neon }}>{displayName(c)}</p>
              <p className="text-[13px] text-bone/70 mt-0.5">{p.how}.</p>
              <p className="mt-3 text-[13px] text-bone/88"><b className="text-bone">Studies found:</b> {p.animal}</p>
              <p className="mt-1.5 text-[13px] text-bone/78"><b className="text-bone">In people:</b> {p.people}</p>
              <Ladder slug={c.slug} />
            </div>
          )
        })}
      </div>
      <p className="mt-5 text-[11px] text-bone/45">Summary of published research. Colours: <span style={{ color: LEVEL_COLOR.cells }}>lab</span> · <span style={{ color: LEVEL_COLOR.animals }}>animals</span> · <span style={{ color: LEVEL_COLOR.people }}>people</span> · <span style={{ color: LEVEL_COLOR.approved }}>approved</span>.</p>
    </div>
  )
}
