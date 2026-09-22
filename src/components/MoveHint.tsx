import { useEffect, useState } from 'react'

/*
 * "You can touch this" — a small pill over interactive molecules. Cycles a few playful lines,
 * shows a hand that mimes the gesture, and gets out of the way after the first touch.
 * On phones (where a finger on the molecule normally scrolls the page) it is a button that switches spinning on.
 */
const DESKTOP = ['Drag me. I don’t bite.', 'Go on, give me a spin.', 'I’m 3D. Prove it.', 'Grab a bond and turn me.']
const TOUCH = ['Tap here, then spin me.', 'Tap to let me move.', 'I’m 3D. Tap to prove it.']

export function MoveHint({ touch = false, hidden = false, onActivate }: { touch?: boolean; hidden?: boolean; onActivate?: () => void }) {
  const lines = touch ? TOUCH : DESKTOP
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % lines.length), 2800); return () => clearInterval(t) }, [lines.length])
  const body = (
    <>
      <span className="move-hint-hand" aria-hidden>
        <svg viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 013 0V10m0-1.5a1.5 1.5 0 013 0V11m0-1a1.5 1.5 0 013 0v4.5a6 6 0 01-6 6h-.6a6 6 0 01-4.9-2.6L4.3 14.8a1.6 1.6 0 012.5-2L9 15" /></svg>
      </span>
      <span className="move-hint-text" key={i}>{lines[i]}</span>
    </>
  )
  if (touch && onActivate) return <button type="button" className="move-hint" data-hidden={hidden ? '1' : undefined} onClick={onActivate} aria-label="Let me spin the molecule">{body}</button>
  return <div className="move-hint" data-hidden={hidden ? '1' : undefined} aria-hidden>{body}</div>
}
