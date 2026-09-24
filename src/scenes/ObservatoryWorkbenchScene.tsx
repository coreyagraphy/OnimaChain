import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import { useRef } from 'react'
import { ChainRenderer, type Highlight } from './chain/ChainRenderer'
import type { ChainGeometry } from './chain/geometry'
import { useDocumentVisible, useQuality } from '~/motion/useReducedMotion'

function Model({
  geometry,
  selected,
  isolate,
  radius,
  onSelect,
  x,
}: {
  geometry: ChainGeometry
  selected: number
  isolate: boolean
  radius: number
  onSelect: (index: number) => void
  x: number
}) {
  const highlight = useRef<Highlight | null>(null)
  highlight.current = { center: selected, width: 0.1, strength: 1, indices: [selected] }
  if (isolate)
    return (
      <mesh position={[x, 0, 0]} onClick={() => onSelect(selected)}>
        <icosahedronGeometry args={[0.65, 3]} />
        <meshStandardMaterial color="#edff59" metalness={0.6} roughness={0.28} />
      </mesh>
    )
  return (
    <group position={[x, 0, 0]}>
      <ChainRenderer
        geometry={geometry}
        tint="#edff59"
        accent="#ff762e"
        fitMode="fixed"
        fit={(geometry.bounds.radius / radius) * 2.1}
        rotate={0}
        tempo={0}
        markers={false}
        referenceMode
        isolatedResidue={isolate ? selected : null}
        onSelectResidue={onSelect}
        highlight={highlight}
        atomScale={1.05}
        tilt={[0, 0, 0]}
        lod={1}
      />
    </group>
  )
}
export default function WorkbenchScene({
  geometries,
  selected,
  isolate,
  sameScale,
  yaw,
  onSelect,
}: {
  geometries: ChainGeometry[]
  selected: number[]
  isolate: boolean
  sameScale: boolean
  yaw: number
  onSelect: (side: number, index: number) => void
}) {
  const quality = useQuality(),
    visible = useDocumentVisible()
  const radius = Math.max(...geometries.map((g) => g.bounds.radius))
  return (
    <Canvas
      role="img"
      aria-label="Molecular sequence illustrations; select a residue or use the sequence buttons below"
      frameloop={visible ? 'always' : 'never'}
      dpr={quality.dpr}
      camera={{ position: [0, 0, geometries.length > 1 ? 12 : 7], fov: 40 }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[-3, 5, 7]} intensity={3} />
      <pointLight position={[5, 2, 4]} intensity={35} color="#ff762e" />
      <group rotation={[0, yaw, 0]}>
        {geometries.map((geometry, i) => (
          <Model
            key={geometry.slug}
            geometry={geometry}
            selected={selected[i]}
            isolate={isolate}
            radius={sameScale ? radius : geometry.bounds.radius}
            x={geometries.length > 1 ? (i === 0 ? -2.5 : 2.5) : 0}
            onSelect={(index) => onSelect(i, index)}
          />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={18}
        enableDamping={false}
      />
    </Canvas>
  )
}
