import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useMemo, useState } from 'react'
import { COMPOUND_BY_SLUG, displayName } from '~/data/compounds'
import { buildChain } from '~/scenes/chain/geometry'
import { provenanceText } from '~/components/SourceBadge'
import { SequenceSVG } from '~/components/SequenceSVG'
import { useCanvasAllowed } from '~/motion/useReducedMotion'
import '../styles/workbench.css'
const Scene = lazy(() => import('~/scenes/ObservatoryWorkbenchScene'))
const examples = ['bpc-157', 'tb-500', 'ghk-cu', 'glutathione', 'thymosin-beta-4']
export const Route = createFileRoute('/observatory')({
  validateSearch: (s: Record<string, unknown>): { station?: string; case?: number } => ({
    station: typeof s.station === 'string' ? s.station : undefined,
    case: Number.isInteger(Number(s.case)) ? Number(s.case) : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.station && search.station !== 'molecule')
      throw redirect({
        to: '/learn',
        search: { activity: search.station, case: search.case },
        statusCode: 302,
      })
  },
  head: () => ({
    meta: [
      { title: 'Molecular Observatory — OnimaChain' },
      {
        name: 'description',
        content:
          'See what peptides are made of. Select a building block, compare sequence illustrations, and inspect how each model was made.',
      },
    ],
  }),
  component: Observatory,
})
function Observatory() {
  const [slugs, setSlugs] = useState(['bpc-157', 'tb-500'])
  const [compare, setCompare] = useState(false),
    [selected, setSelected] = useState([0, 0]),
    [isolate, setIsolate] = useState(false),
    [sameScale, setSameScale] = useState(true),
    [yaw, setYaw] = useState(0)
  const allowed = useCanvasAllowed()
  const records = (compare ? slugs : slugs.slice(0, 1)).map((slug) => COMPOUND_BY_SLUG[slug])
  const geometries = useMemo(() => slugs.map((slug) => buildChain(COMPOUND_BY_SLUG[slug])), [slugs])
  function select(side: number, index: number) {
    setSelected((values) => values.map((value, i) => (i === side ? index : value)))
  }
  return (
    <div className="molecular-workbench wrap">
      <header>
        <div>
          <p className="electric-eyebrow">OBSERVATORY / LOOK, TOUCH, UNDERSTAND</p>
          <h1>
            What is a peptide
            <br />
            <em>made of?</em>
          </h1>
        </div>
        <p>
          A chain of small building blocks called amino acids. Select a block below to find it in
          the model. Look around at your own pace.
        </p>
      </header>
      <div className="workbench-toolbar">
        <button aria-pressed={compare} onClick={() => setCompare((v) => !v)}>
          {compare ? 'Show one molecule' : 'Compare two molecules'}
        </button>
        <button disabled={!allowed} aria-pressed={isolate} onClick={() => setIsolate((v) => !v)}>
          {isolate ? 'Show the whole chain' : 'Isolate selected blocks'}
        </button>
        <button disabled={!allowed} onClick={() => setYaw((v) => v - 0.3)}>
          Rotate left
        </button>
        <button onClick={() => setYaw((v) => v + 0.3)}>Rotate right</button>
        <button
          onClick={() => {
            setYaw(0)
            setIsolate(false)
            setSelected([0, 0])
          }}
        >
          Reset view
        </button>
      </div>
      <div className="workbench-example-selects">
        {records.map((record, i) => (
          <label key={i}>
            Example {i + 1}
            <select
              aria-label={`Example ${i + 1}`}
              value={record.slug}
              onChange={(e) => {
                setSlugs((v) => v.map((slug, n) => (n === i ? e.target.value : slug)))
                select(i, 0)
              }}
            >
              {examples.map((slug) => (
                <option key={slug} value={slug}>
                  {displayName(COMPOUND_BY_SLUG[slug])}
                </option>
              ))}
            </select>
          </label>
        ))}
        {compare && (
          <label className="scale-toggle">
            <input
              type="checkbox"
              checked={sameScale}
              onChange={(e) => setSameScale(e.target.checked)}
            />
            Use the same drawing scale
          </label>
        )}
      </div>
      <div className="workbench-stage">
        <div className="workbench-stage-label">
          EACH BEAD = ONE AMINO-ACID RESIDUE · NOT ONE ATOM
        </div>
        {allowed ? (
          <Suspense fallback={<p className="workbench-loading">Opening the molecular drawings…</p>}>
            <Scene
              geometries={compare ? geometries : geometries.slice(0, 1)}
              selected={selected}
              isolate={isolate}
              sameScale={sameScale}
              yaw={yaw}
              onSelect={select}
            />
          </Suspense>
        ) : (
          <div className="workbench-static">
            {records.map((record, i) => (
              <SequenceSVG
                key={record.slug}
                geometry={geometries[i]}
                tint={i ? '#ff762e' : '#edff59'}
                className="w-full h-full"
                label
              />
            ))}
          </div>
        )}
        <p className="workbench-model-note">
          {allowed
            ? 'Drag to rotate; sequence buttons are the keyboard alternative.'
            : 'Static sequence illustration. Use the labeled sequence controls below.'}
        </p>
      </div>
      {compare && (
        <p className="workbench-comparison-note">
          {allowed && isolate
            ? 'The selected residue beads are enlarged equally for inspection, not shown at the whole-chain scale.'
            : allowed && sameScale
              ? 'Both drawings use the same model-unit scale in a shared perspective view.'
              : 'Each illustration is fitted independently to its panel.'}{' '}
          These sequence-derived illustrations are not measured structures. This is not a
          physical-size measurement, structural alignment, or comparison of effects.{' '}
          {records[0].sequence?.length} vs {records[1].sequence?.length} amino-acid residues.
        </p>
      )}
      <div className={`workbench-readouts ${compare ? 'is-compare' : ''}`}>
        {records.map((record, side) => {
          const g = geometries[side],
            residue = g.residues[selected[side]],
            prov = provenanceText(record)
          return (
            <section key={side}>
              <div className="workbench-record-heading">
                <h2>{displayName(record)}</h2>
                <Link to="/compound/$slug" params={{ slug: record.slug }}>
                  Identity & sources ↗
                </Link>
              </div>
              <p className="workbench-provenance">{prov.primary}</p>
              <div className="sequence-selector" aria-label={`${displayName(record)} sequence`}>
                {g.residues.map((r, index) => (
                  <button
                    key={index}
                    aria-label={`Example ${side + 1}: ${r.name} at position ${index + 1}`}
                    aria-pressed={selected[side] === index}
                    onClick={() => select(side, index)}
                  >
                    <small>{index + 1}</small>
                    <b>{r.code}</b>
                  </button>
                ))}
              </div>
              <div className="residue-readout" aria-live="polite">
                <strong>
                  {residue?.name} <span>position {selected[side] + 1}</span>
                </strong>
                <p>
                  {!allowed
                    ? 'The selected block’s name and position are shown here.'
                    : isolate
                      ? 'Only this building block is shown in the 3D drawing.'
                      : 'The selected block is highlighted in the 3D drawing.'}{' '}
                  The bead represents a residue in a chain, not its individual atoms. Its display
                  color is a visual aid.
                </p>
              </div>
              <details>
                <summary>How was this model made?</summary>
                <p>
                  {prov.primary}. The chain comes from the record’s listed sequence and
                  modifications. No deposited three-dimensional coordinates are used for these
                  selected examples. Bending and spacing are drawing choices, not predicted folding
                  or biological activity.
                </p>
                <Link to="/compound/$slug" params={{ slug: record.slug }}>
                  Read this record’s sources and limitations ↗
                </Link>
              </details>
            </section>
          )
        })}
      </div>
      <aside className="workbench-reading">
        <h2>Same letters. Different questions.</h2>
        <p>
          A sequence tells you the order of the building blocks. A structural experiment asks where
          those blocks sit in space. Neither a drawing nor a shared sequence tells you whether
          something works in people.
        </p>
        <a
          href="https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/primary-sequences"
          target="_blank"
          rel="noreferrer"
        >
          Learn about sequences at RCSB PDB-101 ↗
        </a>
        <Link to="/compare" search={{ a: slugs[0], b: slugs[1] }}>
          Open the detailed identity comparison ↗
        </Link>
        <Link to="/learn">Try a hands-on challenge ↗</Link>
      </aside>
    </div>
  )
}
