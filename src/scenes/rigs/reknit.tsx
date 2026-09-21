import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useRef } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import type { RigProps } from './types'

/** Longevity — Reknit. Time runs backward: fray → whole. Assembly curve looped, slow rotation. */
export function ReknitRig({ geometry, tint, accent, glow, lod, intensity, tempo }: RigProps) {
  const progress = useRef(0)
  const g = useRef<THREE.Group>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 0.11 * tempo
    const c = t.current % 1
    // 0–0.65 reknit (assemble), 0.65–0.85 hold, 0.85–1 fray quickly (played in reverse)
    let p: number
    if (c < 0.5) p = easeInOutSine(c / 0.5)
    else if (c < 0.86) p = 1
    else p = 1 - easeInOutSine((c - 0.86) / 0.14)
    progress.current = p
    if (g.current) g.current.rotation.x = Math.sin(t.current * 1.7) * 0.25
  })
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.4]} fov={40} />
      <pointLight position={[0, 2, 2]} color={glow} intensity={2 * intensity} distance={8} />
      <group ref={g}>
        <ChainRenderer geometry={geometry} progress={progress} tint={tint} accent={accent} lod={lod} intensity={intensity} fit={0.75} rotate={0.1 * tempo} tempo={tempo} />
      </group>
    </>
  )
}

function easeInOutSine(x: number) {
  return -(Math.cos(Math.PI * x) - 1) / 2
}
