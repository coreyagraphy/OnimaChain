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
  const seed = Array.from(geometry.slug).reduce((sum, letter) => sum + letter.charCodeAt(0), 0)
  const pose = seed % 4
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.6]} fov={39} />
      <ambientLight intensity={0.6} color="#b2cad8" />
      <directionalLight position={[-4, 6, 7]} color="#f8fbff" intensity={active ? 3.6 : 2.9} />
      <directionalLight position={[2, -4, -5]} color={accent} intensity={active ? 2.1 : 1.6} />
      <pointLight position={[4, -1, 3]} color={tint} intensity={active ? 16 : 9} distance={13} />
      <pointLight position={[-3, 1, -1]} color={accent} intensity={active ? 9 : 5} distance={11} />
      <pointLight position={[0, 3, 2]} color={pose % 2 ? "#ff762e" : "#edff59"} intensity={12} distance={10}/>
      <group position={[0, -0.15, 0]}>
        <ChainRenderer
          geometry={geometry}
          tint={tint}
          accent={accent}
          lod={1}
          intensity={active ? 1.22 : 1}
          fitMode="sphere"
          fit={geometry.length > 120 ? 1.55 : 1.65}
          rotate={active ? 0.18 : 0.08}
          tempo={0.6}
          markers={false}
          tilt={[0.15 + pose * 0.22, 0.25 + pose * 0.42, (pose - 1.5) * 0.22]}
          ownLights={false}
          reducedEffects
          surface={pose % 2 ? "sculpted" : "default"}
          atomScale={geometry.length > 25 ? 0.9 : 1.15}
        />
      </group>
    </>
  )
}
