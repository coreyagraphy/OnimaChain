import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ACESFilmicToneMapping, CatmullRomCurve3, SRGBColorSpace, Vector3 } from 'three'
import type { Group, Points } from 'three'
import { useDocumentVisible, useQuality } from '~/motion/useReducedMotion'

type V3 = [number, number, number]
type Result = 'correct' | 'incorrect' | null

function Field({ calm }: { calm: boolean }) {
  const points = useMemo(() => {
    let seed = 71
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const values = new Float32Array(360 * 3)
    for (let i = 0; i < 360; i++) {
      values[i * 3] = (random() - 0.5) * 19
      values[i * 3 + 1] = (random() - 0.5) * 12
      values[i * 3 + 2] = -2 - random() * 9
    }
    return values
  }, [])
  const ref = useRef<Points>(null)
  useFrame((_, delta) => { if (ref.current && !calm) ref.current.rotation.y += delta * 0.002 })
  return <points ref={ref}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry>
    <pointsMaterial color="#6fa3c6" size={0.018} sizeAttenuation transparent opacity={0.54} depthWrite={false} />
  </points>
}

function Orb({ position, color, scale = 1, kind = 'source', calm }: { position: V3; color: string; scale?: number; kind?: 'source' | 'claim'; calm: boolean }) {
  const rig = useRef<Group>(null)
  useFrame((state, delta) => {
    if (!rig.current || calm) return
    rig.current.rotation.y += delta * (kind === 'source' ? 0.095 : -0.065)
    rig.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.65 + (kind === 'source' ? 0 : 1.7)) * 0.045
  })
  return <group ref={rig} position={position} scale={scale}>
    <mesh castShadow>
      <icosahedronGeometry args={[0.77, 4]} />
      <meshPhysicalMaterial color={kind === 'source' ? '#17304a' : '#211f42'} metalness={0.54} roughness={0.28} clearcoat={0.55} clearcoatRoughness={0.16} />
    </mesh>
    <mesh scale={1.1}>
      <icosahedronGeometry args={[0.77, 2]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.18} depthWrite={false} />
    </mesh>
    <mesh rotation={[0.38, 0.48, 0.12]}>
      <torusGeometry args={[0.98, 0.012, 6, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.63} />
    </mesh>
    <mesh rotation={[1.06, -0.22, 0.36]}>
      <torusGeometry args={[1.18, 0.006, 4, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.24} />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.47, 24, 24]} />
      <meshPhysicalMaterial color={color} metalness={0.1} roughness={0.22} emissive={color} emissiveIntensity={0.17} transparent opacity={0.5} />
    </mesh>
  </group>
}

function ClaimGate({ color, calm }: { color: string; calm: boolean }) {
  const rig = useRef<Group>(null)
  useFrame((state, delta) => {
    if (!rig.current || calm) return
    rig.current.rotation.y += delta * 0.045
    rig.current.position.y = -0.09 + Math.sin(state.clock.elapsedTime * 0.65 + 1.7) * 0.045
  })
  return <group ref={rig} position={[2.13, -0.09, 0]} rotation={[0.14, -0.18, 0]}>
    <mesh castShadow><torusGeometry args={[0.76, 0.15, 18, 96]} /><meshPhysicalMaterial color="#3e3e65" metalness={0.77} roughness={0.22} clearcoat={0.75} clearcoatRoughness={0.13} emissive={color} emissiveIntensity={0.16} /></mesh>
    <mesh scale={1.28}><torusGeometry args={[0.77, 0.014, 7, 96]} /><meshBasicMaterial color={color} transparent opacity={0.67} /></mesh>
    <mesh scale={0.69}><torusGeometry args={[0.77, 0.018, 7, 96]} /><meshBasicMaterial color={color} transparent opacity={0.48} /></mesh>
    <mesh rotation={[0, 0, Math.PI / 4]}><circleGeometry args={[0.72, 64]} /><meshPhysicalMaterial color={color} transparent opacity={0.095} metalness={0.2} roughness={0.1} side={2} depthWrite={false} /></mesh>
    <mesh position={[0, 0, 0.07]}><sphereGeometry args={[0.15, 20, 20]} /><meshBasicMaterial color={color} transparent opacity={0.8} /></mesh>
    {[0, 1, 2, 3].map(i => <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[Math.cos(i * Math.PI / 2) * 0.77, Math.sin(i * Math.PI / 2) * 0.77, 0.04]}><boxGeometry args={[0.11, 0.19, 0.15]} /><meshStandardMaterial color="#c2bddf" metalness={0.82} roughness={0.2} /></mesh>)}
  </group>
}

function Pedestal({ x, color }: { x: number; color: string }) {
  return <group position={[x, -1.45, -0.25]}>
    <mesh receiveShadow><cylinderGeometry args={[1.02, 1.18, 0.12, 64]} /><meshStandardMaterial color="#173447" metalness={0.72} roughness={0.35} /></mesh>
    <mesh position={[0, 0.067, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.82, 0.85, 64]} /><meshBasicMaterial color={color} transparent opacity={0.55} side={2} /></mesh>
    <mesh position={[0, -0.09, 0]}><cylinderGeometry args={[0.88, 1.05, 0.08, 64]} /><meshStandardMaterial color="#0b2637" metalness={0.62} roughness={0.31} /></mesh>
  </group>
}

function Line({ coords, color, radius = 0.021, opacity = 1 }: { coords: V3[]; color: string; radius?: number; opacity?: number }) {
  const curve = useMemo(() => new CatmullRomCurve3(coords.map(c => new Vector3(...c))), [coords])
  return <mesh><tubeGeometry args={[curve, 42, radius, 7, false]} /><meshBasicMaterial color={color} transparent opacity={opacity} /></mesh>
}

function Bridge({ result }: { result: Result }) {
  const full: V3[] = [[-1.38, 0.2, 0], [-0.65, 0.5, 0.38], [0, 0.18, 0.62], [0.65, -0.16, 0.38], [1.38, 0.05, 0]]
  return <group>
    <Line coords={full} color="#4d7e97" radius={0.007} opacity={0.3} />
    {result === 'correct' && <>
      <Line coords={full} color="#45e4f1" radius={0.13} opacity={0.13} />
      <Line coords={full} color="#70e4df" radius={0.038} opacity={0.85} />
      <Line coords={full} color="#c4ffec" radius={0.008} opacity={0.9} />
      {([[-0.72, 0.46, 0.35], [0, 0.18, 0.62], [0.69, -0.14, 0.36]] as V3[]).map((p, i) => <mesh position={p} key={i}><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color="#c6fff4" /></mesh>)}
    </>}
    {result === 'incorrect' && <>
      <Line coords={[full[0], full[1], [-0.24, 0.3, 0.59]]} color="#e7a477" radius={0.035} />
      <Line coords={[[0.26, 0.06, 0.59], full[3], full[4]]} color="#e7a477" radius={0.035} opacity={0.65} />
      <mesh position={[0, 0.18, 0.62]} rotation={[0.2, 0.2, 0]}><torusGeometry args={[0.2, 0.016, 6, 50]} /><meshBasicMaterial color="#e7a477" transparent opacity={0.7} /></mesh>
    </>}
  </group>
}

function EvidenceModel({ result, calm, yaw }: { result: Result; calm: boolean; yaw: number }) {
  const narrow = useThree(state => state.size.width < 600)
  return <group rotation={[0, yaw, 0]} scale={narrow ? 1.18 : 1}>
    <Orb position={[-2.13, 0.19, 0]} color="#67e4ee" kind="source" calm={calm} />
    <ClaimGate color={result === 'incorrect' ? '#eaa77d' : '#afa6ff'} calm={calm} />
    <Bridge result={result} />
    <Pedestal x={-2.13} color="#67e4ee" />
    <Pedestal x={2.13} color={result === 'incorrect' ? '#eaa77d' : '#afa6ff'} />
    <mesh position={[0, -1.71, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[4.2, 80]} />
      <meshBasicMaterial color="#102638" transparent opacity={0.26} />
    </mesh>
    <mesh position={[0, -1.66, -0.6]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.7, 2.72, 100]} /><meshBasicMaterial color="#34647d" transparent opacity={0.26} side={2} /></mesh>
  </group>
}

const moleculePoints: V3[] = [[-2.5,-0.15,0.05],[-1.74,0.36,0.2],[-0.93,-0.07,0.45],[-0.12,0.35,0.18],[0.73,-0.18,-0.1],[1.57,0.18,0.22],[2.42,-0.26,0.12]]
function MoleculeModel({ yaw }: { yaw: number }) {
  const narrow = useThree(state => state.size.width < 600)
  return <group rotation={[0, yaw, 0]} scale={narrow ? 1.08 : 1}>
    {moleculePoints.slice(0, -1).map((p, i) => <Line key={i} coords={[p, moleculePoints[i + 1]]} color="#8cd7df" radius={0.055} opacity={0.85} />)}
    {moleculePoints.map((p, i) => <group position={p} key={i}>
      <mesh castShadow><sphereGeometry args={[i % 2 === 0 ? 0.25 : 0.32, 28, 20]} /><meshPhysicalMaterial color={i % 2 === 0 ? '#66d8e5' : '#9287da'} metalness={0.28} roughness={0.24} emissive={i % 2 === 0 ? '#14687a' : '#413b80'} emissiveIntensity={0.22} /></mesh>
      <mesh rotation={[0.2, i * 0.32, 0.3]}><torusGeometry args={[0.4, 0.009, 5, 50]} /><meshBasicMaterial color="#c5f5fa" transparent opacity={0.38} /></mesh>
    </group>)}
  </group>
}

export default function ObservatoryScene({ mode = 'evidence', result = null, calm = false, yaw = 0, active = true }: { mode?: 'evidence' | 'molecule'; result?: Result; calm?: boolean; yaw?: number; active?: boolean }) {
  const visible = useDocumentVisible()
  const quality = useQuality()
  return <Canvas role="img" aria-label={mode === 'molecule' ? 'Rotatable conceptual peptide chain' : 'Rotatable source-to-claim evidence model'} fallback={<div className="obs-canvas-fallback">3D unavailable. The written lesson and answer controls remain usable.</div>} shadows={quality.shadows} frameloop={!active || !visible ? 'never' : calm ? 'demand' : 'always'} dpr={quality.dpr} camera={{ position: [0, 1.05, 7.5], fov: 42 }} gl={{ antialias: quality.tier !== 'low', alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.25; gl.outputColorSpace = SRGBColorSpace; gl.setClearColor('#0b1a35', 0) }}>
    <fog attach="fog" args={['#0b1a35', 8, 18]} />
    <ambientLight intensity={0.94} color="#b8d8f6" />
    <directionalLight position={[-3, 5, 5]} intensity={4.2} color="#a8f5ff" castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
    <pointLight position={[3, 2, -2]} intensity={45} distance={10} color="#9a58ff" />
    <pointLight position={[-3, -0.2, 2]} intensity={16} distance={7} color="#28c5f8" />
    <pointLight position={[0, -2, 3]} intensity={11} distance={8} color="#468eb5" />
    <Field calm={calm} />
    {mode === 'molecule' ? <MoleculeModel yaw={yaw} /> : <EvidenceModel result={result} calm={calm} yaw={yaw} />}
    <OrbitControls makeDefault enablePan={false} enableZoom minDistance={5.5} maxDistance={10} minPolarAngle={0.7} maxPolarAngle={2.0} autoRotate={false} enableDamping={!calm} />
  </Canvas>
}
