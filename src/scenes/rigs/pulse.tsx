import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { mulberry32 } from '../chain/geometry'
import type { RigProps } from './types'

const N = 90
const M = new THREE.Matrix4()
const V = new THREE.Vector3()
const S = new THREE.Vector3()
const Q = new THREE.Quaternion()

/** Night-weighted 24h envelope from the real clock: peaks ~03:00, trough ~15:00. */
export function nightWeight(date = new Date()): number {
  const h = date.getHours() + date.getMinutes() / 60
  return 0.5 + 0.5 * Math.cos(((h - 3) / 24) * Math.PI * 2)
}

/** Somatotropic — Pulse. Emissive intensity on a night-weighted sine; particle bursts on peaks. */
export function PulseRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }: RigProps) {
  const inst = useRef<THREE.InstancedMesh>(null)
  const light = useRef<THREE.PointLight>(null)
  const dirs = useMemo(() => {
    const rnd = mulberry32(seed)
    const arr = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const u = rnd() * 2 - 1
      const phi = rnd() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      arr[i * 3] = s * Math.cos(phi)
      arr[i * 3 + 1] = s * Math.sin(phi)
      arr[i * 3 + 2] = u
    }
    return arr
  }, [seed])
  const t = useRef(0)
  const burstAge = useRef(10)
  const lastBeat = useRef(-1)
  const nw = useMemo(() => nightWeight(), [])

  useFrame((_, dt) => {
    t.current += dt
    const rate = 0.9 * tempo
    const phase = t.current * rate
    const beat = Math.pow(Math.max(0, Math.sin(phase * Math.PI)), 6)
    const beatIndex = Math.floor(phase)
    if (beatIndex !== lastBeat.current) {
      lastBeat.current = beatIndex
      burstAge.current = 0
    }
    burstAge.current += dt
    const e = (0.25 + 0.75 * nw) * (0.6 + beat * 1.8) * intensity
    if (light.current) light.current.intensity = e * 4
    if (inst.current) {
      const age = burstAge.current
      const r = 0.6 + age * 1.6
      const alpha = Math.max(0, 1 - age / 1.4)
      for (let i = 0; i < N; i++) {
        V.set(dirs[i * 3] * r, dirs[i * 3 + 1] * r, dirs[i * 3 + 2] * r)
        S.setScalar(0.035 * alpha * (0.5 + nw))
        M.compose(V, Q, S)
        inst.current.setMatrixAt(i, M)
      }
      inst.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.4]} fov={40} />
      <pointLight ref={light} color={glow} position={[0, 0, 0.6]} distance={8} decay={1.5} />
      <ChainRenderer geometry={geometry} tint={tint} accent={accent} lod={lod} intensity={intensity * (0.7 + nw * 0.6)} fit={0.7} rotate={0.18 * tempo} tempo={tempo} />
      <instancedMesh ref={inst} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color={glow} transparent opacity={0.9} />
      </instancedMesh>
    </>
  )
}
