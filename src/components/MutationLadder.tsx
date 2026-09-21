import { useEffect, useMemo, useRef, useState } from 'react'
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

/**
 * Claim Mutation — a scrubbable before/after wording ladder. GSAP crossfades between steps;
 * removed words are struck (amber = change), added words are violet. Every non-source step carries the illustrative badge.
 */
export function MutationLadder({ claim, autoplay = false }: { claim: Claim; autoplay?: boolean }) {
  const steps = claim.mutation
  const [k, setK] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const diffs = useMemo(() => steps.map((s, i) => (i === 0 ? s.wording.split(/\s+/).map((w) => ({ w, state: 'same' as const })) : diffWords(steps[i - 1].wording, s.wording))), [steps])
  useEffect(() => {
    if (!stage.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    gsap.fromTo(stage.current.querySelectorAll('[data-tok]'), { opacity: 0, y: 8, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.02, ease: 'power2.out' })
  }, [k])
  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => setK((v) => (v + 1) % steps.length), 3200)
    return () => clearInterval(id)
  }, [autoplay, steps.length])
  const s = steps[k]
  const origin = s.sourcePmid ? STUDY_BY_PMID[s.sourcePmid] : undefined
  return (
    <div className="panel-flat p-5 md:p-7">
      <ol className="flex flex-wrap gap-2" aria-label="Mutation steps">
        {steps.map((st, i) => (
          <li key={st.stage}><button className="btn btn-sm" aria-pressed={i === k} onClick={() => setK(i)}>{i + 1}. {st.stage}</button></li>
        ))}
      </ol>
      <input type="range" min={0} max={steps.length - 1} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full mt-4 accent-cyan" aria-label="Scrub mutation steps" />
      <div ref={stage} className="mt-6 min-h-[150px]">
        <p className="label" style={{ color: k === 0 ? '#5FE3FF' : '#B9A2FF' }}>{s.stage}{k > 0 && <span className="text-bone/45"> ← {steps[k - 1].stage}</span>}</p>
        <p className={`mt-3 ${k === 0 ? 'text-lg md:text-xl leading-relaxed text-bone/90' : 'display text-[clamp(1.6rem,3.4vw,3rem)]'}`}>
          {diffs[k].map((t, i) => (
            <span key={i} data-tok className={t.state === 'removed' ? 'line-through text-amber/70 mr-[0.3em]' : t.state === 'added' ? 'text-violet mr-[0.3em]' : 'mr-[0.3em]'}>{t.w}</span>
          ))}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          {s.sourcePmid ? <SourceBadge pmid={s.sourcePmid} verified={origin?.status === 'verified'} /> : <span className="chip chip-hollow">{ILLUSTRATIVE_BADGE}</span>}
          {s.classes.map((c) => <span key={c} className="chip chip-amber">{c}</span>)}
        </div>
        {k > 0 && <p className="mt-3 mono text-[11px] text-bone/45">struck = dropped from the previous wording · violet = added. Classification links to the previous step's text above.</p>}
      </div>
    </div>
  )
}
