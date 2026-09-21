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
import { DepthField } from '../DepthField'
import { tilt } from '~/motion/tilt'
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
  /** Hands-on state written by the HTML controls; read every frame (no React re-render per frame). */
  explore?: RefObject<ExploreState>
}

export interface ExploreState {
  /** Look closer: camera moves to an authored detail. */
  close: boolean
  /** Selected real annotation (index into geometry.hotspots) or null. */
  feature: number | null
  /** Move the light: 0..1 around the molecule. */
  light: number
  /** Turn it around mode is active (auto-turn pauses). */
  turning: boolean
  /** Increment to reset rotation. */
  resetTick: number
}

const _a = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _cam = new THREE.Vector3()
const smooth01 = (a: number, b: number, x: number) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

/**
 * Dossier structure stage.
 * Initial load: the structure assembles N→C while a wave of illumination travels along it and the exposure rises out of dark.
 * Scroll downward: the chain loosens, tilts and moves deeper into the scene.
 * Drag: weighted orbit (damped, never instantaneous). Contact shadow grounds it in space.
 */
export function ViewerScene({ geometry, tint, accent, labels, reducedEffects, autoRotate, scrollRef, dimRef, environment, rotateMode = true, explore }: Props) {
  const anchor = useRef<THREE.Object3D | null>(null)
  const anchorIndex = useRef(Math.floor(geometry.length / 2))
  const keyLight = useRef<THREE.DirectionalLight>(null)
  const closeK = useRef(0)
  const lastReset = useRef(0)
  const lightSmooth = useRef(explore?.current?.light ?? 0.3)
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
  // Look closer target: an authored residue per molecule. Prefer the first real structural feature; else the middle.
  const detailResidue = geometry.hotspots[0]?.residues[0] ?? Math.floor(n / 2)

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
  const depthFar = useRef<THREE.Group>(null)
  const depthMid = useRef<THREE.Group>(null)
  const depthNear = useRef<THREE.Group>(null)
  const tiltS = useRef({ x: 0, y: 0 })
  const small = useThree((s) => s.size.width) < 560
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

    const ex = explore?.current
    if (ex && ex.resetTick !== lastReset.current) { lastReset.current = ex.resetTick; rot.current.tx = 0; rot.current.ty = 0; rot.current.vx = 0; rot.current.vy = 0 }
    const feature = ex?.feature ?? null
    const wantClose = !!ex && (ex.close || feature !== null)
    anchorIndex.current = feature !== null ? (geometry.hotspots[feature]?.residues[0] ?? detailResidue) : detailResidue
    if (feature !== null) highlight.current = { center: 0, width: 0, strength: 0.75, indices: geometry.hotspots[feature]?.residues ?? [] }
    // one camera writer: blend between the scroll-driven overview and the close-up pose, then release
    closeK.current += ((wantClose ? 1 : 0) - closeK.current) * Math.min(1, dt * 3.2)
    const r = rot.current
    const holdStill = wantClose || !!ex?.turning
    if (autoRotate && !drag.current && !holdStill) r.ty += dt * 0.12
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
    const baseX = 0, baseY = 0.3 + leave * 0.6, baseZ = z - progress.current * 1.2 + leave * 4.5
    const k = closeK.current
    if (k > 0.001 && anchor.current) {
      anchor.current.getWorldPosition(_a)
      _dir.set(baseX, baseY, baseZ).sub(_a).normalize()
      _cam.copy(_a).addScaledVector(_dir, 4.4)
      camera.position.set(baseX + (_cam.x - baseX) * k, baseY + (_cam.y - baseY) * k, baseZ + (_cam.z - baseZ) * k)
      camera.lookAt(0 + (_a.x - 0) * k, -leave * 0.6 + (_a.y + leave * 0.6) * k, 0 + _a.z * k)
    } else {
      camera.position.set(baseX, baseY, baseZ)
      camera.lookAt(0, -leave * 0.6, 0)
    }
    // Move the light: the key light orbits the molecule; shape, grain and joins read differently as it moves
    lightSmooth.current += ((ex?.light ?? 0.3) - lightSmooth.current) * Math.min(1, dt * 6)
    if (keyLight.current) {
      const a = lightSmooth.current * Math.PI * 2
      keyLight.current.position.set(Math.cos(a) * 9, 5 + Math.sin(a * 2) * 1.5, Math.sin(a) * 9)
    }
    // pointer / phone tilt: each depth band shifts by a different amount so the stage reads as real space
    const tlx = state.pointer.x * 0.6 + tilt.x, tly = state.pointer.y * 0.4 + tilt.y
    tiltS.current.x += (tlx - tiltS.current.x) * Math.min(1, dt * 2.5); tiltS.current.y += (tly - tiltS.current.y) * Math.min(1, dt * 2.5)
    if (depthFar.current) { depthFar.current.position.set(tiltS.current.x * 0.8, tiltS.current.y * 0.5, 0); depthFar.current.rotation.z += dt * 0.004 }
    if (depthMid.current) depthMid.current.position.set(tiltS.current.x * 1.8, tiltS.current.y * 1.2, 0)
    if (depthNear.current) depthNear.current.position.set(tiltS.current.x * 3.4, tiltS.current.y * 2.2, 0)
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
      <ambientLight intensity={0.1} color={envSupport} />
      <directionalLight ref={keyLight} position={[5, 6, 6]} intensity={2.4} color="#F2EEE6" />
      <directionalLight position={[-4, -2, 6]} intensity={0.35} color={envSupport} />
      <directionalLight position={[-6, -3, -7]} intensity={1.6} color={envNeon} />
      <pointLight ref={signalLight} position={[2, 3, 4]} intensity={0} color={tint} distance={16} decay={1.8} />
      {backdropTex && (
        <mesh position={[10, 1, -48]} scale={[120, 95, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={backdropTex} transparent depthWrite={false} fog={false} />
        </mesh>
      )}
      {/* layered depth in the peptide's own colours: far atmosphere + twinkling mid field + a few near bokeh */}
      <group ref={depthFar}><DepthField count={small ? 140 : Math.round(420 * q.particles)} box={{ x: [-45, 45], y: [-26, 26], z: [-48, -14] }} size={[0.25, 0.8]} colorA={envNeon} colorB={envSupport} opacity={0.7} drift={1.2} speed={0.2} twinkle={0.85} glint={0.1} fade={[50, 90]} seed={5} /></group>
      <group ref={depthMid}><DepthField count={small ? 60 : Math.round(160 * q.particles)} box={{ x: [-16, 16], y: [-10, 10], z: [-10, 6] }} size={[0.08, 0.26]} colorA={envSupport} colorB="#F2EEE6" opacity={0.8} drift={0.6} speed={0.35} twinkle={0.9} glint={0.12} fade={[20, 40]} seed={9} /></group>
      <group ref={depthNear}><DepthField count={small ? 8 : 22} box={{ x: [-9, 9], y: [-6, 6], z: [5, 11] }} size={[0.45, 1.2]} colorA={envNeon} colorB="#F2EEE6" opacity={0.3} drift={0.5} speed={0.25} twinkle={0.3} glint={0.05} fade={[8, 16]} seed={13} /></group>
      <group ref={orbit}>
        <ChainRenderer geometry={geometry} progress={progress} lod={0} fitMode="fixed" fit={fit} rotate={0} tint={tint} accent={accent} labels={labels} reducedEffects={reducedEffects} tilt={[0.1, 0.2, 0]} highlight={highlight} dim={dimRef} ownLights={!explore} anchorRef={anchor} anchorIndex={anchorIndex} />
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
