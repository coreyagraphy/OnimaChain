import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { buildChain } from '../chain/geometry'
import { DepthField } from '../DepthField'
import { COMPOUND_BY_SLUG } from '~/data/compounds'
import { environmentFor } from '~/data/environments'
import { usePostAllowed, useQuality } from '~/motion/useReducedMotion'
import { tilt } from '~/motion/tilt'

/*
 * Bond Theory stage: up to four molecular stations in ONE canvas with ONE shared light rig.
 * Each station keeps its own backdrop glow and colour; the active station comes forward and brightens,
 * the others stay visible but quieter. A dashed link between two stations appears ONLY when a checked
 * study looked at both (it is a documented comparison, not a chemical bond and not a success signal).
 */
interface Props {
  slugs: string[]
  active: number
  /** Pairs of station indexes that share a checked study. */
  links: Array<[number, number]>
  /** Phones show one station at a time. */
  single: boolean
}

function Station({ slug, x, activeRef, index }: { slug: string; x: number; activeRef: RefObject<number>; index: number }) {
  const c = COMPOUND_BY_SLUG[slug]
  const env = environmentFor(slug)
  const geometry = useMemo(() => buildChain(c), [c])
  // one shared world scale so a 3-residue peptide is small and a 43-residue one is long — sizes stay honest; long chains are capped to fit
  const fit = Math.min(3.3, Math.max(1.2, geometry.bounds.radius * 0.27))
  const g = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)
  const dim = useRef(0)
  const k = useRef(0)
  const halo = useMemo(() => {
    if (typeof document === 'undefined') return null
    const cv = document.createElement('canvas'); cv.width = cv.height = 256
    const ctx = cv.getContext('2d')!
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, env.neon + 'AA'); grad.addColorStop(0.45, env.neon + '33'); grad.addColorStop(1, env.neon + '00')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [env.neon])
  useFrame((state, dt) => {
    const on = activeRef.current === index ? 1 : 0
    k.current += (on - k.current) * Math.min(1, dt * 4)
    dim.current = 0.55 * (1 - k.current)
    if (g.current) {
      g.current.position.set(x, 0.4 + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.15, k.current * 1.1)
      g.current.scale.setScalar(0.9 + k.current * 0.18)
      g.current.rotation.y += dt * (0.1 + k.current * 0.1)
    }
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + k.current * 0.5
  })
  return (
    <group>
      {halo && (
        <mesh ref={glow} position={[x, 0, -6]} scale={[11, 11, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4} />
        </mesh>
      )}
      <group ref={g}>
        <ChainRenderer geometry={geometry} progress={1} lod={0} fitMode="fixed" fit={fit} rotate={0} tint={env.neon} accent={env.support} intensity={1.05} tilt={[0.15, 0.3, 0]} markers={false} ownLights={false} dim={dim} />
      </group>
    </group>
  )
}

function Link({ a, b, xs }: { a: number; b: number; xs: number[] }) {
  const line = useMemo(() => {
    const pts = [new THREE.Vector3(xs[a], -2.6, 0), new THREE.Vector3((xs[a] + xs[b]) / 2, -3.4, 0), new THREE.Vector3(xs[b], -2.6, 0)]
    const geo = new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(pts[0], pts[1], pts[2]).getPoints(32))
    const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: '#F2EEE6', dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.55 }))
    l.computeLineDistances()
    return l
  }, [a, b, xs])
  return <primitive object={line} />
}

export function BondStage({ slugs, active, links, single }: Props) {
  const post = usePostAllowed()
  const q = useQuality()
  const camera = useThree((s) => s.camera)
  const activeRef = useRef(active)
  activeRef.current = active
  const shown = single ? (slugs[active] ? [slugs[active]] : []) : slugs
  const spacing = 6.2
  const xs = shown.map((_, i) => (i - (shown.length - 1) / 2) * spacing)
  const cam = useRef({ x: 0, y: 0 })
  useFrame((_, dt) => {
    // camera leans toward the active station and with tilt; never chases the pointer
    const targetX = single ? 0 : (xs[active] ?? 0) * 0.25 + tilt.x * 0.8
    cam.current.x += (targetX - cam.current.x) * Math.min(1, dt * 2.5)
    cam.current.y += (-tilt.y * 0.5 - cam.current.y) * Math.min(1, dt * 2.5)
    const z = single ? 9.5 : 7.5 + shown.length * 1.9
    camera.position.set(cam.current.x, 0.6 + cam.current.y, z)
    camera.lookAt(cam.current.x * 0.6, 0, 0)
  })
  return (
    <group>
      <Environment resolution={64} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={1.6} color="#5FE3FF" rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[14, 10, 1]} />
          <Lightformer intensity={0.9} color="#F2EEE6" rotation-y={-Math.PI / 2} position={[9, 2, 0]} scale={[10, 2, 1]} />
        </group>
      </Environment>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 7, 8]} intensity={2.2} color="#F2EEE6" />
      <directionalLight position={[-4, -2, 6]} intensity={0.35} color="#8AEFFF" />
      <directionalLight position={[-6, -3, -7]} intensity={1.4} color="#AE66FF" />
      <DepthField count={single ? 120 : Math.round(420 * q.particles)} box={{ x: [-40, 40], y: [-22, 22], z: [-40, -10] }} size={[0.4, 1.5]} colorA="#6FA8FF" colorB="#C49BFF" opacity={0.9} drift={1.4} speed={0.2} twinkle={0.9} glint={0.16} fade={[50, 90]} seed={71} />
      <DepthField count={single ? 50 : 140} box={{ x: [-20, 20], y: [-10, 10], z: [-8, 6] }} size={[0.14, 0.5]} colorA="#5FE3FF" colorB="#F2EEE6" opacity={0.9} drift={0.8} speed={0.4} twinkle={0.95} glint={0.2} fade={[20, 40]} seed={73} />
      {shown.map((s, i) => <Station key={s} slug={s} x={xs[i]} activeRef={activeRef} index={single ? active : i} />)}
      {!single && links.map(([a, b]) => <Link key={`${a}-${b}`} a={a} b={b} xs={xs} />)}
      {post && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.35} mipmapBlur radius={0.55} />
          <Vignette eskil={false} offset={0.3} darkness={0.7} />
        </EffectComposer>
      )}
    </group>
  )
}
