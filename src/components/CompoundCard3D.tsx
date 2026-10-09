import { Suspense } from 'react'
import { Lod0Canvas } from '~/scenes/Canvas'
import { CardMoleculeScene } from '~/scenes/card/CardMoleculeScene'
import type { buildChain } from '~/scenes/chain/geometry'

interface Props { geometry: ReturnType<typeof buildChain>; tint: string; accent: string; active: boolean }

/**
 * The live 3D molecule on a card. Kept in its own file so the 3D engine downloads only when a card
 * actually asks for it (mouse hover, keyboard focus, or the featured orbit) — never just to list the library.
 */
export function CompoundCard3D({ geometry, tint, accent, active }: Props) {
  return (
    <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={5.6} dpr={[1, 1.2]} preserveDrawingBuffer={false}>
      <Suspense fallback={null}><CardMoleculeScene geometry={geometry} tint={tint} accent={accent} active={active} /></Suspense>
    </Lod0Canvas>
  )
}
