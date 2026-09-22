import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei/web/View'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useCanvasAllowed, useDocumentVisible, useQuality } from '~/motion/useReducedMotion'
import { useCommerceStore } from '~/stores/commerce'

/**
 * One persistent R3F canvas per document, rendered fixed behind the page.
 * Sections declare a <SceneView> (drei <View>) which tracks a DOM rect and draws into the shared context.
 *
 * Hero and the dossier stage use their own <Lod0Canvas> for postprocessing. Product cards also use a
 * local bounded canvas so their 3D art can never draw over DOM titles, selectors, or prices.
 *
 * Every canvas pauses its render loop when the tab is hidden.
 */
export function GlobalCanvas() {
  const allowed = useCanvasAllowed()
  const visible = useDocumentVisible()
  const quickViewOpen = useCommerceStore((s) => s.quickView !== null)
  const q = useQuality()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (allowed) setReady(true)
  }, [allowed])
  if (!ready) return null
  return (
    <Canvas
      id="atlas-global-canvas"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={q.dpr}
      frameloop={visible && !quickViewOpen ? 'always' : 'never'}
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
  preserveDrawingBuffer?: boolean
}

/** Dedicated, DOM-bounded canvas for immersive scenes and visible product-card artwork. */
export function Lod0Canvas({ children, className, style, onFirstFrame, dpr, cameraZ = 14, preserveDrawingBuffer = true }: Lod0Props) {
  const fired = useRef(false)
  const visible = useDocumentVisible()
  const q = useQuality()
  const wrap = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(true)
  // Off-screen scene work pauses (generous margin so returning to a section never shows a stale frame).
  useEffect(() => {
    const el = wrap.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), { rootMargin: "400px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={wrap} className={className} style={style}>
      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer }}
        dpr={dpr ?? q.dpr}
        frameloop={visible && onScreen ? 'always' : 'never'}
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
    </div>
  )
}
