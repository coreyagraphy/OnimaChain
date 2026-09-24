import { useEffect, useRef, useState } from 'react'
import { BRAND } from '~/brand'
import { requestTiltPermission } from '~/motion/tilt'

const KEY = 'age-gate-21'

/**
 * Age gate. Shown once per browser on first visit; the answer is kept in localStorage.
 * Renders nothing on the server and until mounted, so SSR and hydration always match.
 * Plain-language educational access notice. The 21+ rule is a site policy, not legal clearance.
 */
export function AgeGate() {
  const [state, setState] = useState<'unknown' | 'ask' | 'ok' | 'no'>('unknown')
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    try {
      setState(window.localStorage.getItem(KEY) === '1' ? 'ok' : 'ask')
    } catch {
      setState('ask')
    }
  }, [])
  useEffect(() => {
    if (state === 'ask' || state === 'no') document.body.dataset.depthOpen = '1'
    else delete document.body.dataset.depthOpen
    return () => { delete document.body.dataset.depthOpen }
  }, [state])
  useEffect(() => {
    if (state !== 'ask' && state !== 'no') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])
      if (!buttons.length) return
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])
  if (state === 'unknown' || state === 'ok') return null
  const accept = () => {
    // this tap is a user gesture, so iOS can ask once for motion access (phone-tilt depth); declining changes nothing else
    void requestTiltPermission()
    try { window.localStorage.setItem(KEY, '1') } catch { /* private mode: ask again next visit */ }
    setState('ok')
  }
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-5" role="dialog" aria-modal="true" aria-labelledby="age-gate-title" data-lenis-prevent>
      <div className="absolute inset-0 veil" aria-hidden />
      <div ref={panel} className="glass relative w-full max-w-[520px] rounded-3xl p-7 md:p-9 drawer-in">
        <p className="relative label label-cyan">Before you come in</p>
        {state === 'ask' ? (
          <>
            <h2 id="age-gate-title" className="relative display text-[clamp(2rem,5vw,3.2rem)] mt-3">Are you 21 or older?</h2>
            <p className="relative mt-4 text-sm text-bone/80 max-w-md">You must be 21 or older to enter. {BRAND} is for adults who want to see the science behind peptides in plain English.</p>
            <ul className="relative mt-4 grid gap-1.5 text-[13px] text-bone/65">
              <li>Everything here is for research and education. It is not medical advice.</li>
              <li>We never tell you how much to take or how to use anything.</li>
              <li>This educational site does not sell peptides or provide ordering.</li>
            </ul>
            <div className="relative mt-7 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={accept} autoFocus>Yes, I&rsquo;m 21 or older</button>
              <button className="btn" onClick={() => setState('no')}>No, I&rsquo;m not</button>
            </div>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="relative display text-[clamp(2rem,5vw,3.2rem)] mt-3">Sorry, this site is 21+.</h2>
            <p className="relative mt-4 text-sm text-bone/80 max-w-md">Come back when you are 21 or older. Thanks for being honest.</p>
            <div className="relative mt-7">
              <button className="btn btn-sm" onClick={() => setState('ask')}>Go back</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
