import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { buildChain, mulberry32 } from '../chain/geometry'
import { COMPOUND_BY_SLUG } from '~/data/compounds'
import { usePostAllowed } from '~/motion/useReducedMotion'

interface Props {
  progress: RefObject<number>
  pointer: RefObject<{ x: number; y: number }>
  /** Called with the normalised phase so DOM captions can react without React re-renders. */
  onPhase?: (p: number) => void
}

const FIT = 5.6 // world radius of the chain

// Camera path: full view (chain upper-right of the headline) → close on the N-terminus → skim THROUGH the
// structure just above the PPP hinge (residues pass at the frame edges) → out past the C-terminus → look back.
const CAM = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-5.6, -0.2, 16.0),
    new THREE.Vector3(-7.5, 1.4, 6.2),
    new THREE.Vector3(-2.4, 2.1, 3.9),
    new THREE.Vector3(1.8, 1.7, 3.5),
    new THREE.Vector3(5.8, 0.5, 4.4),
    new THREE.Vector3(8.8, 2.0, 11.5),
  ],
  false,
  'centripetal',
  0.5,
)
const LOOK = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-3.0, -1.6, 0),
    new THREE.Vector3(-2.2, 0.2, 0),
    new THREE.Vector3(0.8, -0.5, -0.4),
    new THREE.Vector3(4.0, -0.7, -0.9),
    new THREE.Vector3(2.0, 0.0, 0),
    new THREE.Vector3(0.4, 0.0, 0),
  ],
  false,
  'centripetal',
  0.5,
)

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()

export function HeroScene({ progress, pointer, onPhase }: Props) {
  const post = usePostAllowed()
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const root = useRef<THREE.Group>(null)
  const chain = useRef<THREE.Group>(null)
  const far = useRef<THREE.Points>(null)
  const mid = useRef<THREE.Points>(null)
  const near = useRef<THREE.Group>(null)
  const focus = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const smooth = useRef({ p: 0, px: 0, py: 0 })

  const geometry = useMemo(() => buildChain(COMPOUND_BY_SLUG['bpc-157']), [])

  const { farDust, midDust, haze } = useMemo(() => {
    const rnd = mulberry32(0x43595241)
    const farN = 1400
    const farDust = new Float32Array(farN * 3)
    for (let i = 0; i < farN; i++) {
      farDust[i * 3] = (rnd() - 0.5) * 90
      farDust[i * 3 + 1] = (rnd() - 0.5) * 50
      farDust[i * 3 + 2] = -18 - rnd() * 40
    }
    const midN = 320
    const midDust = new Float32Array(midN * 3)
    for (let i = 0; i < midN; i++) {
      midDust[i * 3] = (rnd() - 0.5) * 34
      midDust[i * 3 + 1] = (rnd() - 0.5) * 18
      midDust[i * 3 + 2] = -4 + rnd() * 10
    }
    const haze: [number, number, number][] = []
    for (let i = 0; i < 6; i++) haze.push([(rnd() - 0.5) * 18, (rnd() - 0.5) * 8, 4 + rnd() * 4])
    return { farDust, midDust, haze }
  }, [])

  const hazeTex = useMemo(() => {
    if (typeof document === 'undefined') return null
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(95,227,255,0.28)')
    g.addColorStop(0.5, 'rgba(138,99,255,0.10)')
    g.addColorStop(1, 'rgba(34,71,214,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])

  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    const s = smooth.current
    const target = progress.current ?? 0
    // weighted, slightly lagging camera so the scrub never feels twitchy
    s.p += (target - s.p) * Math.min(1, dt * 4.5)
    s.px += ((pointer.current?.x ?? 0) - s.px) * Math.min(1, dt * 3)
    s.py += ((pointer.current?.y ?? 0) - s.py) * Math.min(1, dt * 3)
    const p = THREE.MathUtils.clamp(s.p, 0, 1)
    onPhase?.(p)

    CAM.getPointAt(p, _pos)
    LOOK.getPointAt(p, _look)
    // portrait phones: back the camera off and lift the chain above the headline while the copy is visible
    const portrait = size.width / size.height < 0.8
    if (portrait) {
      _pos.z += 3.5 * (1 - p * 0.5)
      _look.y -= 1.9 * (1 - Math.min(1, p / 0.3))
    }
    // pointer parallax: small camera slide + root tilt (±2°)
    _pos.x += s.px * 0.35
    _pos.y -= s.py * 0.25
    camera.position.copy(_pos)
    camera.lookAt(_look)
    focus.copy(_look)

    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.degToRad(s.px * 2)
      root.current.rotation.x = THREE.MathUtils.degToRad(-s.py * 2)
    }
    if (chain.current) {
      // slow, weighted float — never a bounce
      chain.current.position.y = Math.sin(t.current * 0.35) * 0.18
      chain.current.rotation.x = Math.sin(t.current * 0.12) * 0.08 + p * 0.9
      chain.current.rotation.z = Math.sin(t.current * 0.09) * 0.03
    }
    if (far.current) far.current.position.x = -p * 6 + s.px * 0.6
    if (mid.current) {
      mid.current.position.x = -p * 2 + s.px * 1.1
      mid.current.rotation.z = t.current * 0.006
    }
    if (near.current) near.current.position.x = p * 5 + s.px * 1.6
  })

  return (
    <group ref={root}>
      <color attach="background" args={['#0A0B0E']} />
      <fog attach="fog" args={['#0A0B0E', 14, 46]} />
      <Environment resolution={64} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={2.2} color="#5FE3FF" rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={1.2} color="#8A63FF" rotation-y={Math.PI / 2} position={[-6, 1, -1]} scale={[12, 3, 1]} />
          <Lightformer intensity={0.9} color="#F2EEE6" rotation-y={-Math.PI / 2} position={[7, 2, 0]} scale={[10, 2, 1]} />
          <Lightformer intensity={0.6} color="#2247D6" rotation-x={-Math.PI / 2} position={[0, -6, 0]} scale={[12, 12, 1]} />
        </group>
      </Environment>

      {/* far dust: parallax plane, cool */}
      <points ref={far}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farDust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#7FB7D9" size={0.075} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
      </points>
      {/* mid dust: sparse, closer, slightly violet */}
      <points ref={mid}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[midDust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#B9A2FF" size={0.05} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
      </points>

      <group ref={chain}>
        <ChainRenderer geometry={geometry} progress={1} lod={0} fitMode="fixed" fit={FIT} rotate={0} tint="#5FE3FF" accent="#8A63FF" intensity={1.15} tilt={[0.12, 0.18, 0]} markers={false} />
      </group>

      {/* near haze sprites */}
      <group ref={near}>
        {hazeTex &&
          haze.map((h, i) => (
            <sprite key={i} position={h} scale={[9 + (i % 3) * 3, 9 + (i % 3) * 3, 1]}>
              <spriteMaterial map={hazeTex} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          ))}
      </group>

      {post && (
        <EffectComposer multisampling={0}>
          <DepthOfField target={focus} focalLength={0.028} bokehScale={1.5} height={540} />
          <Bloom intensity={0.55} luminanceThreshold={0.5} luminanceSmoothing={0.35} mipmapBlur />
          <Noise opacity={0.07} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.22} darkness={0.9} />
        </EffectComposer>
      )}
    </group>
  )
}
