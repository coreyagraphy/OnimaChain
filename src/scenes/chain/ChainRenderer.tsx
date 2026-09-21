import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei/web/Html'
import { CLASS_COLORS, mulberry32, sizeRadius, type ChainGeometry } from './geometry'
import { HOTSPOT_RULES } from './hotspots'
import { atomMaps, bondMaps } from './textures'
import { useQuality } from '~/motion/useReducedMotion'

export interface ChainRendererProps {
  geometry: ChainGeometry
  /** 0 → scattered, 1 → assembled. A ref is read every frame (scroll scrub); a number is static. */
  progress?: number | RefObject<number>
  tint?: string
  accent?: string
  /** 0 = full side chains + hotspots; 1 = backbone + hotspots; 2 = backbone only. */
  lod?: 0 | 1 | 2
  intensity?: number
  /** Idle rotation speed (rad/s). */
  rotate?: number
  /** 'viewport': fit is a fraction of the current viewport (cards/rigs). 'fixed': fit is a world radius (TRUTH). */
  fitMode?: 'viewport' | 'fixed'
  /** Fraction of viewport (viewport mode) or world-space radius (fixed mode). */
  fit?: number
  /** Extra time scale for tempo variations. */
  tempo?: number
  /** Render HTML hotspot labels (dossier viewer). */
  labels?: boolean
  /** Lower segment counts and drop decorative lines. */
  reducedEffects?: boolean
  /** Static tilt of the whole chain (radians). */
  tilt?: [number, number, number]
  /** Draw hotspot ring markers (off in the cinematic hero). */
  markers?: boolean
  /** Signal light: a window of residues (by index) lifted toward the tint. Read every frame; null = no highlight. */
  highlight?: RefObject<Highlight | null>
  /** 0..1 global dim (provenance open dims the molecule while evidence comes forward). Read every frame. */
  dim?: RefObject<number>
  /** false = the parent scene supplies the full light rig (e.g. the movable key light on product pages). */
  ownLights?: boolean
  /** Tracks one residue in world space (for Look closer / What is this?). */
  anchorRef?: RefObject<THREE.Object3D | null>
  /** Residue index the anchor follows. Read every frame. */
  anchorIndex?: RefObject<number>
}

export interface Highlight {
  /** Residue index at the centre of the lit window (fractional allowed). */
  center: number
  /** Half-width in residues. */
  width: number
  /** 0..1 lift toward the tint colour. */
  strength: number
  /** Optional explicit residue indices (theme focus). Overrides the window when set. */
  indices?: number[]
}

const STAGGER = 3 // residues in flight at once
const TUBE_RADIAL = 8
const V = new THREE.Vector3()
const S = new THREE.Vector3()
const M = new THREE.Matrix4()
const Q = new THREE.Quaternion()
const C = new THREE.Color()
const TINT = new THREE.Color()

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function ChainRenderer({
  geometry: g,
  progress = 1,
  tint = '#5FE3FF',
  accent = '#8A63FF',
  lod = 0,
  intensity = 1,
  rotate = 0.12,
  fitMode = 'viewport',
  fit = 0.8,
  tempo = 1,
  labels = false,
  reducedEffects = false,
  tilt = [0.25, 0.35, 0],
  markers: showMarkers = true,
  highlight,
  dim,
  ownLights = true,
  anchorRef,
  anchorIndex,
}: ChainRendererProps) {
  const group = useRef<THREE.Group>(null)
  const scaler = useRef<THREE.Group>(null)
  const inst = useRef<THREE.InstancedMesh>(null)
  const tube = useRef<THREE.Mesh>(null)
  const dash = useRef<THREE.Line>(null)
  const markers = useRef<THREE.Group>(null)
  const decor = useRef<THREE.Group>(null)
  const signalOrb = useRef<THREE.Mesh>(null)
  const signalLight = useRef<THREE.PointLight>(null)

  const n = g.length
  const q = useQuality()
  const texSize = q.tier === 'high' ? 512 : q.tier === 'mid' ? 256 : 128
  const atomTex = useMemo(() => (lod === 2 ? null : atomMaps(texSize)), [lod, texSize])
  const bondTex = useMemo(() => (lod === 2 ? null : bondMaps(texSize)), [lod, texSize])
  const spins = useMemo(() => {
    const rnd = mulberry32(0x5350494e ^ n)
    return Array.from({ length: n }, () => new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * Math.PI * 2, rnd() * Math.PI * 2, rnd() * Math.PI * 2)))
  }, [n])
  const fixedScale = fit / g.bounds.radius
  // After the [0, π/2, 0] axis swap, local (x, y, z) → world (z, y, -x); offset the centre accordingly.
  const centerOffsetRotated = useMemo(
    () => new THREE.Vector3(-g.bounds.center[2], -g.bounds.center[1], g.bounds.center[0]),
    [g],
  )

  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) pts.push(new THREE.Vector3(g.ca[i * 3], g.ca[i * 3 + 1], g.ca[i * 3 + 2]))
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5)
  }, [g, n])

  const tubularSegments = Math.max(8, n * (reducedEffects ? 4 : 10))
  const tubeGeo = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, tubularSegments, g.placeholder ? 0.35 : 0.5, TUBE_RADIAL, false)
    geo.setDrawRange(0, 0)
    return geo
  }, [curve, tubularSegments, g.placeholder])

  // Dashed line: the placeholder helix, or (LOD 0) a ghost of the target backbone that fades as the chain assembles.
  const dashLine = useMemo(() => {
    if (!g.placeholder && lod !== 0) return null
    const pts = curve.getPoints(n * 6)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({ color: tint, dashSize: 1.2, gapSize: 1.4, transparent: true, opacity: 0.4 })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [g.placeholder, curve, n, tint, lod])

  // H-bond visual (i → i-4) at LOD 0 for helical stretches; broken at prolines.
  const hbond = useRef<THREE.LineSegments>(null)
  const hbondGeo = useMemo(() => {
    if (lod !== 0 || g.placeholder || n < 5 || g.bridges.length) return null
    const pos: number[] = []
    for (let i = 4; i < n; i++) {
      if (g.brokenHBonds.includes(i)) continue
      pos.push(g.ca[i * 3], g.ca[i * 3 + 1], g.ca[i * 3 + 2], g.ca[(i - 4) * 3], g.ca[(i - 4) * 3 + 1], g.ca[(i - 4) * 3 + 2])
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return geo
  }, [g, lod, n])

  const colors = useMemo(() => {
    const arr = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      c.set(g.placeholder ? tint : CLASS_COLORS[g.residues[i].cls])
      arr[i * 3] = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [g, n, tint])

  const tubeMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        normalMap: bondTex?.normal ?? null,
        normalScale: new THREE.Vector2(0.95, 0.95),
        roughnessMap: bondTex?.roughness ?? null,
        color: new THREE.Color(tint).multiplyScalar(0.42),
        emissive: new THREE.Color(tint),
        emissiveIntensity: 0.22 * intensity,
        roughness: 0.44,
        metalness: 0.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.35,
        sheen: 0.35,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color(tint),
        envMapIntensity: 1.35,
        transparent: g.placeholder,
        opacity: g.placeholder ? 0.25 : 1,
      }),
    [tint, intensity, g.placeholder, bondTex],
  )

  const sphereMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        normalMap: atomTex?.normal ?? null,
        normalScale: new THREE.Vector2(0.65, 0.65),
        roughnessMap: atomTex?.roughness ?? null,
        roughness: 0.46,
        metalness: 0.05,
        clearcoat: 0.5,
        clearcoatRoughness: 0.32,
        sheen: 0.5,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color('#DCE8EE'),
        specularIntensity: 0.9,
        envMapIntensity: 1.25,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.06 * intensity,
        vertexColors: false,
      }),
    [intensity, atomTex],
  )

  const bridgeGeos = useMemo(
    () =>
      g.bridges.map((b) => {
        const c = new THREE.CatmullRomCurve3(b.points.map((p) => new THREE.Vector3(...p)))
        return new THREE.TubeGeometry(c, 12, 0.3, 6, false)
      }),
    [g],
  )
  const tetherGeos = useMemo(
    () =>
      g.tethers.map((t) => {
        const c = new THREE.CatmullRomCurve3(t.points.map((p) => new THREE.Vector3(...p)))
        return new THREE.TubeGeometry(c, 24, 0.22, 6, false)
      }),
    [g],
  )

  const tRef = useRef(0)
  const hlWas = useRef(false)
  const scatterK = lod === 2 ? 0.3 : lod === 1 ? 0.5 : 0.55
  const [cx, cy, cz] = g.bounds.center

  useFrame((state, dt) => {
    const p = typeof progress === 'number' ? progress : (progress.current ?? 1)
    if (anchorRef?.current) {
      const ai = THREE.MathUtils.clamp(Math.round(anchorIndex?.current ?? Math.floor(n / 2)), 0, n - 1)
      anchorRef.current.position.set(g.ca[ai * 3], g.ca[ai * 3 + 1], g.ca[ai * 3 + 2])
    }
    tRef.current += dt * tempo
    // Spin the chain about its own axis (x after the axis swap), with a fixed tumble for depth.
    if (group.current && rotate) group.current.rotation.x += dt * rotate
    if (scaler.current) {
      if (fitMode === 'viewport') {
        const vp = state.viewport.getCurrentViewport(state.camera)
        // chain axis lies along x; its cross-section along y/z
        const ex = g.bounds.extent[2] // helix axis (z) → screen x
        const ey = Math.max(g.bounds.extent[0], g.bounds.extent[1])
        const s = Math.min((vp.width * fit) / ex, (vp.height * fit) / ey, (vp.height * fit * 0.9) / (ex * 0.5))
        scaler.current.scale.setScalar(s)
      } else scaler.current.scale.setScalar(fixedScale)
    }
    if (decor.current) {
      const k = Math.max(0, Math.min(1, (p - 0.8) / 0.2))
      decor.current.visible = k > 0
      decor.current.scale.setScalar(0.001 + k)
    }
    if (markers.current) {
      const pulse = 0.85 + 0.15 * Math.sin(tRef.current * 3)
      markers.current.scale.setScalar(pulse)
      markers.current.visible = p > 0.97
    }
    // A single travelling excitation gives the chain a readable pulse without making every residue glow.
    if (signalOrb.current) {
      const u = (tRef.current * (0.045 + tempo * 0.025)) % 1
      signalOrb.current.position.copy(curve.getPointAt(u))
      const pulse = 0.72 + Math.sin(tRef.current * 4.2) * 0.18
      signalOrb.current.scale.setScalar(pulse * (lod === 2 ? 0.58 : 0.86))
      signalOrb.current.visible = p > 0.82
      if (signalLight.current) signalLight.current.intensity = (2.4 + 1.2 * Math.sin(tRef.current * 4.2)) * intensity
    }
    if (hbond.current) {
      const m = hbond.current.material as THREE.LineBasicMaterial
      m.opacity = 0.2 * Math.max(0, (p - 0.92) / 0.08)
      hbond.current.visible = p > 0.92
    }
    // Tube reveal
    if (tube.current) {
      const assembled = Math.floor(Math.max(0, p * (n + STAGGER) - STAGGER))
      const frac = n > 1 ? Math.min(1, assembled / (n - 1)) : p
      const segs = Math.floor(frac * tubularSegments)
      tubeGeo.setDrawRange(0, segs * TUBE_RADIAL * 6)
    }
    if (dash.current && dash.current.material instanceof THREE.LineDashedMaterial) {
      dash.current.material.opacity = g.placeholder ? 0.35 + 0.15 * Math.sin(tRef.current * 1.4) : 0.22 * (1 - p)
      dash.current.visible = g.placeholder || p < 0.98
    }
    // Residue spheres: scatter → target with N→C stagger
    if (inst.current) {
      for (let i = 0; i < n; i++) {
        const raw = p * (n + STAGGER) - i
        const t = easeOutCubic(Math.max(0, Math.min(1, raw / STAGGER)))
        const r = g.residues[i]
        // Cards keep scatter close so the card never reads as empty
        const sx = cx + (g.scatter[i * 3] - cx) * scatterK
        const sy = cy + (g.scatter[i * 3 + 1] - cy) * scatterK
        const sz = cz + (g.scatter[i * 3 + 2] - cz) * scatterK
        const tx = g.ca[i * 3], ty = g.ca[i * 3 + 1], tz = g.ca[i * 3 + 2]
        // Drift while scattered so nothing sits still
        const drift = (1 - t) * 1.5
        V.set(
          sx + Math.sin(tRef.current * 0.7 + i) * drift + (tx - sx) * t,
          sy + Math.cos(tRef.current * 0.5 + i * 1.3) * drift + (ty - sy) * t,
          sz + Math.sin(tRef.current * 0.6 + i * 0.7) * drift + (tz - sz) * t,
        )
        const base = lod === 0 ? sizeRadius(r.size) * 0.72 : lod === 1 ? 0.7 : 0.55
        const s = g.placeholder ? 0.45 : base * (0.6 + 0.4 * t)
        S.setScalar(s)
        M.compose(V, spins[i] ?? Q, S)
        inst.current.setMatrixAt(i, M)
      }
      inst.current.instanceMatrix.needsUpdate = true
      // Signal light: lift the highlighted residues toward the tint (glow with hierarchy, never every atom).
      const hl = highlight?.current ?? null
      if (hl || hlWas.current) {
        const tintC = TINT.set(tint)
        for (let i = 0; i < n; i++) {
          let w = 0
          if (hl) {
            if (hl.indices) w = hl.indices.includes(i) ? 1 : 0
            else {
              const d = (i - hl.center) / Math.max(0.001, hl.width)
              w = Math.exp(-d * d * 1.6)
            }
            w *= hl.strength
          }
          C.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
          if (w > 0) C.lerp(tintC, Math.min(1, w * 0.5)).multiplyScalar(1 + w * 0.95)
          inst.current.setColorAt(i, C)
        }
        if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true
        hlWas.current = !!hl
      }
    }
    const dimK = 1 - 0.7 * THREE.MathUtils.clamp(dim?.current ?? 0, 0, 1)
    tubeMat.emissiveIntensity = 0.22 * intensity * dimK
    sphereMat.emissiveIntensity = 0.06 * intensity * dimK
    tubeMat.envMapIntensity = 1.35 * dimK
    sphereMat.envMapIntensity = 1.25 * dimK
  })

  return (
    <group>
      {ownLights && (
        <>
          <ambientLight intensity={0.28} color="#9FD8E8" />
          <directionalLight position={[4, 6, 8]} intensity={1.6} color="#F2EEE6" />
          <directionalLight position={[-6, -3, -4]} intensity={0.9} color={tint} />
          <pointLight position={[-5, -2, 4]} intensity={2.4 * intensity} color={accent} distance={30} decay={1.5} />
        </>
      )}
      <group ref={scaler} rotation={tilt}>
        <group ref={group}>
        <group rotation={[0, Math.PI / 2, 0]} position={centerOffsetRotated}>
          {anchorRef && <object3D ref={anchorRef as RefObject<THREE.Object3D>} />}
          {/* backbone */}
          <mesh ref={tube} geometry={tubeGeo} material={tubeMat} frustumCulled={false} />
          <mesh ref={signalOrb} visible={false}>
            <sphereGeometry args={[0.72, lod === 2 ? 10 : 18, lod === 2 ? 8 : 12]} />
            <meshBasicMaterial color={tint} toneMapped={false} transparent opacity={0.95} />
            {lod <= 1 && <pointLight ref={signalLight} color={tint} distance={9} decay={1.8} />}
          </mesh>
          {dashLine && <primitive ref={dash} object={dashLine} />}
          {hbondGeo && (
            <lineSegments ref={hbond} geometry={hbondGeo} visible={false}>
              <lineBasicMaterial color={tint} transparent opacity={0.18} />
            </lineSegments>
          )}
          {/* residues */}
          <instancedMesh
            ref={inst}
            args={[undefined, undefined, n]}
            frustumCulled={false}
            onUpdate={(m) => {
              if (!m.instanceColor) {
                const c = new THREE.Color()
                for (let i = 0; i < n; i++) m.setColorAt(i, c.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]))
                m.instanceColor!.needsUpdate = true
              }
            }}
          >
            <sphereGeometry args={[1, lod === 0 ? 40 : 14, lod === 0 ? 28 : 10]} />
            <primitive object={sphereMat} attach="material" />
          </instancedMesh>
          {/* bridges, tethers, metal and badges scale in with the final 20% of assembly */}
          <group ref={decor} visible={false}>
          {bridgeGeos.map((geo, i) => (
            <mesh key={`br${i}`} geometry={geo}>
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9 * intensity} roughness={0.3} />
            </mesh>
          ))}
          {tetherGeos.map((geo, i) => (
            <mesh key={`te${i}`} geometry={geo}>
              <meshStandardMaterial color="#B9B4AA" emissive="#B9B4AA" emissiveIntensity={0.25} roughness={0.6} />
            </mesh>
          ))}
          {/* metal ion + coordination bonds */}
          {g.metal && lod <= 1 && (
            <group>
              <mesh position={g.metal.position}>
                <sphereGeometry args={[1.05, 24, 16]} />
                <meshStandardMaterial color="#D07A2E" emissive="#E0863A" emissiveIntensity={1.4 * intensity} metalness={0.9} roughness={0.25} />
              </mesh>
              {g.metal.residues.map((ri) => {
                const a = new THREE.Vector3(...g.metal!.position)
                const b = new THREE.Vector3(g.ca[ri * 3], g.ca[ri * 3 + 1], g.ca[ri * 3 + 2])
                const mid = a.clone().add(b).multiplyScalar(0.5)
                const dir = b.clone().sub(a)
                const len = dir.length()
                const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
                return (
                  <mesh key={ri} position={mid} quaternion={q}>
                    <cylinderGeometry args={[0.12, 0.12, len, 6]} />
                    <meshStandardMaterial color="#E0863A" emissive="#E0863A" emissiveIntensity={2 * intensity} transparent opacity={0.9} />
                  </mesh>
                )
              })}
            </group>
          )}
          {/* per-residue badges: D rings, Aib twins, terminal caps (LOD 0/1) */}
          {lod <= 1 &&
            !g.placeholder &&
            g.residues.map((r) => {
              const pos: [number, number, number] = [g.ca[r.index * 3], g.ca[r.index * 3 + 1], g.ca[r.index * 3 + 2]]
              const items = []
              if (r.chirality === 'D')
                items.push(
                  <mesh key="d" position={pos} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[sizeRadius(r.size) + 0.55, 0.12, 8, 32]} />
                    <meshStandardMaterial color="#5FD3E6" emissive="#5FD3E6" emissiveIntensity={1.2} />
                  </mesh>,
                )
              if (r.mods.includes('Aib'))
                items.push(
                  <group key="aib" position={pos}>
                    <mesh position={[1.2, 0.9, 0]}>
                      <sphereGeometry args={[0.42, 10, 8]} />
                      <meshStandardMaterial color="#9C9691" />
                    </mesh>
                    <mesh position={[-1.2, 0.9, 0]}>
                      <sphereGeometry args={[0.42, 10, 8]} />
                      <meshStandardMaterial color="#9C9691" />
                    </mesh>
                  </group>,
                )
              if (r.mods.includes('acetyl') || r.mods.includes('amide'))
                items.push(
                  <mesh key="cap" position={pos} rotation={[0, 0, r.mods.includes('acetyl') ? Math.PI : 0]}>
                    <coneGeometry args={[0.7, 1.4, 12]} />
                    <meshStandardMaterial color="#DCE8EE" emissive="#DCE8EE" emissiveIntensity={0.3} transparent opacity={0.85} />
                  </mesh>,
                )
              return items.length ? <group key={r.index}>{items}</group> : null
            })}
          </group>
          {/* hotspot labels (dossier viewer) */}
          {labels && lod === 0 && !g.placeholder && (
            <group>
              {g.hotspots.map((h, i) => (
                <Html key={`l${i}`} position={h.position} center distanceFactor={26} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
                  <div style={{ fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 11, whiteSpace: 'nowrap', color: HOTSPOT_RULES[h.kind].color, background: 'rgba(10,11,14,0.72)', border: `1px solid ${HOTSPOT_RULES[h.kind].color}55`, borderRadius: 6, padding: '3px 7px', transform: 'translateY(-26px)' }}>
                    {h.label}
                  </div>
                </Html>
              ))}
            </group>
          )}
          {/* hotspot markers */}
          {lod <= 1 && !reducedEffects && showMarkers && (
            <group ref={markers}>
              {g.hotspots.map((h, i) => {
                const rule = HOTSPOT_RULES[h.kind]
                return (
                  <mesh key={i} position={h.position}>
                    <torusGeometry args={[2.4, 0.07, 6, 40]} />
                    <meshBasicMaterial color={rule.color} transparent opacity={0.55} />
                  </mesh>
                )
              })}
            </group>
          )}
        </group>
        </group>
      </group>
    </group>
  )
}
