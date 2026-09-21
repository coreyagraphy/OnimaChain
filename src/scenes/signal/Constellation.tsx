import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mulberry32 } from '../chain/geometry'
import { useQuality } from '~/motion/useReducedMotion'

/**
 * Signal constellation as an observatory data field — not a planetarium.
 * Three depth layers of reference dust (far / mid / near), a reticle of concentric rings, radial gridlines,
 * weighted pointer parallax. The report-point buffer is allocated with length 0 on purpose: no corpus, no points.
 * When a corpus exists, reports enter as spatial points; echoed reports cluster, independent origins stay apart.
 */
export function Constellation() {
  const q = useQuality()
  const root = useRef<THREE.Group>(null)
  const far = useRef<THREE.Points>(null)
  const mid = useRef<THREE.Points>(null)
  const near = useRef<THREE.Points>(null)
  const layers = useMemo(() => {
    const rnd = mulberry32(7)
    const mk = (n: number, spread: [number, number], z: [number, number]) => {
      const a = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) { a[i * 3] = (rnd() - 0.5) * spread[0]; a[i * 3 + 1] = (rnd() - 0.5) * spread[1]; a[i * 3 + 2] = z[0] + rnd() * (z[1] - z[0]) }
      return a
    }
    return {
      far: mk(Math.round(900 * q.particles), [70, 40], [-40, -18]),
      mid: mk(Math.round(360 * q.particles), [40, 22], [-14, -4]),
      near: mk(Math.round(90 * q.particles), [22, 12], [-2, 4]),
    }
  }, [q.particles])
  const reports = useMemo(() => new Float32Array(0), [])
  const sm = useRef({ x: 0, y: 0 })
  useFrame((state, dt) => {
    const s = sm.current
    s.x += (state.pointer.x - s.x) * Math.min(1, dt * 2.2)
    s.y += (state.pointer.y - s.y) * Math.min(1, dt * 2.2)
    if (root.current) { root.current.rotation.z += dt * 0.006; root.current.rotation.y = s.x * 0.06; root.current.rotation.x = -s.y * 0.04 }
    if (far.current) far.current.position.x = s.x * 0.4
    if (mid.current) mid.current.position.x = s.x * 1.1
    if (near.current) { near.current.position.x = s.x * 2.2; near.current.position.y = -s.y * 1.2 }
  })
  const rings = [2.5, 5, 8, 11.5]
  return (
    <group ref={root}>
      <fog attach="fog" args={['#0A0B0E', 10, 40]} />
      <points ref={far}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[layers.far, 3]} /></bufferGeometry>
        <pointsMaterial color="#6B7FC9" size={0.045} sizeAttenuation transparent opacity={0.35} depthWrite={false} />
      </points>
      <points ref={mid}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[layers.mid, 3]} /></bufferGeometry>
        <pointsMaterial color="#8A63FF" size={0.06} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </points>
      <points ref={near}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[layers.near, 3]} /></bufferGeometry>
        <pointsMaterial color="#B9A2FF" size={0.11} sizeAttenuation transparent opacity={0.28} depthWrite={false} />
      </points>
      {/* the (empty) report field */}
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[reports, 3]} /></bufferGeometry>
        <pointsMaterial color="#B9A2FF" size={0.2} />
      </points>
      {/* reticle: concentric rings + radial gridlines, tilted like an observatory plate */}
      <group rotation={[Math.PI / 2.55, 0, 0]}>
        {rings.map((r, i) => (
          <mesh key={r}>
            <ringGeometry args={[r - 0.012, r + 0.012, 128]} />
            <meshBasicMaterial color="#B9A2FF" transparent opacity={0.16 - i * 0.03} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={`g${i}`} rotation={[0, 0, (i * Math.PI) / 6]}>
            <planeGeometry args={[23, 0.012]} />
            <meshBasicMaterial color="#B9A2FF" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
        <mesh>
          <circleGeometry args={[0.35, 32]} />
          <meshBasicMaterial color="#8A63FF" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
      {/* current-cluster focus glow: dim because nothing is in focus */}
      <sprite scale={[9, 9, 1]} position={[0, 0, -3]}>
        <spriteMaterial color="#2247D6" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}
