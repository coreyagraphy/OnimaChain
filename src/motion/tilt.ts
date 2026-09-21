/*
 * Shared tilt input (-1..1 on each axis). Desktop: pointer position. Phones: device orientation (gyro),
 * so the 3D scenes and depth cards shift as you move the phone. Consumers damp it themselves.
 * iOS needs a permission granted from a user gesture; requestTiltPermission() is called from the age gate "Yes".
 */
export const tilt = { x: 0, y: 0, source: 'none' as 'none' | 'pointer' | 'gyro' }

let started = false
let base: { beta: number; gamma: number } | null = null

function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return
  if (!base) base = { beta: e.beta, gamma: e.gamma }
  // relative to how the phone was held when we started; ±25° maps to ±1
  tilt.x = Math.max(-1, Math.min(1, (e.gamma - base.gamma) / 25))
  tilt.y = Math.max(-1, Math.min(1, (e.beta - base.beta) / 25))
  tilt.source = 'gyro'
  writeVars()
}
function onPointer(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  tilt.x = (e.clientX / window.innerWidth - 0.5) * 2
  tilt.y = (e.clientY / window.innerHeight - 0.5) * 2
  tilt.source = 'pointer'
  writeVars()
}
let raf = 0
function writeVars() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const r = document.documentElement.style
    r.setProperty('--tilt-x', tilt.x.toFixed(3))
    r.setProperty('--tilt-y', tilt.y.toFixed(3))
  })
}

/** Start listening once on the client. Reduced-motion visitors get no tilt. */
export function startTilt() {
  if (started || typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  started = true
  window.addEventListener('pointermove', onPointer, { passive: true })
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent
  if (DOE && typeof DOE.requestPermission !== 'function') window.addEventListener('deviceorientation', onOrient, { passive: true })
}

/** iOS: must be called inside a user gesture (tap). Safe to call anywhere; resolves quietly if not needed. */
export async function requestTiltPermission() {
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent
  if (!DOE || typeof DOE.requestPermission !== 'function') return
  try {
    if ((await DOE.requestPermission()) === 'granted') window.addEventListener('deviceorientation', onOrient, { passive: true })
  } catch { /* declined: pointer/scroll depth still works */ }
}
