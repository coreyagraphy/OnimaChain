import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { Html } from '@react-three/drei/web/Html'
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer, type Highlight } from '../chain/ChainRenderer'
import { buildChain, mulberry32 } from '../chain/geometry'
import { COMPOUND_BY_SLUG } from '~/data/compounds'
import { usePostAllowed, useQuality } from '~/motion/useReducedMotion'

interface Props {
  progress: RefObject<number>
  pointer: RefObject<{ x: number; y: number }>
  /** Called with the normalised phase so DOM captions can react without React re-renders. */
  onPhase?: (p: number) => void
}

const FIT = 5.6 // world radius of the chain
const TILT: [number, number, number] = [0.12, 0.18, 0]

// Camera path: full view (chain upper-right of the headline) → close on the N-terminus → skim THROUGH the
// structure just above the PPP hinge (residues pass at the frame edges) → out past the C-terminus → look back
// as the structure resolves into research → claim → signal.
const CAM = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-5.6, -0.2, 16.0),
    new THREE.Vector3(-7.5, 1.4, 6.2),
    new THREE.Vector3(-2.4, 2.1, 3.9),
    new THREE.Vector3(1.8, 1.7, 3.5),
    new THREE.Vector3(5.8, 0.5, 4.4),
    new THREE.Vector3(9.6, 2.2, 12.4),
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
    new THREE.Vector3(3.0, 0.0, 0.6),
    new THREE.Vector3(2.2, 0.2, 1.0),
  ],
  false,
  'centripetal',
  0.5,
)

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _fwd = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3()
const smooth01 = (a: number, b: number, x: number) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

/** Radial gradient texture: used for haze sprites and the far backdrop so darkness has falloff, never flat. */
export function radialTexture(stops: Array<[number, string]>, size = 256): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [o, col] of stops) g.addColorStop(o, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Typography in space: the headline rendered to a texture and placed deep in the scene so chain residues pass in front of and behind it. */
function useTextTexture(text: string) {
  const tex = useMemo(() => {
    if (typeof document === 'undefined') return null
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 512
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])
  useEffect(() => {
    if (!tex) return
    const draw = () => {
      const c = tex.image as HTMLCanvasElement
      const ctx = c.getContext('2d')!
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.font = "800 230px 'Manrope Variable', 'Inter Variable', system-ui, sans-serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.letterSpacing = '-6px'
      ctx.fillStyle = 'rgba(242,238,230,0.96)'
      ctx.shadowColor = 'rgba(95,227,255,0.35)'
      ctx.shadowBlur = 24
      ctx.fillText(text, c.width / 2, c.height / 2 + 12)
      tex.needsUpdate = true
    }
    draw()
    document.fonts?.load("800 230px 'Manrope Variable'").then(draw).catch(() => {})
  }, [tex, text])
  return tex
}

/** A thin bond between two moving points (the resolve graph edges). */
function Bond({ a, b, color, opacity }: { a: RefObject<THREE.Vector3>; b: RefObject<THREE.Vector3>; color: string; opacity: RefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null)
  const dir = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const m = ref.current
    if (!m || !a.current || !b.current) return
    dir.copy(b.current).sub(a.current)
    const len = dir.length()
    m.position.copy(a.current).add(b.current).multiplyScalar(0.5)
    m.quaternion.setFromUnitVectors(_up.set(0, 1, 0), dir.normalize())
    m.scale.set(1, len, 1)
    ;(m.material as THREE.MeshBasicMaterial).opacity = 0.55 * (opacity.current ?? 0)
  })
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.035, 0.035, 1, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

/** Resolve-graph node offsets in camera space: [right, up, depth]. Same shape grammar as the lineage graph. */
const RESOLVE: Array<{ kind: 'research' | 'claim' | 'signal'; off: [number, number, number]; color: string; k: string; sub: string }> = [
  { kind: 'research', off: [1.4, -0.7, 10.5], color: '#5FE3FF', k: 'Research record', sub: 'verified PMID · indexed' },
  { kind: 'claim', off: [3.3, 0.3, 12.5], color: '#F2EEE6', k: 'Claim', sub: 'tracked · not labelled true/false' },
  { kind: 'signal', off: [5.1, 1.3, 14.5], color: '#B9A2FF', k: 'Human signal', sub: 'no corpus · no source access' },
]

export function HeroScene({ progress, pointer, onPhase }: Props) {
  const post = usePostAllowed()
  const q = useQuality()
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const root = useRef<THREE.Group>(null)
  const chain = useRef<THREE.Group>(null)
  const cTerm = useRef<THREE.Object3D>(null)
  const far = useRef<THREE.Points>(null)
  const mid = useRef<THREE.Points>(null)
  const near = useRef<THREE.Group>(null)
  const signalLight = useRef<THREE.PointLight>(null)
  const keyLight = useRef<THREE.DirectionalLight>(null)
  const text = useRef<THREE.Mesh>(null)
  const resolve = useRef<THREE.Group>(null)
  const resolveK = useRef(0)
  const labelGroups = useRef<Array<THREE.Group | null>>([])
  const labelEls = useRef<Array<HTMLDivElement | null>>([])
  const focus = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const smooth = useRef({ p: 0, px: 0, py: 0 })
  const highlight = useRef<Highlight | null>(null)
  const anchors = useRef([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]) // [chainEnd, research, claim, signal]
  const anchorRefs = useMemo(() => anchors.current.map((v) => ({ current: v })), [])

  const geometry = useMemo(() => buildChain(COMPOUND_BY_SLUG['bpc-157']), [])
  const n = geometry.length
  const fixedScale = FIT / geometry.bounds.radius
  const centerOffsetRotated = useMemo(() => new THREE.Vector3(-geometry.bounds.center[2], -geometry.bounds.center[1], geometry.bounds.center[0]), [geometry])
  const lastCA: [number, number, number] = [geometry.ca[(n - 1) * 3], geometry.ca[(n - 1) * 3 + 1], geometry.ca[(n - 1) * 3 + 2]]

  const { farDust, midDust, haze } = useMemo(() => {
    const rnd = mulberry32(0x43595241)
    const farN = Math.round(1400 * q.particles)
    const farDust = new Float32Array(farN * 3)
    for (let i = 0; i < farN; i++) {
      farDust[i * 3] = (rnd() - 0.5) * 90
      farDust[i * 3 + 1] = (rnd() - 0.5) * 50
      farDust[i * 3 + 2] = -18 - rnd() * 40
    }
    const midN = Math.round(320 * q.particles)
    const midDust = new Float32Array(midN * 3)
    for (let i = 0; i < midN; i++) {
      midDust[i * 3] = (rnd() - 0.5) * 34
      midDust[i * 3 + 1] = (rnd() - 0.5) * 18
      midDust[i * 3 + 2] = -4 + rnd() * 10
    }
    const haze: [number, number, number][] = []
    for (let i = 0; i < 6; i++) haze.push([(rnd() - 0.5) * 18, (rnd() - 0.5) * 8, 4 + rnd() * 4])
    return { farDust, midDust, haze }
  }, [q.particles])

  const hazeTex = useMemo(() => radialTexture([[0, 'rgba(95,227,255,0.26)'], [0.5, 'rgba(138,99,255,0.10)'], [1, 'rgba(34,71,214,0)']], 128), [])
  const backdropTex = useMemo(() => radialTexture([[0, 'rgba(34,71,214,0.22)'], [0.35, 'rgba(24,30,58,0.16)'], [0.7, 'rgba(12,13,20,0.06)'], [1, 'rgba(10,11,14,0)']], 512), [])
  const textTex = useTextTexture('TRACE THE SIGNAL')

  const born = useRef(-1)
  const t = useRef(0)
  useFrame((state, dt) => {
    t.current += dt
    if (born.current < 0) born.current = state.clock.elapsedTime
    const age = state.clock.elapsedTime - born.current
    // STATE 1: the screen begins almost black; the molecule emerges from darkness over ~2.8 s.
    const reveal = smooth01(0.15, 2.9, age)
    gl.toneMappingExposure = 0.05 + 0.95 * reveal

    const s = smooth.current
    const target = progress.current ?? 0
    // weighted, slightly lagging camera so the scrub never feels twitchy; progress, never velocity
    s.p += (target - s.p) * Math.min(1, dt * 4.2)
    s.px += ((pointer.current?.x ?? 0) - s.px) * Math.min(1, dt * 2.6)
    s.py += ((pointer.current?.y ?? 0) - s.py) * Math.min(1, dt * 2.6)
    const p = THREE.MathUtils.clamp(s.p, 0, 1)
    onPhase?.(p)

    CAM.getPointAt(p, _pos)
    LOOK.getPointAt(p, _look)
    const portrait = size.width / size.height < 0.8
    if (portrait) {
      _pos.z += 3.5 * (1 - p * 0.5)
      _look.y -= 1.9 * (1 - Math.min(1, p / 0.3))
    }
    // pointer parallax: small camera slide + root tilt (±2°); the molecule never chases the cursor
    _pos.x += s.px * 0.35
    _pos.y -= s.py * 0.25
    camera.position.copy(_pos)
    camera.lookAt(_look)
    camera.updateMatrixWorld()
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

    // SIGNAL LIGHT: a window of illumination travels N→C with the camera, so the lit residues are the ones we pass.
    const along = THREE.MathUtils.clamp((p - 0.18) / 0.6, 0, 1)
    const strength = reveal * smooth01(0.12, 0.3, p) * (1 - smooth01(0.8, 0.95, p))
    highlight.current = strength > 0.01 ? { center: along * (n - 1), width: 2.2, strength } : null
    if (signalLight.current) {
      signalLight.current.position.copy(_look).add(_up.set(0.6, 1.2, 1.6))
      signalLight.current.intensity = 5 * strength + 1.2 * reveal
    }
    // KEY LIGHT responds subtly to the pointer (light response, not object chase)
    if (keyLight.current) keyLight.current.position.set(4 + s.px * 2.5, 6 - s.py * 2, 8)

    // STATE 3: typography sits deep in the scene while the camera passes through the hinge
    if (text.current) {
      const k = smooth01(0.4, 0.55, p) * (1 - smooth01(0.72, 0.86, p)) * reveal
      const m = text.current.material as THREE.MeshBasicMaterial
      m.opacity = k
      text.current.visible = k > 0.01
      text.current.position.z = -6.2 - (1 - k) * 0.8
      const ts = portrait ? 0.62 : 1
      text.current.scale.set(11 * ts, 2.75 * ts, 1)
    }
    // STATE 4: on exit the structure resolves into research → claim → signal (laid out in camera space so it always frames)
    const rk = smooth01(0.76, 0.97, p) * reveal
    resolveK.current = rk
    if (resolve.current) resolve.current.visible = rk > 0.01
    if (rk > 0) {
      camera.getWorldDirection(_fwd)
      _right.setFromMatrixColumn(camera.matrixWorld, 0)
      _up.setFromMatrixColumn(camera.matrixWorld, 1)
      if (cTerm.current) cTerm.current.getWorldPosition(anchors.current[0])
      RESOLVE.forEach((r, i) => {
        const a = anchors.current[i + 1]
        a.copy(camera.position).addScaledVector(_fwd, r.off[2]).addScaledVector(_right, r.off[0]).addScaledVector(_up, r.off[1])
        labelGroups.current[i]?.position.copy(a)
      })
    }
    labelEls.current.forEach((el, i) => { if (el) { const k = Math.max(0, rk - i * 0.12) / (1 - i * 0.12); el.style.opacity = String(k); el.style.transform = `translateY(${(1 - k) * 10}px)` } })
  })

  const dof = post && q.dof

  return (
    <group ref={root}>
      <color attach="background" args={['#0A0B0E']} />
      <fog attach="fog" args={['#0A0B0E', 14, 48]} />
      <Environment resolution={64} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={2.2} color="#5FE3FF" rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={1.2} color="#8A63FF" rotation-y={Math.PI / 2} position={[-6, 1, -1]} scale={[12, 3, 1]} />
          <Lightformer intensity={0.9} color="#F2EEE6" rotation-y={-Math.PI / 2} position={[7, 2, 0]} scale={[10, 2, 1]} />
          <Lightformer intensity={0.6} color="#2247D6" rotation-x={-Math.PI / 2} position={[0, -6, 0]} scale={[12, 12, 1]} />
        </group>
      </Environment>
      {/* cinematic light rig: key (pointer-responsive) + rim (separation from the dark) + signal (data-driven) */}
      <directionalLight ref={keyLight} position={[4, 6, 8]} intensity={1.1} color="#F2EEE6" />
      <directionalLight position={[-7, -2, -6]} intensity={1.6} color="#5FE3FF" />
      <pointLight ref={signalLight} intensity={0} color="#8AEBFF" distance={14} decay={1.8} />

      {/* far backdrop: gradient falloff so the dark is an environment, not a void */}
      {backdropTex && (
        <mesh position={[0, 2, -62]} scale={[210, 130, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={backdropTex} transparent depthWrite={false} fog={false} />
        </mesh>
      )}

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

      {/* typography in space: behind the hinge, in front of the far residues */}
      {textTex && (
        <mesh ref={text} position={[3.2, -3.1, -6.2]} rotation={[0.18, 0.08, 0]} scale={[11, 2.75, 1]} visible={false} renderOrder={2}>
          <planeGeometry />
          <meshBasicMaterial map={textTex} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      )}

      <group ref={chain}>
        <ChainRenderer geometry={geometry} progress={1} lod={0} fitMode="fixed" fit={FIT} rotate={0} tint="#5FE3FF" accent="#8A63FF" intensity={1.15} tilt={TILT} markers={false} highlight={highlight} />
        {/* invisible tracker that mirrors ChainRenderer's transforms so we know where the C-terminus is in world space */}
        <group rotation={TILT} scale={fixedScale}>
          <group rotation={[0, Math.PI / 2, 0]} position={centerOffsetRotated}>
            <object3D ref={cTerm} position={lastCA} />
          </group>
        </group>
      </group>

      {/* STATE 4: resolve graph — molecule → research → claim → signal */}
      <group ref={resolve} visible={false}>
        <Bond a={anchorRefs[0]} b={anchorRefs[1]} color="#5FE3FF" opacity={resolveK} />
        <Bond a={anchorRefs[1]} b={anchorRefs[2]} color="#F2EEE6" opacity={resolveK} />
        <Bond a={anchorRefs[2]} b={anchorRefs[3]} color="#8A63FF" opacity={resolveK} />
        {RESOLVE.map((r, i) => (
          <ResolveNode key={r.kind} at={anchorRefs[i + 1]} color={r.color} k={resolveK} kind={r.kind} />
        ))}
        {RESOLVE.map((l, i) => (
          <group key={l.k} ref={(g) => { labelGroups.current[i] = g }}>
            <Html zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
              <div ref={(el) => { labelEls.current[i] = el }} style={{ opacity: 0, transform: 'translateY(10px)', whiteSpace: 'nowrap', paddingLeft: 34, textAlign: 'left' }}>
                <div style={{ fontFamily: 'Inter Variable, sans-serif', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: l.color }}>{l.k}</div>
                <div style={{ fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 10, color: 'rgba(242,238,230,0.55)', marginTop: 3 }}>{l.sub}</div>
              </div>
            </Html>
          </group>
        ))}
      </group>

      {/* near haze sprites (volumetric-ish depth) */}
      {q.haze && (
        <group ref={near}>
          {hazeTex &&
            haze.map((h, i) => (
              <sprite key={i} position={h} scale={[9 + (i % 3) * 3, 9 + (i % 3) * 3, 1]}>
                <spriteMaterial map={hazeTex} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
              </sprite>
            ))}
        </group>
      )}

      {post && (
        <EffectComposer multisampling={0}>
          {dof ? <DepthOfField target={focus} focalLength={0.028} bokehScale={q.tier === 'high' ? 2.2 : 1.5} height={q.tier === 'high' ? 720 : 540} /> : <></>}
          <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.4} mipmapBlur radius={0.6} />
          <Noise opacity={0.065} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.22} darkness={0.9} />
          {q.smaa ? <SMAA /> : <></>}
        </EffectComposer>
      )}
    </group>
  )
}

/** Resolve-graph node: research = sphere, claim = octahedron, signal = hollow ring (no corpus). Follows its camera-space anchor. */
function ResolveNode({ at, color, k, kind }: { at: RefObject<THREE.Vector3>; color: string; k: RefObject<number>; kind: 'research' | 'claim' | 'signal' }) {
  const g = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  useFrame((state) => {
    const v = k.current ?? 0
    if (g.current) {
      if (at.current) g.current.position.copy(at.current)
      g.current.scale.setScalar(0.001 + v)
      g.current.rotation.y = state.clock.elapsedTime * 0.35
      g.current.rotation.x = state.clock.elapsedTime * 0.2
    }
    if (mat.current) { mat.current.emissiveIntensity = (kind === 'signal' ? 0.25 : 0.9) * v; mat.current.opacity = kind === 'signal' ? 0.55 * v : v }
  })
  return (
    <group ref={g}>
      <mesh>
        {kind === 'research' ? <sphereGeometry args={[0.34, 24, 18]} /> : kind === 'claim' ? <octahedronGeometry args={[0.42, 0]} /> : <torusGeometry args={[0.4, 0.05, 10, 40]} />}
        <meshPhysicalMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0} roughness={0.25} metalness={0.15} clearcoat={1} clearcoatRoughness={0.15} transparent opacity={0} />
      </mesh>
    </group>
  )
}
