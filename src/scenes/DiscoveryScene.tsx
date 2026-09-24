import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import { useRef } from 'react'
import { Group, MathUtils } from 'three'
import { useDocumentVisible, useQuality } from '~/motion/useReducedMotion'
import type { DiscoveryMode } from '~/components/DiscoveryStage'

const colors = ['#77eaff', '#ff772f', '#eeff64', '#b7a1ff']
function World({ mode, selected, linked, calm, onSelect }: { mode: DiscoveryMode; selected: number; linked: number[]; calm: boolean; onSelect?: (index: number) => void }) {
  const rig = useRef<Group>(null)
  const width = useThree(state => state.size.width)
  useFrame(({ clock }, delta) => {
    if (!rig.current) return
    const target = mode === 'history' ? -selected * .52 : mode === 'scale' ? -selected * .28 : selected * .25
    rig.current.rotation.y = calm ? target : MathUtils.damp(rig.current.rotation.y, target, 4, delta)
    rig.current.position.y = calm ? 0 : Math.sin(clock.elapsedTime * .65) * .09
  })
  return <group ref={rig} scale={width < 600 ? .95 : 1.7}>
    {mode === 'scale' && [0,1,2,3].map((i) => <group key={i} onClick={event => { event.stopPropagation(); onSelect?.(i) }} position={[(i-1.5)*1.6, 0, i === selected ? .8 : -.3]} scale={i === selected ? 1.2 : .75}>
      {i === 0 ? <>{[0,1,2,3,4].map(n => <mesh key={n} position={[Math.cos(n*1.3)*.45, Math.sin(n*1.3)*.4, n*.1]}><sphereGeometry args={[.19,24,20]}/><meshStandardMaterial color={colors[i]} metalness={.55} roughness={.22}/></mesh>)}</> : i === 1 ? <><mesh><sphereGeometry args={[.62,40,32]}/><meshPhysicalMaterial color={colors[i]} transparent opacity={.32} roughness={.12} metalness={.2} depthWrite={false}/></mesh><mesh><sphereGeometry args={[.26,24,20]}/><meshStandardMaterial color="#ffdaac" emissive="#ff6c20" emissiveIntensity={.45}/></mesh></> : i === 2 ? <>{Array.from({length:9},(_,n)=><mesh key={n} position={[(n%3-1)*.38,(Math.floor(n/3)-1)*.35,0]}><boxGeometry args={[.32,.3,.3]}/><meshStandardMaterial color={colors[i]} metalness={.2} roughness={.35}/></mesh>)}</> : <><mesh position={[0,.6,0]}><sphereGeometry args={[.18,24,20]}/><meshStandardMaterial color={colors[i]}/></mesh><mesh><capsuleGeometry args={[.19,.5,6,16]}/><meshStandardMaterial color={colors[i]} metalness={.5} roughness={.25}/></mesh>{[-1,1].map(n=><group key={n}><mesh position={[n*.14,-.62,0]} rotation={[0,0,n*.1]}><capsuleGeometry args={[.075,.42,4,12]}/><meshStandardMaterial color={colors[i]}/></mesh><mesh position={[n*.32,.1,0]} rotation={[0,0,n*.42]}><capsuleGeometry args={[.065,.35,4,12]}/><meshStandardMaterial color={colors[i]} metalness={.45} roughness={.25}/></mesh><mesh position={[n*.44,-.19,0]}><sphereGeometry args={[.07,16,12]}/><meshStandardMaterial color={colors[i]}/></mesh></group>)}</>}
      <mesh position={[0,-1.1,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.52,.57,64]}/><meshBasicMaterial color={colors[i]} side={2}/></mesh>
    </group>)}
    {mode === 'report' && [0,1,2].map(i => <group key={i} onClick={event => { event.stopPropagation(); onSelect?.(i) }} position={[(i-1)*1.6, i === selected ? .25 : -.25, i === selected ? .8 : -.6]} rotation={[0,(i-1)*-.25,-.08]}>
      <mesh><boxGeometry args={[1.4,2.1,.08]}/><meshStandardMaterial color={i === selected ? '#ede8d9' : '#677887'} metalness={.35} roughness={.28}/></mesh>
      {Array.from({length:8},(_,n)=><mesh key={n} position={[-.46+n*.13,-.38+(n%3)*.11,.08]}><boxGeometry args={[.055,.25+(Math.sin(n*2+i)+1)*.44,.06]}/><meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={.3}/></mesh>)}
      {[0,1,2].map(n=><mesh key={n} position={[0,.7-n*.18,.06]}><boxGeometry args={[n===0?.8:1,.035,.02]}/><meshBasicMaterial color="#293746"/></mesh>)}
    </group>)}
    {mode === 'constellation' && <><mesh><icosahedronGeometry args={[.75,1]}/><meshStandardMaterial color="#ff762e" metalness={.68} roughness={.18} emissive="#ff762e" emissiveIntensity={.15}/></mesh>{[0,1,2].map(i => <group key={i} onClick={event => { event.stopPropagation(); onSelect?.(i) }} rotation={[0,0,i*Math.PI*2/3]}>
      <mesh position={[1.25,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.018,.018,1.7,10]}/><meshBasicMaterial color={linked.includes(i)?'#edff59':'#627785'}/></mesh>
      <mesh position={[2.1,0,0]} rotation={[.2,.4,-i*Math.PI*2/3]} scale={selected===i?1.2:1}><boxGeometry args={[.8,1,.12]}/><meshStandardMaterial color={colors[i]} metalness={.5} roughness={.22}/></mesh>
    </group>)}</>}
    {mode === 'history' && [0,1,2,3].map(i => <group key={i} onClick={event => { event.stopPropagation(); onSelect?.(i) }} position={[(i-1.5)*1.35,0,-i*.65]} rotation={[0,.15,0]}>
      <mesh><torusGeometry args={[1.05,i===selected?.1:.035,12,80]}/><meshStandardMaterial color={colors[i]} metalness={.65} roughness={.2} emissive={colors[i]} emissiveIntensity={i===selected?.6:.15}/></mesh>
      <mesh position={[0,-1.05,0]}><boxGeometry args={[.55,.15,.5]}/><meshStandardMaterial color="#727a84" metalness={.8} roughness={.2}/></mesh>
    </group>)}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.28,0]}><circleGeometry args={[3.5,80]}/><meshStandardMaterial color="#607687" transparent opacity={.12} metalness={.3} roughness={.5} depthWrite={false}/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.26,0]}><ringGeometry args={[3.3,3.31,96]}/><meshBasicMaterial color="#ff762e" transparent opacity={.4} side={2}/></mesh>
  </group>
}
export default function DiscoveryScene(props: { mode: DiscoveryMode; selected: number; linked: number[]; calm: boolean; active: boolean; onSelect?: (index: number) => void }) {
  const quality = useQuality()
  const visible = useDocumentVisible()
  return <Canvas aria-label={`Interactive conceptual ${props.mode} scene`} role="img" frameloop={!props.active || !visible ? 'never' : props.calm ? 'demand' : 'always'} dpr={quality.dpr} camera={{ position: [0,2.4,8.5], fov: 42 }} gl={{alpha:true, antialias:true}}>
    <ambientLight intensity={1.1}/><directionalLight position={[-3,5,5]} intensity={4} color="#e1f9ff"/><pointLight position={[4,1,3]} intensity={55} color="#ff762e"/><pointLight position={[-4,2,1]} intensity={40} color="#edff59"/>
    <World {...props}/><OrbitControls enablePan={false} enableZoom={false} enableDamping={!props.calm} minPolarAngle={.6} maxPolarAngle={1.7}/>
  </Canvas>
}
