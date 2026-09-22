import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { buildChain } from '../chain/geometry'
import { DepthField } from '../DepthField'
import { COMPOUND_BY_SLUG } from '~/data/compounds'
import { usePostAllowed, useQuality } from '~/motion/useReducedMotion'

/*
 * Quick view molecule, alive: it assembles on open, holds and spins, bursts apart into drifting particles,
 * then pulls itself back together — on a loop. Drag to throw it around; it keeps the spin you give it.
 * The chain is the real sequence-derived geometry; the burst uses the renderer's own scattered positions.
 */
export interface Drag { active: boolean; vx: number; vy: number; dx: number; dy: number }

const CYCLE = 24 // seconds: give the intact molecule time to be explored
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export function QuickScene({ slug, tint, accent, drag, reduced }: { slug: string; tint: string; accent: string; drag: RefObject<Drag>; reduced: boolean }) {
  const c = COMPOUND_BY_SLUG[slug]
  const geometry = useMemo(() => buildChain(c), [c])
  const post = usePostAllowed()
  const q = useQuality()
  const progress = useRef(reduced ? 1 : 0)
  const g = useRef<THREE.Group>(null)
  const spin = useRef({ y: 0.6, x: 0 })
  const t = useRef(-1.6) // first pass: assemble from scattered on open

  useFrame((_, dt) => {
    const d = drag.current
    t.current += dt
    if (!reduced) {
      if (t.current < 0) progress.current = ease(1 + t.current / 1.6) // opening assembly
      else {
        const k = t.current % CYCLE
        // Hold 12s, separate over 4s, drift 2s, return over 5s, settle 1s.
        progress.current = k < 12 ? 1 : k < 16 ? 1 - ease((k - 12) / 4) : k < 18 ? 0 : k < 23 ? ease((k - 18) / 5) : 1
      }
    }
    const bursting = progress.current < 0.98
    if (!g.current) return
    if (d?.active) {
      // follow the finger / mouse directly
      g.current.rotation.y += d.dx * 0.01
      g.current.rotation.x = THREE.MathUtils.clamp(g.current.rotation.x + d.dy * 0.008, -1.1, 1.1)
      spin.current.y = d.vx * 0.012
      d.dx = 0; d.dy = 0
    } else if (!reduced) {
      // Keep a gentle idle turn after the user's drag.
      const idle = reduced ? 0 : bursting ? 0.38 : 0.28
      spin.current.y += (idle - spin.current.y) * Math.min(1, dt * 0.8)
      g.current.rotation.y += spin.current.y * dt
      g.current.rotation.x += (Math.sin(t.current * 0.4) * 0.25 - g.current.rotation.x) * Math.min(1, dt * 1.2)
    }
    if (!reduced) {
      g.current.rotation.z = Math.sin(t.current * 0.3) * 0.12
      g.current.position.y = Math.sin(t.current * 0.8) * 0.08
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.6]} fov={40} />
      <ambientLight intensity={0.15} />
      <spotLight position={[3, 5, 2]} color="#e7faff" intensity={18} angle={0.6} penumbra={0.85} />
      <pointLight position={[-2, 2, -3]} color={accent} intensity={7} distance={14} />
      <pointLight position={[2.5, 2.5, 3]} color={tint} intensity={3} distance={12} />
      <pointLight position={[-3, -1.5, 2]} color={accent} intensity={2} distance={12} />
      <directionalLight position={[0, 4, 5]} intensity={1.2} />
      <DepthField count={Math.round(260 * q.particles)} box={{ x: [-7, 7], y: [-5, 5], z: [-8, 1] }} size={[0.05, 0.22]} colorA={tint} colorB={accent} opacity={0.85} drift={0.9} speed={0.5} twinkle={0.9} glint={0.15} fade={[10, 16]} seed={9} />
      <group ref={g}>
        <ChainRenderer geometry={geometry} progress={progress} tint={tint} accent={accent} lod={1} intensity={1.7} fit={0.95} rotate={0} tempo={reduced ? 0 : 0.7} ownLights={false} />
      </group>
      {post && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        </EffectComposer>
      )}
    </>
  )
}
