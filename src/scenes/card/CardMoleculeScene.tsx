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
      <ambientLight intensity={0.34} />
      <directionalLight position={[-4, 5, 6]} color="#f4fbff" intensity={active ? 3.1 : 2.35} />
      <pointLight position={[4, -1, 3]} color={tint} intensity={active ? 18 : 11} distance={16} />
      <pointLight position={[-3, 1, -1]} color={accent} intensity={active ? 10 : 6} distance={13} />
      <ChainRenderer
        geometry={geometry}
        tint={tint}
        accent={accent}
        lod={1}
        intensity={active ? 1.22 : 1}
        fit={geometry.length > 120 ? 1.08 : 1.3}
        rotate={active ? 0.09 : 0.045}
        tempo={0.28}
        markers={false}
        tilt={[0.18, 0.42, -0.08]}
        ownLights={false}
        reducedEffects
      />
    </>
  )
}
