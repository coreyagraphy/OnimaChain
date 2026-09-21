import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from './ChainRenderer'
import type { ChainGeometry } from './geometry'
import { usePostAllowed } from '~/motion/useReducedMotion'

interface Props {
  geometry: ChainGeometry
  tint: string
  accent: string
  labels: boolean
  reducedEffects: boolean
  autoRotate: boolean
  /** 0→1 scroll progress: assemble over the first half, hold after. */
  scrollRef?: RefObject<number>
}

/** Dossier structure scene: scroll-tied assemble/hold + orbit on drag. */
export function ViewerScene({ geometry, tint, accent, labels, reducedEffects, autoRotate, scrollRef }: Props) {
  const post = usePostAllowed()
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const orbit = useRef<THREE.Group>(null)
  const rot = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const progress = useRef(1)
  const drag = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => {
      if (!drag.current) return
      rot.current.ty += (e.clientX - drag.current.x) * 0.008
      rot.current.tx += (e.clientY - drag.current.y) * 0.008
      drag.current = { x: e.clientX, y: e.clientY }
    }
    const up = () => { drag.current = null }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.style.cursor = 'grab'
    el.style.touchAction = 'pan-y'
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up) }
  }, [gl])

  const fit = 4.2
  const born = useRef(0)
  useFrame((state, dt) => {
    if (!born.current) born.current = state.clock.elapsedTime
    // Assemble over ~2.6s after mount; as the header scrolls away (s > 0.6) the chain loosens again.
    const age = state.clock.elapsedTime - born.current
    const intro = THREE.MathUtils.clamp((age - 0.2) / 2.6, 0, 1)
    const s = scrollRef?.current ?? 0
    const leave = THREE.MathUtils.clamp((s - 0.6) / 0.4, 0, 1)
    progress.current = intro * (1 - 0.55 * leave)
    const r = rot.current
    if (autoRotate && !drag.current) r.ty += dt * 0.12
    r.x += (r.tx - r.x) * Math.min(1, dt * 6)
    r.y += (r.ty - r.y) * Math.min(1, dt * 6)
    if (orbit.current) orbit.current.rotation.set(THREE.MathUtils.clamp(r.x, -1.2, 1.2), r.y, 0)
    const long = geometry.length > 20
    const z = long ? 15.5 : 12.5
    camera.position.set(0, 0.3, z - progress.current * 1.2)
    camera.lookAt(0, 0, 0)
  })

  return (
    <group>
      <fog attach="fog" args={['#0A0B0E', 12, 34]} />
      <Environment resolution={64} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={2} color={tint} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} color={accent} rotation-y={Math.PI / 2} position={[-6, 1, -1]} scale={[12, 3, 1]} />
          <Lightformer intensity={0.8} color="#F2EEE6" rotation-y={-Math.PI / 2} position={[7, 2, 0]} scale={[10, 2, 1]} />
        </group>
      </Environment>
      <group ref={orbit}>
        <ChainRenderer geometry={geometry} progress={progress} lod={0} fitMode="fixed" fit={fit} rotate={0} tint={tint} accent={accent} labels={labels} reducedEffects={reducedEffects} tilt={[0.1, 0.2, 0]} />
      </group>
      {post && !reducedEffects && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.3} darkness={0.7} />
        </EffectComposer>
      )}
    </group>
  )
}
