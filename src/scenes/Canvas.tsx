import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei/web/View'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useCanvasAllowed } from '~/motion/useReducedMotion'

/**
 * One persistent R3F canvas per document, rendered fixed behind the page.
 * Sections declare a <SceneView> (drei <View>) which tracks a DOM rect and draws into the shared context.
 *
 * Hero and TRUTH (LOD-0, with postprocessing) use their own <Lod0Canvas> because EffectComposer
 * inside a scissored View composites unreliably; everything else (cards, rigs, atlas nodes) shares this one.
 */
export function GlobalCanvas() {
  const allowed = useCanvasAllowed()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (allowed) setReady(true)
  }, [allowed])
  if (!ready) return null
  return (
    <Canvas
      id="cyravon-global-canvas"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
      frameloop="always"
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
    >
      <View.Port />
    </Canvas>
  )
}

interface SceneViewProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Rendered when the canvas path is unavailable (SSR, reduced motion, low power). */
  fallback?: ReactNode
}

/** A DOM rectangle that the shared canvas draws into. */
export function SceneView({ children, className, style, fallback }: SceneViewProps) {
  const allowed = useCanvasAllowed()
  if (!allowed) return <div className={className} style={style}>{fallback}</div>
  return (
    <View className={className} style={style}>
      {children}
    </View>
  )
}

interface Lod0Props {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onFirstFrame?: () => void
  dpr?: [number, number]
  cameraZ?: number
}

/** Dedicated canvas for LOD-0 scenes (hero, TRUTH tab) that carry postprocessing. */
export function Lod0Canvas({ children, className, style, onFirstFrame, dpr = [1, 1.5], cameraZ = 14 }: Lod0Props) {
  const fired = useRef(false)
  return (
    <Canvas
      className={className}
      style={style}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      dpr={dpr}
      frameloop="always"
      camera={{ fov: 38, near: 0.1, far: 200, position: [0, 0, cameraZ] }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0A0B0E', 0)
        if (!fired.current) {
          fired.current = true
          requestAnimationFrame(() => requestAnimationFrame(() => onFirstFrame?.()))
        }
      }}
    >
      {children}
    </Canvas>
  )
}
