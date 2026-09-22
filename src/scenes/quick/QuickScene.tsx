import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { buildChain } from '../chain/geometry'
import { DepthField } from '../DepthField'
import { COMPOUND_BY_SLUG } from '~/data/compounds'
import { useQuality } from '~/motion/useReducedMotion'

/*
 * Quick view keeps the structure assembled and inside a rotation-safe frame.
 * Drag turns the molecule, never the camera or the page.
 */
export interface Drag { active: boolean; vx: number; vy: number; dx: number; dy: number }

export function QuickScene({ slug, tint, accent, drag, reduced }: { slug: string; tint: string; accent: string; drag: RefObject<Drag>; reduced: boolean }) {
  const c = COMPOUND_BY_SLUG[slug]
  const geometry = useMemo(() => buildChain(c), [c])
  const q = useQuality()
  const g = useRef<THREE.Group>(null)
  const spin = useRef(0.16)

  useFrame((_, dt) => {
    const d = drag.current
    if (!g.current) return
    if (d?.active) {
      // follow the finger / mouse directly
      g.current.rotation.y += THREE.MathUtils.clamp(d.dx * 0.008, -0.22, 0.22)
      g.current.rotation.x = THREE.MathUtils.clamp(g.current.rotation.x + d.dy * 0.006, -0.95, 0.95)
      spin.current = THREE.MathUtils.clamp(d.vx * 0.006, -0.65, 0.65)
      d.dx = 0; d.dy = 0
    } else if (!reduced) {
      spin.current += (0.16 - spin.current) * Math.min(1, dt * 1.8)
      g.current.rotation.y += spin.current * Math.min(dt, 0.05)
      g.current.rotation.x += (0.12 - g.current.rotation.x) * Math.min(1, dt * 1.2)
    }
    g.current.rotation.y = THREE.MathUtils.euclideanModulo(g.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={42} />
      <ambientLight intensity={0.15} />
      <spotLight position={[3, 5, 2]} color="#e7faff" intensity={18} angle={0.6} penumbra={0.85} />
      <pointLight position={[-2, 2, -3]} color={accent} intensity={7} distance={14} />
      <pointLight position={[2.5, 2.5, 3]} color={tint} intensity={3} distance={12} />
      <pointLight position={[-3, -1.5, 2]} color={accent} intensity={2} distance={12} />
      <directionalLight position={[0, 4, 5]} intensity={1.2} />
      <DepthField count={Math.round(70 * q.particles)} box={{ x: [-7, 7], y: [-5, 5], z: [-8, 1] }} size={[0.05, 0.22]} colorA={tint} colorB={accent} opacity={0.6} drift={0.6} speed={0.3} twinkle={0.8} glint={0.1} fade={[10, 16]} seed={9} />
      <group ref={g}>
        <ChainRenderer geometry={geometry} progress={1} tint={tint} accent={accent} lod={1} intensity={1.3} fitMode="sphere" fit={0.65} rotate={0} tempo={reduced ? 0 : 0.4} ownLights={false} />
      </group>
    </>
  )
}
