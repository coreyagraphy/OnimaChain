import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mulberry32 } from './chain/geometry'

/*
 * DepthField — one batched layer of glowing particles (a single draw call).
 * Each particle has its own seeded drift path, size and twinkle; a few carry a four-point glint ("shine").
 * Particles are depth-tested (the molecule hides them) but never write depth, and fade with distance
 * so far layers read as atmosphere and near layers read as bokeh passing the lens.
 */
export interface DepthFieldProps {
  count: number
  /** World-space box the particles live in. */
  box: { x: [number, number]; y: [number, number]; z: [number, number] }
  /** Point size range in world-ish units (scaled by distance). */
  size: [number, number]
  colorA: string
  colorB: string
  opacity?: number
  /** How far each particle wanders from its home (world units). */
  drift?: number
  /** Drift speed multiplier. */
  speed?: number
  /** 0 = steady, 1 = strong twinkle. */
  twinkle?: number
  /** Share of particles that get a star glint (0..1). */
  glint?: number
  /** Distance where particles are fully visible, and where they have faded out. */
  fade?: [number, number]
  seed?: number
}

const vert = /* glsl */ `
  uniform float uTime; uniform float uPixelRatio; uniform float uDrift; uniform float uSpeed; uniform vec2 uFade;
  attribute float aSize; attribute float aSeed; attribute float aMix;
  varying float vTw; varying float vMix; varying float vFade; varying float vGlint; varying float vSeed;
  void main() {
    float s = aSeed * 6.2831;
    float t = uTime * uSpeed;
    vec3 p = position + vec3(sin(t * (0.6 + aSeed) + s) , cos(t * (0.5 + aSeed * 0.7) + s * 1.7), sin(t * (0.4 + aSeed * 0.5) + s * 2.3) * 0.6) * uDrift;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixelRatio * (300.0 / max(dist, 0.3)), 0.0, 180.0);
    vTw = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.4) + aSeed * 40.0);
    vMix = aMix;
    vFade = 1.0 - smoothstep(uFade.x, uFade.y, dist);
    vFade *= smoothstep(0.35, 1.4, dist);
    vGlint = step(0.0, aMix - 2.0); // aMix > 2 flags a glint particle
    vSeed = aSeed;
  }
`
const frag = /* glsl */ `
  uniform vec3 uColorA; uniform vec3 uColorB; uniform float uOpacity; uniform float uTwinkle;
  varying float vTw; varying float vMix; varying float vFade; varying float vGlint; varying float vSeed;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.16, 0.0, d);
    float halo = exp(-d * d * 14.0);
    float spikes = vGlint * (exp(-abs(uv.x) * 30.0) + exp(-abs(uv.y) * 30.0)) * smoothstep(0.5, 0.0, d) * 1.2;
    float tw = mix(1.0, vTw, uTwinkle);
    vec3 col = mix(uColorA, uColorB, fract(vMix));
    float a = (core * 0.9 + halo * 0.55 + spikes) * tw * uOpacity * vFade;
    // bright cores push past the bloom threshold so particles actually shine; halos stay soft
    gl_FragColor = vec4(col * (1.0 + core * 3.2 + spikes * 2.0), a);
  }
`

export function DepthField({ count, box, size, colorA, colorB, opacity = 0.8, drift = 0.4, speed = 0.25, twinkle = 0.6, glint = 0.08, fade = [30, 70], seed = 1 }: DepthFieldProps) {
  const gl = useThree((s) => s.gl)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const geo = useMemo(() => {
    const rnd = mulberry32(0x5eed ^ seed)
    const pos = new Float32Array(count * 3), sz = new Float32Array(count), sd = new Float32Array(count), mx = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = box.x[0] + rnd() * (box.x[1] - box.x[0])
      pos[i * 3 + 1] = box.y[0] + rnd() * (box.y[1] - box.y[0])
      pos[i * 3 + 2] = box.z[0] + rnd() * (box.z[1] - box.z[0])
      // skew toward small sizes so a few big ones read as depth, not noise
      const r = rnd()
      sz[i] = size[0] + (size[1] - size[0]) * r * r
      sd[i] = rnd()
      mx[i] = rnd() + (rnd() < glint ? 2 : 0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1))
    g.setAttribute('aMix', new THREE.BufferAttribute(mx, 1))
    return g
  }, [count, box.x[0], box.x[1], box.y[0], box.y[1], box.z[0], box.z[1], size[0], size[1], glint, seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uDrift: { value: drift },
    uSpeed: { value: speed },
    uFade: { value: new THREE.Vector2(fade[0], fade[1]) },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uOpacity: { value: opacity },
    uTwinkle: { value: twinkle },
  }), []) // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    const u = uniforms
    u.uTime.value += dt
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uColorA.value.set(colorA)
    u.uColorB.value.set(colorB)
    u.uOpacity.value = opacity
  })
  return (
    <points geometry={geo} frustumCulled={false} renderOrder={1}>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} depthTest blending={THREE.AdditiveBlending} />
    </points>
  )
}
