import { useEffect, useRef } from 'react'
import { TRANSLATION_STAGES, type TranslationStage } from '~/data/claims'
import { gsap } from '~/motion/timeline'

interface Row { outcome: string; stages: TranslationStage[] }

/**
 * Translation Gap: Cell → Mouse → Rat → Larger animal → Human → Controlled human → Approved use, per outcome.
 * A signal physically travels between research-model nodes when the row scrolls into view.
 * Where a stage has no indexed evidence, the signal stops. Everything else is explicitly unlit.
 */
export function TranslationTrack({ rows }: { rows: Row[] }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!root.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const tracks = Array.from(root.current.querySelectorAll<HTMLElement>('[data-track]'))
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        const el = en.target as HTMLElement
        io.unobserve(el)
        const reach = Number(el.dataset.reach ?? -1)
        const pulse = el.querySelector<HTMLElement>('[data-pulse]')
        const stages = Array.from(el.querySelectorAll<HTMLElement>('[data-stage]'))
        const segs = Array.from(el.querySelectorAll<HTMLElement>('[data-seg]'))
        if (reduced || reach < 0) {
          stages.forEach((s, i) => { if (i <= reach && s.dataset.on === '1') s.dataset.lit = '1' })
          segs.forEach((s, i) => { if (i < reach) s.style.transform = 'scaleX(1)' })
          if (pulse) pulse.style.opacity = '0'
          return
        }
        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
        const n = TRANSLATION_STAGES.length
        for (let i = 0; i <= reach; i++) {
          const s = stages[i]
          if (i > 0) {
            const seg = segs[i - 1]
            tl.to(seg, { scaleX: 1, duration: 0.55 }, '>-0.05')
            if (pulse) tl.to(pulse, { left: `${((i + 0.5) / n) * 100}%`, duration: 0.55 }, '<')
          } else if (pulse) tl.set(pulse, { left: `${(0.5 / n) * 100}%`, opacity: 1 })
          tl.call(() => { if (s.dataset.on === '1') s.dataset.lit = '1' })
        }
        // the signal stops: it settles on the furthest supported stage and holds
        if (pulse) tl.to(pulse, { scale: 1.6, opacity: 0.9, duration: 0.6, ease: 'power3.out' }).to(pulse, { scale: 1, duration: 0.8 })
      })
    }, { threshold: 0.4 })
    tracks.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [rows])

  return (
    <div ref={root} className="grid gap-4">
      {rows.length === 0 && <p className="text-sm muted">No outcome has an indexed translation path.</p>}
      {rows.map((r) => {
        const lit = new Set(r.stages)
        const furthest = TRANSLATION_STAGES.reduce((acc, s, i) => (lit.has(s.id) ? i : acc), -1)
        return (
          <div key={r.outcome} className="panel p-4 md:p-5 relative overflow-hidden" data-track data-reach={furthest}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold capitalize text-bone/90">{r.outcome.replace(/-/g, ' ')}</p>
              <p className="mono text-[11px] text-bone/55">
                {furthest < 0 ? 'No stage supported by an indexed record' : `Indexed support reaches: ${TRANSLATION_STAGES[furthest].label} — the signal stops there`}
              </p>
            </div>
            <div className="relative mt-5">
              {/* travelling signal */}
              <span data-pulse aria-hidden className="absolute -top-[5px] w-3 h-3 -ml-1.5 rounded-full bg-cyan" style={{ left: '7%', opacity: 0, boxShadow: '0 0 16px 4px rgba(95,227,255,0.55), 0 0 40px 10px rgba(95,227,255,0.18)' }} />
              <ol className="grid grid-cols-7 gap-1" aria-label={`Translation stages for ${r.outcome}`}>
                {TRANSLATION_STAGES.map((s, i) => {
                  const on = lit.has(s.id)
                  return (
                    <li key={s.id} className="relative flex flex-col items-center gap-2 text-center">
                      {i > 0 && <span data-seg aria-hidden className="absolute left-[-50%] right-[50%] top-0 h-[2px] origin-left bg-cyan/70" style={{ transform: 'scaleX(0)' }} />}
                      <div className="w-full h-[2px] rounded" style={{ background: on ? 'rgba(95,227,255,0.25)' : 'rgba(242,238,230,0.08)' }} />
                      <span data-stage data-on={on ? '1' : '0'} className={`stage-dot w-2.5 h-2.5 rounded-full ${on ? '' : 'border border-bone/25'}`} style={on ? { background: 'rgba(95,227,255,0.35)' } : undefined} aria-hidden />
                      <span className={`text-[10px] leading-tight ${on ? 'text-bone/90' : 'text-bone/40'}`}>{s.label}</span>
                      <span className="sr-only">{on ? 'supported by an indexed record' : 'not supported by an indexed record'}</span>
                      {i === furthest && <span className="chip chip-cyan !text-[9px]">reached</span>}
                      {i === furthest + 1 && furthest >= 0 && <span className="chip chip-hollow !text-[9px]">signal stops</span>}
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        )
      })}
    </div>
  )
}
