import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { ContactShadows } from '@react-three/drei/core/ContactShadows'
import { EffectComposer, Bloom, Noise, Vignette, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer, type Highlight } from './ChainRenderer'
import type { ChainGeometry } from './geometry'
import { usePostAllowed, useQuality } from '~/motion/useReducedMotion'
import { radialTexture } from '../hero/HeroScene'
import { mulberry32 } from './geometry'
import type { Environment as PeptideEnvironment } from '~/data/environments'

interface Props {
  geometry: ChainGeometry
  tint: string
  accent: string
  labels: boolean
  reducedEffects: boolean
  autoRotate: boolean
  /** 0→1 scroll progress: assemble over the first half, hold after. */
  scrollRef?: RefObject<number>
  /** 0..1: provenance open dims the molecule while the evidence comes forward. */
  dimRef?: RefObject<number>
  /** Per-peptide environment: deep background, neon key, supporting light. */
  environment?: PeptideEnvironment
  /** Touch devices: when false, vertical drags scroll the page; when true, drags rotate the molecule. */
  rotateMode?: boolean
}

const smooth01 = (a: number, b: number, x: number) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

/**
 * Dossier structure stage.
 * Initial load: the structure assembles N→C while a wave of illumination travels along it and the exposure rises out of dark.
 * Scroll downward: the chain loosens, tilts and moves deeper into the scene.
 * Drag: weighted orbit (damped, never instantaneous). Contact shadow grounds it in space.
 */
export function ViewerScene({ geometry, tint, accent, labels, reducedEffects, autoRotate, scrollRef, dimRef, environment, rotateMode = true }: Props) {
  const envDeep = environment?.deep ?? '#0A0B0E'
  const envNeon = environment?.neon ?? tint
  const envSupport = environment?.support ?? accent
  const post = usePostAllowed()
  const q = useQuality()
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const orbit = useRef<THREE.Group>(null)
  const rot = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 })
  const progress = useRef(1)
  const highlight = useRef<Highlight | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const signalLight = useRef<THREE.PointLight>(null)
  const n = geometry.length

  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => {
      if (!drag.current) return
      const dx = (e.clientX - drag.current.x) * 0.008
      const dy = (e.clientY - drag.current.y) * 0.008
      rot.current.ty += dx
      rot.current.tx += dy
      rot.current.vy = dx
      rot.current.vx = dy
      drag.current = { x: e.clientX, y: e.clientY }
    }
    const up = () => { drag.current = null }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.style.cursor = 'grab'
    el.style.touchAction = rotateMode ? 'none' : 'pan-y'
    el.tabIndex = 0
    el.setAttribute('aria-label', 'Molecule viewer. Use the arrow keys to rotate.')
    const key = (e: KeyboardEvent) => {
      const step = 0.22
      if (e.key === 'ArrowLeft') rot.current.ty -= step
      else if (e.key === 'ArrowRight') rot.current.ty += step
      else if (e.key === 'ArrowUp') rot.current.tx -= step
      else if (e.key === 'ArrowDown') rot.current.tx += step
      else return
      e.preventDefault()
    }
    el.addEventListener('keydown', key)
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('keydown', key) }
  }, [gl, rotateMode])

  const fit = 4.6
  const backdropTex = useMemo(() => {
    const c = new THREE.Color(envNeon), d = new THREE.Color(envDeep)
    const rgb = (col: THREE.Color, a: number) => `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${a})`
    return radialTexture([[0, rgb(c, 0.22)], [0.35, rgb(d, 0.55)], [0.75, rgb(d, 0.25)], [1, rgb(d, 0)]], 512)
  }, [envNeon, envDeep])
  const dust = useMemo(() => {
    const rnd = mulberry32(0x444f5353)
    const m = Math.round(700 * q.particles)
    const a = new Float32Array(m * 3)
    for (let i = 0; i < m; i++) { a[i * 3] = (rnd() - 0.5) * 70; a[i * 3 + 1] = (rnd() - 0.5) * 40; a[i * 3 + 2] = -14 - rnd() * 30 }
    return a
  }, [q.particles])
  const dustRef = useRef<THREE.Points>(null)
  const born = useRef(0)
  useFrame((state, dt) => {
    if (!born.current) born.current = state.clock.elapsedTime
    const age = state.clock.elapsedTime - born.current
    // exposure rises out of darkness; the structure becomes illuminated as it assembles
    const reveal = smooth01(0.05, 1.6, age)
    gl.toneMappingExposure = 0.12 + 0.88 * reveal
    const intro = THREE.MathUtils.clamp((age - 0.2) / 2.6, 0, 1)
    const s = scrollRef?.current ?? 0
    const leave = THREE.MathUtils.clamp((s - 0.55) / 0.45, 0, 1)
    progress.current = intro * (1 - 0.55 * leave)
    // assembly wave: illumination travels N→C just ahead of the assembling residues, then fades to a resting glow
    const wave = intro < 1 ? { center: intro * (n + 3) - 1.5, width: 2.4, strength: 0.9 } : null
    const dim = THREE.MathUtils.clamp(dimRef?.current ?? 0, 0, 1)
    highlight.current = wave ?? (labels ? { center: 0, width: 0, strength: 0.55, indices: geometry.hotspots.flatMap((h) => h.residues) } : null)
    if (signalLight.current) signalLight.current.intensity = (wave ? 5 * wave.strength : 1.4) * (1 - 0.7 * dim)

    const r = rot.current
    if (autoRotate && !drag.current) r.ty += dt * 0.12
    // inertia: release keeps a little momentum, then settles
    if (!drag.current) { r.ty += r.vy * 0.8; r.tx += r.vx * 0.8; r.vy *= Math.pow(0.02, dt); r.vx *= Math.pow(0.02, dt) }
    r.x += (r.tx - r.x) * Math.min(1, dt * 5)
    r.y += (r.ty - r.y) * Math.min(1, dt * 5)
    if (orbit.current) {
      orbit.current.rotation.set(THREE.MathUtils.clamp(r.x, -1.2, 1.2) + leave * 0.35, r.y, leave * 0.12)
      orbit.current.position.y = -leave * 0.9
    }
    const long = geometry.length > 20
    const z = long ? 15.5 : 12.5
    // camera settles in on assembly, then drifts deeper as the header scrolls away
    camera.position.set(0, 0.3 + leave * 0.6, z - progress.current * 1.2 + leave * 4.5)
    camera.lookAt(0, -leave * 0.6, 0)
    if (dustRef.current) { dustRef.current.rotation.z += dt * 0.004; dustRef.current.position.x = state.pointer.x * 0.6 }
  })

  return (
    <group>
      <fog attach="fog" args={[envDeep, 12, 36]} />
      <Environment resolution={64} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={2} color={tint} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} color={accent} rotation-y={Math.PI / 2} position={[-6, 1, -1]} scale={[12, 3, 1]} />
          <Lightformer intensity={0.8} color="#F2EEE6" rotation-y={-Math.PI / 2} position={[7, 2, 0]} scale={[10, 2, 1]} />
        </group>
      </Environment>
      {/* rim: separates the structure from the dark; signal: data-driven */}
      <directionalLight position={[-6, -3, -7]} intensity={1.5} color={envSupport} />
      <directionalLight position={[5, 6, 6]} intensity={0.9} color="#F2EEE6" />
      <directionalLight position={[-3, -5, 3]} intensity={0.35} color={envNeon} />
      <pointLight ref={signalLight} position={[2, 3, 4]} intensity={0} color={tint} distance={16} decay={1.8} />
      {backdropTex && (
        <mesh position={[10, 1, -48]} scale={[120, 95, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={backdropTex} transparent depthWrite={false} fog={false} />
        </mesh>
      )}
      <points ref={dustRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry>
        <pointsMaterial color="#7FB7D9" size={0.07} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
      </points>
      <group ref={orbit}>
        <ChainRenderer geometry={geometry} progress={progress} lod={0} fitMode="fixed" fit={fit} rotate={0} tint={tint} accent={accent} labels={labels} reducedEffects={reducedEffects} tilt={[0.1, 0.2, 0]} highlight={highlight} dim={dimRef} />
      </group>
      {q.shadows && !reducedEffects && <ContactShadows position={[0, -fit - 0.9, 0]} opacity={0.5} scale={22} blur={2.6} far={7} color="#000000" frames={Infinity} resolution={512} />}
      {post && !reducedEffects && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.42} luminanceThreshold={0.6} luminanceSmoothing={0.35} mipmapBlur radius={0.55} />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.3} darkness={0.7} />
          {q.smaa ? <SMAA /> : <></>}
        </EffectComposer>
      )}
    </group>
  )
}
