import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '~/motion/timeline'
import type { Claim } from '~/data/claims'
import { ILLUSTRATIVE_BADGE } from '~/data/claims'
import { SourceBadge } from './SourceBadge'
import { STUDY_BY_PMID } from '~/data/studies'

type Tok = { w: string; state: 'same' | 'removed' | 'added' }

/** Word-level diff (LCS) between two wordings. */
function diffWords(a: string, b: string): Tok[] {
  const A = a.split(/\s+/), B = b.split(/\s+/)
  const dp: number[][] = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0))
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i].toLowerCase() === B[j].toLowerCase() ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: Tok[] = []
  let i = 0, j = 0
  while (i < A.length && j < B.length) {
    if (A[i].toLowerCase() === B[j].toLowerCase()) { out.push({ w: B[j], state: 'same' }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ w: A[i], state: 'removed' }); i++ }
    else { out.push({ w: B[j], state: 'added' }); j++ }
  }
  while (i < A.length) out.push({ w: A[i++], state: 'removed' })
  while (j < B.length) out.push({ w: B[j++], state: 'added' })
  return out
}

const SPECIES = /^(rat|rats|mouse|mice|murine|rodent|rodents|cell|cells|cellular|culture|cultured|vitro|vivo|tendon|tendocytes|fibroblasts|human|humans|animal|animals)[,.;:]?$/i
const HEDGE = /^(may|might|could|suggest|suggests|suggested|appears|appeared|potentially|possibly|associated|preliminary|indicate|indicates|likely|numerically|without)[,.;:]?$/i

/**
 * Claim Mutation — a scrubbable before/after wording ladder. The diff is physical:
 * broadened phrases expand in space, a dropped species tag detaches and falls away, removed uncertainty fades
 * while the interface labels UNCERTAINTY REMOVED, amplified magnitude grows larger — always identified as mutation.
 */
export function MutationLadder({ claim, autoplay = false }: { claim: Claim; autoplay?: boolean }) {
  const steps = claim.mutation
  const [k, setK] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const diffs = useMemo(() => steps.map((s, i) => (i === 0 ? s.wording.split(/\s+/).map((w) => ({ w, state: 'same' as const })) : diffWords(steps[i - 1].wording, s.wording))), [steps])
  const s = steps[k]
  const cls = new Set(s.classes as string[])
  const broadens = cls.has('broader extrapolation')
  const speciesGone = cls.has('species omission') || cls.has('context removed')
  const uncertaintyGone = cls.has('uncertainty removed')
  const amplified = cls.has('magnitude amplified')

  useEffect(() => {
    if (!stage.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const root = stage.current
    const toks = root.querySelectorAll('[data-tok]')
    if (reduced) { gsap.set(toks, { clearProps: 'all' }); return }
    const tl = gsap.timeline()
    tl.fromTo(toks, { opacity: 0, y: 8, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.02, ease: 'power2.out' })
    // physical classes
    const grow = root.querySelectorAll('[data-grow]')
    if (grow.length) tl.fromTo(grow, { scale: 0.96 }, { scale: amplified ? 1.22 : 1.1, duration: 0.9, ease: 'power3.out' }, '-=0.2')
    const detach = root.querySelectorAll('[data-detach]')
    if (detach.length) tl.to(detach, { y: 22, rotate: 5, opacity: 0.32, duration: 1.1, ease: 'power2.in', stagger: 0.08 }, '-=0.5')
    const hedge = root.querySelectorAll('[data-hedge]')
    if (hedge.length) tl.to(hedge, { opacity: 0.22, filter: 'blur(1.5px)', duration: 1.3, ease: 'power1.inOut' }, '-=0.8')
    return () => { tl.kill() }
  }, [k, amplified])

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => setK((v) => (v + 1) % steps.length), 3600)
    return () => clearInterval(id)
  }, [autoplay, steps.length])

  const origin = s.sourcePmid ? STUDY_BY_PMID[s.sourcePmid] : undefined
  return (
    <div className="panel-flat p-5 md:p-7 relative overflow-hidden">
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: k === 0 ? '#5FE3FF' : '#8A63FF', opacity: 0.07, transition: 'background 1s' }} />
      <ol className="relative flex flex-wrap gap-2" aria-label="Mutation steps">
        {steps.map((st, i) => (
          <li key={st.stage}><button className="btn btn-sm" aria-pressed={i === k} onClick={() => setK(i)}>{i + 1}. {st.stage}</button></li>
        ))}
      </ol>
      <input type="range" min={0} max={steps.length - 1} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full mt-4 accent-cyan" aria-label="Scrub mutation steps" />
      <div ref={stage} className="relative mt-6 min-h-[170px]">
        <p className="label" style={{ color: k === 0 ? '#5FE3FF' : '#B9A2FF' }}>{s.stage}{k > 0 && <span className="text-bone/45"> ← {steps[k - 1].stage}</span>}</p>
        <p className={`mt-3 ${k === 0 ? 'text-lg md:text-xl leading-relaxed text-bone/90' : 'display text-[clamp(1.6rem,3.4vw,3rem)]'}`}>
          {diffs[k].map((t, i) => {
            const isSpecies = t.state === 'removed' && speciesGone && SPECIES.test(t.w)
            const isHedge = t.state === 'removed' && uncertaintyGone && HEDGE.test(t.w)
            const grows = t.state === 'added' && (broadens || amplified)
            const base = t.state === 'removed' ? 'line-through text-amber/70' : t.state === 'added' ? `${amplified ? 'text-amber' : 'text-violet'}` : ''
            return (
              <Fragment key={i}><span data-tok data-grow={grows ? '' : undefined} data-detach={isSpecies ? '' : undefined} data-hedge={isHedge ? '' : undefined} className={`${base} ${grows ? 'tok-grow' : ''} ${isSpecies ? 'tok-detach' : ''}`}>
                {t.w}
              </span>{' '}</Fragment>
            )
          })}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          {s.sourcePmid ? <SourceBadge pmid={s.sourcePmid} verified={origin?.status === 'verified'} /> : <span className="chip chip-hollow">{ILLUSTRATIVE_BADGE}</span>}
          {s.classes.map((c) => <span key={c} className="chip chip-amber">{c}</span>)}
          {uncertaintyGone && <span className="chip chip-amber chip-lit" style={{ boxShadow: '0 0 0 1px rgba(229,160,58,.5), 0 0 18px -4px rgba(229,160,58,.7)' }}>Uncertainty removed</span>}
          {amplified && <span className="chip chip-amber">Larger wording = mutation, not evidence</span>}
        </div>
        {k > 0 && <p className="mt-3 mono text-[11px] text-bone/45">struck = dropped from the previous wording · {amplified ? 'amber' : 'violet'} = added{speciesGone ? ' · falling tags = species/context detached' : ''}{uncertaintyGone ? ' · fading words = hedges removed' : ''}. Classification links to the previous step's text above.</p>}
      </div>
    </div>
  )
}
