import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mulberry32 } from '../chain/geometry'

/**
 * Empty constellation: a faint reference field (grid rings + dust) with ZERO report points.
 * The report-point buffer is allocated with length 0 on purpose — nothing is drawn as a report.
 */
export function Constellation() {
  const ref = useRef<THREE.Group>(null)
  const dust = useMemo(() => {
    const rnd = mulberry32(7)
    const n = 500
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { a[i * 3] = (rnd() - 0.5) * 40; a[i * 3 + 1] = (rnd() - 0.5) * 22; a[i * 3 + 2] = -6 - rnd() * 20 }
    return a
  }, [])
  const reports = useMemo(() => new Float32Array(0), [])
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.01 })
  return (
    <group ref={ref}>
      <fog attach="fog" args={['#0A0B0E', 10, 34]} />
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry>
        <pointsMaterial color="#8A63FF" size={0.05} sizeAttenuation transparent opacity={0.35} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[reports, 3]} /></bufferGeometry>
        <pointsMaterial color="#B9A2FF" size={0.2} />
      </points>
      {[3, 6, 9].map((r) => (
        <mesh key={r} rotation={[Math.PI / 2.6, 0, 0]}>
          <ringGeometry args={[r - 0.01, r + 0.01, 96]} />
          <meshBasicMaterial color="#B9A2FF" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}
