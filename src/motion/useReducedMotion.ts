import { useEffect, useState } from 'react'
import { create } from 'zustand'

export type VisualMode = 'ssr' | 'static' | 'canvas'
/** Adaptive quality tier. Chosen once on the client from GPU + device signals; never exposed as a "gaming mode". */
export type QualityTier = 'low' | 'mid' | 'high'

export interface QualityProfile {
  tier: QualityTier
  /** Device-pixel-ratio clamp for LOD-0 canvases. */
  dpr: [number, number]
  /** Multiplier applied to particle / dust counts. */
  particles: number
  /** Depth-of-field allowed. */
  dof: boolean
  /** SMAA edge antialiasing pass allowed. */
  smaa: boolean
  /** Volumetric haze sprites allowed. */
  haze: boolean
  /** Contact shadows allowed. */
  shadows: boolean
}

const PROFILES: Record<QualityTier, QualityProfile> = {
  low: { tier: 'low', dpr: [1, 1.25], particles: 0.35, dof: false, smaa: false, haze: false, shadows: false },
  mid: { tier: 'mid', dpr: [1, 1.5], particles: 0.7, dof: true, smaa: false, haze: true, shadows: true },
  high: { tier: 'high', dpr: [1, 1.75], particles: 1, dof: true, smaa: true, haze: true, shadows: true },
}

interface VisualState {
  mode: VisualMode
  /** Postprocessing allowed (false on mobile / low-power / reduced motion). */
  post: boolean
  reducedMotion: boolean
  quality: QualityProfile
  /** Document visible (background tabs pause every render loop). */
  visible: boolean
  init: () => void
  setVisible: (v: boolean) => void
}

/** Reads the unmasked GPU renderer string when the browser exposes it. Never throws. */
function gpuRenderer(): string {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return 'none'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return r
  } catch {
    return 'unknown'
  }
}

function pickTier(mobile: boolean): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = navigator.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 8
  const r = gpuRenderer()
  if (r === 'none') return 'low'
  const weak = /SwiftShader|llvmpipe|Software|Intel\(R\) (HD|UHD) Graphics [456]\d\d|Mali-[4T]|Adreno \(TM\) [345]/i.test(r)
  if (mobile) return weak ? 'low' : 'mid'
  if (weak) return 'low'
  if (cores >= 8 && mem >= 8) return 'high'
  return 'mid'
}

function detect(): Pick<VisualState, 'mode' | 'post' | 'reducedMotion' | 'quality'> {
  if (typeof window === 'undefined') return { mode: 'ssr', post: false, reducedMotion: false, quality: PROFILES.mid }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const saveData = nav.connection?.saveData === true
  const lowMem = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4
  const q = new URLSearchParams(window.location.search)
  const forceStatic = q.get('static') === '1'
  // No WebGL at all (blocked, headless, very old GPU): the static SVG / poster path is the only honest option.
  const noWebGL = gpuRenderer() === 'none'
  if (reduced || saveData || lowMem || forceStatic || noWebGL) return { mode: 'static', post: false, reducedMotion: reduced, quality: PROFILES.low }
  const mobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)
  const forced = q.get('quality') as QualityTier | null
  const tier = forced && PROFILES[forced] ? forced : pickTier(mobile)
  return { mode: 'canvas', post: !mobile, reducedMotion: false, quality: PROFILES[tier] }
}

export const useVisualStore = create<VisualState>((set) => ({
  mode: 'ssr',
  post: false,
  reducedMotion: false,
  quality: PROFILES.mid,
  visible: true,
  init: () => set(detect()),
  setVisible: (visible) => set({ visible }),
}))

/** Call once on the client. Also wires background-tab pausing. */
export function initVisualMode() {
  useVisualStore.getState().init()
  const onVis = () => useVisualStore.getState().setVisible(document.visibilityState !== 'hidden')
  document.addEventListener('visibilitychange', onVis)
  onVis()
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

export function useQuality(): QualityProfile {
  return useVisualStore((s) => s.quality)
}

export function useDocumentVisible(): boolean {
  return useVisualStore((s) => s.visible)
}

/** True after hydration (so SSR and first client render match). */
export function useMounted(): boolean {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}
