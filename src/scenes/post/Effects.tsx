import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { usePostAllowed } from '~/motion/useReducedMotion'

interface Props {
  /** Focus distance in world units for DoF. */
  focus?: number
  bokeh?: number
  bloom?: number
}

/** LOD-0 post stack: Bloom (low), DepthOfField, Noise (film grain), Vignette. Disabled on mobile / low-power / reduced-motion. */
export function Effects({ focus = 0.02, bokeh = 2.5, bloom = 0.55 }: Props) {
  const allowed = usePostAllowed()
  if (!allowed) return null
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField focusDistance={focus} focalLength={0.09} bokehScale={bokeh} height={480} />
      <Bloom intensity={bloom} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
      <Noise opacity={0.08} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  )
}
