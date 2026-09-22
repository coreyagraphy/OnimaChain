import { useLayoutEffect, useRef } from 'react'

/**
 * Shrinks a one-word headline until it fits its box (long names like CEREBROLYSIN on a phone).
 * Starts from the CSS size every time, so it grows back on wider screens. Never goes below `min` px.
 */
export function useFitText<T extends HTMLElement>(deps: unknown[] = [], min = 22) {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = ''
      // the parent's content box (its width minus padding) is the room the word actually has
      const parent = el.parentElement
      const ps = parent ? getComputedStyle(parent) : null
      const box = parent && ps ? parent.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight) : el.clientWidth
      let size = parseFloat(getComputedStyle(el).fontSize)
      let guard = 0
      while (el.scrollWidth > box + 1 || el.getBoundingClientRect().width > box + 1 && size > min && guard++ < 40) { size *= 0.94; el.style.fontSize = `${size}px` }
    }
    fit()
    const ro = new ResizeObserver(fit)
    if (el.parentElement) ro.observe(el.parentElement)
    document.fonts?.ready.then(fit).catch(() => {})
    return () => ro.disconnect()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return ref
}
