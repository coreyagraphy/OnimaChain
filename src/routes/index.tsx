import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Hero } from '~/components/Hero'
import { CompoundCard } from '~/components/CompoundCard'
import { COMPOUND_BY_SLUG, COMPOUNDS } from '~/data/compounds'
import { CLAIM_BY_ID, ILLUSTRATIVE_BADGE } from '~/data/claims'
import { researchPulse } from '~/data/evidence'
import { STUDY_BY_PMID } from '~/data/studies'
import { NODE_STYLE, shapePath } from '~/components/nodes'
import { ScrollTrigger } from '~/motion/timeline'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <Hero />
      <ThreeWorlds />
      <FeaturedTrace />
      <ExploreCompounds />
      <Pulse />
      <Why />
    </>
  )
}

/* ---------- Section 2: the three worlds ---------- */
const WORLDS = [
  { id: 'research', k: 'World A', title: 'What research found', body: 'Published experiments, models and trials.', to: '/explore', color: '#5FE3FF' },
  { id: 'reports', k: 'World B', title: 'What people report', body: 'Structured public experience signals.', to: '/signal', color: '#8A63FF' },
  { id: 'claims', k: 'World C', title: 'How claims travel', body: 'See how scientific findings become internet narratives.', to: '/claims', color: '#F2EEE6' },
] as const

function ThreeWorlds() {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <section className="section wrap relative" aria-label="The three worlds">
      <p className="label label-cyan">Three disconnected worlds</p>
      <h2 className="display text-[clamp(2rem,4.6vw,4.2rem)] mt-3 max-w-3xl">Connected without pretending they are the same kind of evidence.</h2>
      <div className="relative mt-12 grid md:grid-cols-3 gap-4">
        <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" aria-hidden>
          {[[0, 1], [1, 2], [0, 2]].map(([a, b]) => {
            const lit = hover !== null && (hover === a || hover === b)
            const x1 = `${(a + 0.5) * 33.33}%`, x2 = `${(b + 0.5) * 33.33}%`
            const y = a === 0 && b === 2 ? '12%' : '50%'
            return (
              <line key={`${a}${b}`} x1={x1} y1={y} x2={x2} y2={y} stroke={lit ? WORLDS[hover!].color : '#F2EEE6'} strokeOpacity={lit ? 0.9 : 0.08} strokeWidth={lit ? 1.5 : 1} strokeDasharray={lit ? '0' : '4 6'} style={{ transition: 'stroke-opacity .5s, stroke .5s, stroke-dashoffset 1.2s', strokeDashoffset: lit ? 0 : 40 }} />
            )
          })}
        </svg>
        {WORLDS.map((w, i) => (
          <Link key={w.id} to={w.to} className="panel-flat neon-card relative p-7 md:p-9 min-h-[300px] flex flex-col justify-between card-tilt overflow-hidden" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} style={{ '--panel-accent': w.color, '--panel-accent-2': i === 0 ? '#33F0C8' : i === 1 ? '#FF4FD8' : '#FFB547', borderColor: hover === i ? `${w.color}88` : undefined } as CSSProperties}>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl" style={{ background: w.color, opacity: hover === i ? 0.16 : 0.06, transition: 'opacity .6s' }} />
            <div>
              <p className="label" style={{ color: w.color }}>{w.k}</p>
              <h3 className="display-md text-2xl md:text-3xl mt-3">{w.title}</h3>
            </div>
            <p className="text-sm muted max-w-xs mt-8">{w.body}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm muted max-w-2xl">Those are separate evidence classes and remain separate everywhere in the atlas. The central question is not &ldquo;does it work?&rdquo; but: where did this claim come from, what does the evidence actually say, what are people reporting, and how independent are those reports?</p>
    </section>
  )
}

/* ---------- Section 3: featured claim trace ---------- */
function FeaturedTrace() {
  const claim = CLAIM_BY_ID['CLAIM-BPC157-TENDON-REPAIR']
  const origin = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : undefined
  const ref = useRef<HTMLDivElement>(null)
  const prog = useRef<HTMLDivElement>(null)
  const nodes = useRef<Array<HTMLLIElement | null>>([])
  useEffect(() => {
    if (!ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress
        if (prog.current) prog.current.style.transform = `scaleX(${p})`
        nodes.current.forEach((el, i) => {
          if (!el) return
          const k = Math.max(0, Math.min(1, (p - i * 0.22) / 0.16))
          el.style.opacity = String(0.3 + 0.7 * k)
          el.style.transform = `translateY(${(1 - k) * 14}px)`
          el.dataset.lit = k > 0.8 ? '1' : '0'
        })
      },
    })
    return () => st.kill()
  }, [])
  const steps = [
    { kind: 'research' as const, k: 'Paper', title: origin?.title ?? 'Source relationship unresolved', sub: origin ? `${origin.journal} · ${origin.year} · PMID ${origin.pmid}` : null, badge: origin ? null : 'Unverified', quote: claim.mutation[0].wording },
    { kind: 'claim' as const, k: 'Interpretation', title: claim.mutation[1].wording, sub: claim.mutation[1].classes.join(' · '), badge: ILLUSTRATIVE_BADGE, quote: null },
    { kind: 'claim' as const, k: 'Social discussion', title: claim.mutation[2].wording, sub: claim.mutation[2].classes.join(' · '), badge: ILLUSTRATIVE_BADGE, quote: null },
    { kind: 'community' as const, k: 'Community signal', title: 'No source access for this platform', sub: 'Corpus: 0 sources · Collection window: none · Platforms: none enabled', badge: null, quote: null, hollow: true },
  ]
  return (
    <section className="section bg-graphite/40 border-y hairline" aria-label="Featured claim trace">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label label-cyan">Featured claim trace</p>
            <h2 className="display text-[clamp(2rem,4.6vw,4.2rem)] mt-3">&ldquo;{claim.title}&rdquo;</h2>
            <p className="mt-3 mono text-[12px] text-bone/55">{claim.id} · Tracked research claim · not labelled true or false</p>
          </div>
          <Link to="/claim/$id" params={{ id: claim.id }} className="btn btn-primary">Trace this claim</Link>
        </div>
        <div ref={ref} className="relative mt-14">
          <div className="absolute left-0 right-0 top-[22px] h-px bg-bone/10 hidden lg:block">
            <div ref={prog} className="h-full origin-left bg-gradient-to-r from-cyan via-bone to-violet" style={{ transform: 'scaleX(0)' }} />
          </div>
          <ol className="grid lg:grid-cols-4 gap-5">
            {steps.map((s, i) => {
              const st = NODE_STYLE[s.kind]
              return (
                <li key={s.k} ref={(el) => { nodes.current[i] = el }} className="relative" style={{ opacity: 0.3, transition: 'opacity .3s, transform .3s' }}>
                  <div className="flex items-center gap-3">
                    <svg width="44" height="44" viewBox="-22 -22 44 44" className="shrink-0 bg-obsidian rounded-full" aria-hidden>
                      <path d={shapePath(st.shape, 13)} fill={s.hollow ? 'transparent' : st.color} stroke={st.color} strokeWidth={1.2} strokeDasharray={s.hollow ? '3 3' : undefined} />
                    </svg>
                    <p className="label" style={{ color: st.color }}>{s.k}</p>
                  </div>
                  <div className={`panel-flat neon-card p-5 mt-4 min-h-[210px] ${s.hollow ? 'border-dashed' : ''}`} style={{ '--panel-accent': st.color } as CSSProperties}>
                    <p className={`${i === 0 ? 'text-sm' : 'display-md text-xl'} text-bone/95`}>{i === 0 ? s.title : `“${s.title}”`}</p>
                    {s.quote && i === 0 && <p className="mt-3 text-[12px] text-bone/65 italic border-l-2 border-cyan/40 pl-3">&ldquo;{s.quote}&rdquo;</p>}
                    {s.sub && <p className="mt-3 mono text-[11px] text-bone/50">{s.sub}</p>}
                    {s.badge && <span className={`chip mt-3 ${s.badge === 'Unverified' ? 'chip-amber' : 'chip-hollow'}`}>{s.badge}</span>}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------- Section 4: compounds ---------- */
function ExploreCompounds() {
  const featured = ['bpc-157', 'tb-500', 'ghk-cu', 'pt-141', 'thymosin-alpha-1', 'll-37', 'semaglutide', 'mots-c'].map((s) => COMPOUND_BY_SLUG[s])
  return (
    <section className="section" aria-label="Explore compounds">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label label-cyan">Explore compounds</p>
          <h2 className="display text-[clamp(2rem,4.6vw,4.2rem)] mt-3">Each drawn from its own sequence.</h2>
          <p className="mt-3 text-sm muted max-w-xl">Name · evidence distribution from verified records · latest change · community-signal presence. No pricing, no dosing, no &ldquo;best for&rdquo;.</p>
        </div>
        <Link to="/explore" className="btn">All {COMPOUNDS.length} compounds</Link>
      </div>
      <div className="mt-10 overflow-x-auto rail pb-4">
        <div className="wrap flex gap-5 items-end w-max">
          {featured.map((c, i) => <CompoundCard key={c.slug} compound={c} index={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ---------- Section 5: research pulse ---------- */
function Pulse() {
  const items = researchPulse()
  return (
    <section className="section border-y hairline bg-graphite/40" aria-label="Live research pulse">
      <div className="wrap">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan pulse-dot" aria-hidden />
          <p className="label label-cyan">Research pulse</p>
        </div>
        <h2 className="display text-[clamp(2rem,4.6vw,4.2rem)] mt-3">Honest counters, computed from the corpus.</h2>
        <dl className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.label} className="panel-flat p-6">
              <dt className="label">{it.label}</dt>
              <dd className="mt-3 display text-5xl">{it.value}<span className="text-xl text-bone/40">{it.of !== null ? ` / ${it.of}` : ''}</span></dd>
              <dd className="mt-3 mono text-[11px] text-bone/50">{it.at ? `as of ${String(it.at).slice(0, 10)}` : 'no timestamp — connector not enabled'}</dd>
              <dd className="mt-1 text-[12px] muted">{it.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------- Section 6 ---------- */
function Why() {
  return (
    <section className="section wrap" aria-label={`Why ${BRAND} exists`}>
      <p className="label label-cyan">Why {BRAND} exists</p>
      <blockquote className="display text-[clamp(1.6rem,3.6vw,3.2rem)] mt-6 max-w-5xl text-bone/90">
        The same molecular claim can appear in a paper, a podcast, a Reddit story and hundreds of short-form posts. Those are not the same kind of evidence. {BRAND} connects them without collapsing them together.
      </blockquote>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/methodology" className="btn">Read the methodology</Link>
        <Link to="/coverage" className="btn">What we can and cannot see</Link>
      </div>
    </section>
  )
}
