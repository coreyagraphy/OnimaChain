import { useEffect, useState } from 'react'
import { create } from 'zustand'

export type VisualMode = 'ssr' | 'static' | 'canvas'

interface VisualState {
  mode: VisualMode
  /** Postprocessing allowed (false on mobile / low-power / reduced motion). */
  post: boolean
  reducedMotion: boolean
  init: () => void
}

function detect(): { mode: VisualMode; post: boolean; reducedMotion: boolean } {
  if (typeof window === 'undefined') return { mode: 'ssr', post: false, reducedMotion: false }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const saveData = nav.connection?.saveData === true
  const lowMem = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4
  const forceStatic = new URLSearchParams(window.location.search).get('static') === '1'
  if (reduced || saveData || lowMem || forceStatic) return { mode: 'static', post: false, reducedMotion: reduced }
  const mobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)
  return { mode: 'canvas', post: !mobile, reducedMotion: false }
}

export const useVisualStore = create<VisualState>((set) => ({
  mode: 'ssr',
  post: false,
  reducedMotion: false,
  init: () => set(detect()),
}))

/** Call once on the client after idle. */
export function initVisualMode() {
  const run = () => useVisualStore.getState().init()
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 1500 })
  else setTimeout(run, 300)
}

export function useReducedMotion(): boolean {
  return useVisualStore((s) => s.reducedMotion)
}

/** True only on the client, after idle, when the canvas path is allowed. */
export function useCanvasAllowed(): boolean {
  return useVisualStore((s) => s.mode === 'canvas')
}

export function usePostAllowed(): boolean {
  return useVisualStore((s) => s.post)
}

/** True after hydration (so SSR and first client render match). */
export function useMounted(): boolean {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}
