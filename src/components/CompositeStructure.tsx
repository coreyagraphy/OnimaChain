import { lazy, Suspense, useMemo, type CSSProperties } from 'react'
import { COMPOUND_BY_SLUG } from '~/data/compounds'
import { themeFor } from '~/data/commerce'
import { buildChain } from '~/scenes/chain/geometry'
import { Lod0Canvas, SceneView } from '~/scenes/Canvas'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import { SequenceSVG } from './SequenceSVG'

const CardMoleculeScene = lazy(() => import('~/scenes/card/CardMoleculeScene').then((m) => ({ default: m.CardMoleculeScene })))
const MEMBERS = [COMPOUND_BY_SLUG['bpc-157'], COMPOUND_BY_SLUG['tb-500']] as const

/** A blend is two separately rendered chains, never a fused or invented molecule. */
export function CompositeStructure({ compact = false, dedicated = false, render3d = true }: { compact?: boolean; dedicated?: boolean; render3d?: boolean }) {
  const allowed = useCanvasAllowed() && render3d
  const geometries = useMemo(() => MEMBERS.map((compound) => buildChain(compound)), [])
  return <div className={`composite-structure ${compact ? 'composite-structure-compact' : ''}`} data-structure-kind="blend" role="group" aria-label="Wolverine Blend contains two separate peptides, BPC-157 and TB-500">
    {MEMBERS.map((compound, index) => {
      const theme = themeFor(compound)
      const scene = <Suspense fallback={null}><CardMoleculeScene geometry={geometries[index]} tint={theme.primary} accent={theme.secondary} active /></Suspense>
      return <div key={compound.slug} className="composite-member" style={{ '--member': theme.primary } as CSSProperties}>
        <div className="composite-member-view">
          {allowed ? dedicated
            ? <Lod0Canvas className="absolute inset-0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} cameraZ={6}>{scene}</Lod0Canvas>
            : <SceneView className="absolute inset-0" fallback={<SequenceSVG geometry={geometries[index]} tint={theme.primary} className="absolute inset-0 w-full h-full p-2" />}>{scene}</SceneView>
            : <SequenceSVG geometry={geometries[index]} tint={theme.primary} className="absolute inset-0 w-full h-full p-2" />}
        </div>
        <span className="composite-member-label">{compound.slug === 'bpc-157' ? 'BPC-157 · 15 residues' : 'TB-500 · 43 residues'}</span>
      </div>
    })}
    {!compact && <p className="composite-disclaimer">Separate peptide illustrations. No single molecular structure represents this blend.</p>}
  </div>
}
