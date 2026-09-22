import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import type { ChainGeometry } from '../chain/geometry'
import { ChainRenderer } from '../chain/ChainRenderer'

interface Props {
  geometry: ChainGeometry
  tint: string
  accent: string
  active?: boolean
}

/** Quiet, structure-first card scene. Decorative domain rigs deliberately do not run here. */
export function CardMoleculeScene({ geometry, tint, accent, active = false }: Props) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.6]} fov={39} />
      <ambientLight intensity={0.16} color="#b2cad8" />
      <directionalLight position={[-4, 6, 7]} color="#f8fbff" intensity={active ? 3.6 : 2.9} />
      <directionalLight position={[2, -4, -5]} color={accent} intensity={active ? 2.1 : 1.6} />
      <pointLight position={[4, -1, 3]} color={tint} intensity={active ? 16 : 9} distance={13} />
      <pointLight position={[-3, 1, -1]} color={accent} intensity={active ? 9 : 5} distance={11} />
      <group position={[0, -0.35, 0]}>
        <ChainRenderer
          geometry={geometry}
          tint={tint}
          accent={accent}
          lod={1}
          intensity={active ? 1.22 : 1}
          fitMode="fixed"
          fit={geometry.length > 120 ? 1.45 : 1.9}
          rotate={active ? 0.09 : 0.045}
          tempo={0.28}
          markers={false}
          tilt={[0.18, 0.42, -0.08]}
          ownLights={false}
          reducedEffects
          surface="sculpted"
          atomScale={geometry.length > 25 ? 1.85 : 1.45}
        />
      </group>
    </>
  )
}
