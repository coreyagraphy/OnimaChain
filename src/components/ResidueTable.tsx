import { CLASS_COLORS, type ChainGeometry } from '~/scenes/chain/geometry'
import { HOTSPOT_RULES } from '~/scenes/chain/hotspots'

export function ResidueTable({ geometry }: { geometry: ChainGeometry }) {
  if (geometry.placeholder) {
    return (
      <div className="panel p-6 text-sm text-bone/70">
        <p className="label mb-2">Residues</p>
        <p>Sequence pending verification. The residue table is generated only from a verified one-letter sequence.</p>
      </div>
    )
  }
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data">
          <thead>
            <tr className="label">
              <th>#</th>
              <th>Code</th>
              <th>Residue</th>
              <th>Class</th>
              <th>Chirality</th>
              <th>Features</th>
            </tr>
          </thead>
          <tbody>
            {geometry.residues.map((r) => (
              <tr key={r.index}>
                <td className="mono text-bone/60">{r.pos}</td>
                <td className="mono">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle" style={{ background: CLASS_COLORS[r.cls] }} />
                  {r.nonStandard ?? r.code}
                </td>
                <td>{r.name}</td>
                <td className="capitalize text-bone/70">{r.cls}</td>
                <td className="mono text-bone/70">{r.chirality}</td>
                <td className="text-bone/70">
                  {r.hotspots.filter((h) => h !== 'glycine').map((h) => (
                    <span key={h} className="inline-block mr-2 px-2 py-0.5 rounded-full text-[11px]" style={{ border: `1px solid ${HOTSPOT_RULES[h].color}66`, color: HOTSPOT_RULES[h].color }}>
                      {HOTSPOT_RULES[h].title}
                    </span>
                  ))}
                  {r.code === 'G' && <span className="text-bone/40 text-[11px]">flexible</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
