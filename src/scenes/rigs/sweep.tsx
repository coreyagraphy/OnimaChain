import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { mulberry32 } from '../chain/geometry'
import type { RigProps } from './types'

const N = 40
const M = new THREE.Matrix4()
const V = new THREE.Vector3()
const S = new THREE.Vector3()
const Q = new THREE.Quaternion()

/** Immune — Sweep. A cone sweeps a field of points, locks on one, flags it, resumes. */
export function SweepRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }: RigProps) {
  const pts = useMemo(() => {
    const rnd = mulberry32(seed)
    const arr: { a: number; r: number; z: number }[] = []
    for (let i = 0; i < N; i++) arr.push({ a: rnd() * Math.PI * 2, r: 1.5 + rnd() * 1.3, z: (rnd() - 0.5) * 0.6 - 0.8 })
    return arr
  }, [seed])
  const foreign = useMemo(() => Math.floor(mulberry32(seed ^ 77)() * N), [seed])
  const inst = useRef<THREE.InstancedMesh>(null)
  const cone = useRef<THREE.Mesh>(null)
  const flag = useRef<THREE.Mesh>(null)
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt * tempo
    const period = 6
    const c = (t.current % period) / period
    // sweep 0–0.6 (one full turn to the foreign angle), lock 0.6–0.8, resume 0.8–1
    const target = pts[foreign].a
    let ang: number
    if (c < 0.6) ang = target - Math.PI * 2 + (c / 0.6) * Math.PI * 2
    else if (c < 0.8) ang = target + Math.sin(t.current * 30) * 0.01
    else ang = target + ((c - 0.8) / 0.2) * Math.PI * 0.8
    const locked = c >= 0.6 && c < 0.8
    if (cone.current) {
      cone.current.rotation.z = ang
      const m = cone.current.material as THREE.MeshBasicMaterial
      m.opacity = (locked ? 0.22 : 0.09) * intensity
    }
    if (inst.current) {
      for (let i = 0; i < N; i++) {
        const p = pts[i]
        V.set(Math.cos(p.a) * p.r, Math.sin(p.a) * p.r, p.z)
        const lit = Math.cos(p.a - ang) > 0.96 ? 1.8 : 1
        S.setScalar(0.045 * lit * (i === foreign && locked ? 2.4 : 1))
        M.compose(V, Q, S)
        inst.current.setMatrixAt(i, M)
      }
      inst.current.instanceMatrix.needsUpdate = true
    }
    if (flag.current) {
      const p = pts[foreign]
      flag.current.position.set(Math.cos(p.a) * p.r, Math.sin(p.a) * p.r, p.z)
      const s = locked ? 1 + ((c - 0.6) / 0.2) * 1.6 : 0.0001
      flag.current.scale.setScalar(s)
      const m = flag.current.material as THREE.MeshBasicMaterial
      m.opacity = locked ? 1 - (c - 0.6) / 0.2 : 0
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.6]} fov={42} />
      <mesh ref={cone} position={[0, 0, -0.9]}>
        <circleGeometry args={[3.2, 40, 0, 0.3]} />
        <meshBasicMaterial color={glow} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color={tint} transparent opacity={0.75} />
      </instancedMesh>
      <mesh ref={flag}>
        <ringGeometry args={[0.16, 0.2, 32]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <ChainRenderer geometry={geometry} tint={tint} accent={accent} lod={lod} intensity={intensity} fit={0.55} rotate={0.16 * tempo} tempo={tempo} />
    </>
  )
}
